// Weekday convention across the app: 0=Lun ... 6=Dim (matches the FR weekly
// strip), independent from JS Date#getDay() (0=Sun).
import { Weekday } from "./scheduling";

export function jsDayToWeekday(jsDay: number): Weekday {
  return ((jsDay + 6) % 7) as Weekday;
}

export function weekdayToJsDay(weekday: Weekday): number {
  return (weekday + 1) % 7;
}

export function mondayOfWeek(d: Date): Date {
  const monday = new Date(d);
  const delta = (d.getDay() + 6) % 7; // days since Monday
  monday.setDate(d.getDate() - delta);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** The date for `weekday` in the week containing `reference` (default: now). */
export function dateForWeekday(weekday: Weekday, reference: Date = new Date()): Date {
  const monday = mondayOfWeek(reference);
  const d = new Date(monday);
  d.setDate(monday.getDate() + weekday);
  return d;
}

export function weekdayOfDate(d: Date): Weekday {
  return jsDayToWeekday(d.getDay());
}
