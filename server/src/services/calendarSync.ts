import { prisma } from "../db";
import { deleteGoogleEvent, upsertGoogleEvent } from "./googleCalendar";
import { deleteOutlookEvent, upsertOutlookEvent } from "./outlookCalendar";
import type { CalendarEventInput } from "./googleCalendar";
import type { Task } from "@prisma/client";

/**
 * Pushes a task marked `synced` to whichever cloud provider the user
 * connected. Apple is intentionally excluded here — that sync path writes
 * straight to the device's local calendar from the mobile app (expo-calendar
 * / EventKit), which this server has no access to.
 */
export async function syncTaskToCalendar(task: Task): Promise<{ externalEventId: string | null; externalProvider: string | null }> {
  if (!task.synced) return { externalEventId: null, externalProvider: null };

  const connection = await prisma.calendarConnection.findFirst({
    where: { userId: task.userId, provider: { in: ["google", "outlook"] } },
  });
  if (!connection || !connection.refreshToken) return { externalEventId: null, externalProvider: null };

  const start = combineDateAndTime(task.date, task.time);
  const end = new Date(start.getTime() + task.duration * 60_000);
  const input: CalendarEventInput = {
    title: task.title,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    notes: task.notes,
    recurring: task.recurring,
  };

  const existingId = task.externalProvider === connection.provider ? task.externalEventId : null;
  const eventId =
    connection.provider === "google"
      ? await upsertGoogleEvent(connection.refreshToken, existingId, input)
      : await upsertOutlookEvent(connection.refreshToken, existingId, input);

  return { externalEventId: eventId, externalProvider: connection.provider };
}

export async function unsyncTaskFromCalendar(task: Task): Promise<void> {
  if (!task.externalEventId || !task.externalProvider) return;
  const connection = await prisma.calendarConnection.findFirst({ where: { userId: task.userId, provider: task.externalProvider } });
  if (!connection?.refreshToken) return;
  if (task.externalProvider === "google") await deleteGoogleEvent(connection.refreshToken, task.externalEventId);
  else if (task.externalProvider === "outlook") await deleteOutlookEvent(connection.refreshToken, task.externalEventId);
}

function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}
