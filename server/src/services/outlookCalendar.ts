import { ConfidentialClientApplication } from "@azure/msal-node";
import { env, isMicrosoftConfigured } from "../env";
import type { CalendarEventInput } from "./googleCalendar";

const SCOPES = ["Calendars.ReadWrite", "User.Read", "offline_access"];
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

function msalClient() {
  return new ConfidentialClientApplication({
    auth: {
      clientId: env.microsoft.clientId,
      clientSecret: env.microsoft.clientSecret,
      authority: `https://login.microsoftonline.com/${env.microsoft.tenantId}`,
    },
  });
}

export function getMicrosoftAuthUrl(state: string): Promise<string> {
  return msalClient().getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: env.microsoft.redirectUri,
    state,
  });
}

export async function exchangeMicrosoftCode(code: string) {
  const client = msalClient();
  const result = await client.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: env.microsoft.redirectUri,
  });
  if (!result) throw new Error("Microsoft token exchange failed");
  // MSAL Node doesn't return the refresh token from acquireTokenByCode directly
  // (it expects you to keep using its cache) — but we need to persist a raw
  // refresh token ourselves so later syncs work outside of MSAL's in-memory
  // cache. Pull it out of the serialized token cache.
  const refreshToken = extractRefreshTokenFromCache(client);
  return {
    accessToken: result.accessToken,
    refreshToken,
    expiresAt: result.expiresOn,
    email: result.account?.username ?? null,
  };
}

function extractRefreshTokenFromCache(client: ConfidentialClientApplication): string | null {
  try {
    const cache = JSON.parse(client.getTokenCache().serialize());
    const entries = Object.values(cache.RefreshToken ?? {}) as Array<{ secret: string }>;
    return entries[0]?.secret ?? null;
  } catch {
    return null;
  }
}

async function refreshedAccessToken(refreshToken: string): Promise<string> {
  if (!isMicrosoftConfigured()) throw new Error("Outlook is not configured on the server (missing MICROSOFT_CLIENT_ID/SECRET)");
  const result = await msalClient().acquireTokenByRefreshToken({
    refreshToken,
    scopes: SCOPES,
  });
  if (!result?.accessToken) throw new Error("Failed to refresh Microsoft access token");
  return result.accessToken;
}

async function graphFetch(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text().catch(() => "");
    throw new Error(`Microsoft Graph ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`);
  }
  return res;
}

export async function upsertOutlookEvent(refreshToken: string, existingEventId: string | null, input: CalendarEventInput): Promise<string> {
  const accessToken = await refreshedAccessToken(refreshToken);
  const body = {
    subject: input.title,
    body: { contentType: "text", content: input.notes || "" },
    start: { dateTime: input.startISO, timeZone: "UTC" },
    end: { dateTime: input.endISO, timeZone: "UTC" },
    recurrence: input.recurring
      ? {
          pattern: { type: "weekly", interval: 1, daysOfWeek: [new Date(input.startISO).toLocaleDateString("en-US", { weekday: "long" })] },
          range: { type: "noEnd", startDate: input.startISO.slice(0, 10) },
        }
      : undefined,
  };
  if (existingEventId) {
    const res = await graphFetch(accessToken, `/me/events/${existingEventId}`, { method: "PATCH", body: JSON.stringify(body) });
    if (res.status === 404) return createOutlookEvent(accessToken, body);
    const data = (await res.json()) as { id: string };
    return data.id;
  }
  return createOutlookEvent(accessToken, body);
}

async function createOutlookEvent(accessToken: string, body: unknown): Promise<string> {
  const res = await graphFetch(accessToken, "/me/events", { method: "POST", body: JSON.stringify(body) });
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function deleteOutlookEvent(refreshToken: string, eventId: string): Promise<void> {
  const accessToken = await refreshedAccessToken(refreshToken);
  await graphFetch(accessToken, `/me/events/${eventId}`, { method: "DELETE" });
}
