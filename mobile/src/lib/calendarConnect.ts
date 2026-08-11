import * as WebBrowser from "expo-web-browser";
import * as Calendar from "expo-calendar";
import { API_URL } from "../api/client";
import { calendarApi } from "../api/resources";
import { useAuthStore } from "../state/authStore";

// Google/Microsoft go through the server's OAuth round-trip: the browser
// can't carry an Authorization header, so the access token rides along as a
// query param on /start and the server redirects back to the app's
// "passerelle://calendar-connected" deep link when the exchange finishes
// (see app/server/src/routes/calendar.ts).
export async function startOAuthConnect(provider: "google" | "microsoft"): Promise<{ ok: boolean }> {
  const { accessToken } = useAuthStore.getState();
  const url = `${API_URL}/calendar/${provider}/start?token=${encodeURIComponent(accessToken ?? "")}`;
  const result = await WebBrowser.openAuthSessionAsync(url, "passerelle://calendar-connected");
  if (result.type !== "success") return { ok: false };
  return { ok: /[?&]status=connected/.test(result.url) };
}

// Apple has no OAuth: the app writes directly to the on-device calendar via
// expo-calendar, and this just records the connection server-side so
// GET /calendar/status stays consistent across all three providers.
export async function connectAppleCalendar(): Promise<{ ok: boolean; reason?: string }> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return { ok: false, reason: "Autorisation calendrier refusée." };
  await calendarApi.connectApple();
  return { ok: true };
}
