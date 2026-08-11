import type { Weekday } from "../api/types";

// 0=Lun ... 6=Dim — matches the server's convention (app/server/src/lib/dates.ts).
export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export const WEEKDAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

export function jsDayToWeekday(jsDay: number): Weekday {
  return (((jsDay + 6) % 7) as Weekday);
}

export function todayWeekday(): Weekday {
  return jsDayToWeekday(new Date().getDay());
}

export function categoryTagVariant(category: string): "accent" | "neutral" | "outline" {
  switch (category) {
    case "École":
      return "accent";
    case "Santé":
      return "outline";
    default:
      return "neutral";
  }
}

export function priorityLabel(priority: string): string {
  switch (priority) {
    case "high":
      return "Priorité haute";
    case "medium":
      return "Priorité moyenne";
    default:
      return "Priorité basse";
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
