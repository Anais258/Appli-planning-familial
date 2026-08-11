import { google } from "googleapis";
import { env, isGoogleConfigured } from "../env";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/userinfo.email"];

export function googleOAuthClient() {
  return new google.auth.OAuth2(env.google.clientId, env.google.clientSecret, env.google.redirectUri);
}

export function getGoogleAuthUrl(state: string): string {
  const client = googleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeGoogleCode(code: string) {
  const client = googleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data } = await oauth2.userinfo.get();
  return {
    accessToken: tokens.access_token ?? null,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    email: data.email ?? null,
  };
}

function clientFor(refreshToken: string) {
  const client = googleOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export interface CalendarEventInput {
  title: string;
  startISO: string;
  endISO: string;
  notes?: string;
  recurring?: boolean; // weekly, on the same weekday as startISO
}

export async function upsertGoogleEvent(refreshToken: string, existingEventId: string | null, input: CalendarEventInput): Promise<string> {
  if (!isGoogleConfigured()) throw new Error("Google Calendar is not configured on the server (missing GOOGLE_CLIENT_ID/SECRET)");
  const calendar = google.calendar({ version: "v3", auth: clientFor(refreshToken) });
  const requestBody = {
    summary: input.title,
    description: input.notes || undefined,
    start: { dateTime: input.startISO },
    end: { dateTime: input.endISO },
    recurrence: input.recurring ? ["RRULE:FREQ=WEEKLY"] : undefined,
  };
  if (existingEventId) {
    const { data } = await calendar.events.update({ calendarId: "primary", eventId: existingEventId, requestBody });
    return data.id!;
  }
  const { data } = await calendar.events.insert({ calendarId: "primary", requestBody });
  return data.id!;
}

export async function deleteGoogleEvent(refreshToken: string, eventId: string): Promise<void> {
  const calendar = google.calendar({ version: "v3", auth: clientFor(refreshToken) });
  await calendar.events.delete({ calendarId: "primary", eventId }).catch((e) => {
    if (e?.code !== 404 && e?.code !== 410) throw e;
  });
}
