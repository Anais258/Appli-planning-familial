// Smart scheduling engine for "Replanifier ma semaine".
// Ported 1:1 from the Claude Design prototype (design source file —
// scoreCandidate/getProposals), keeping the same weighting so the proposals
// a real user gets match what was designed/approved: priority x deadline x
// day-load x recurring constraints (sleep/lunch/do-not-disturb).
//
// Weekdays here are 0=Lun..6=Dim to match FR display order, not JS's
// Sun-first Date#getDay().

export const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const TIME_POOL = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const MORNING = new Set(["08:00", "09:00", "10:00", "11:00"]);
const MIDDAY = new Set(["12:00", "14:00", "15:00", "16:00"]);
const EVENING = new Set(["17:00", "18:00", "19:00", "20:00"]);

export type Priority = "high" | "medium" | "low";

export interface Constraints {
  sleepStart: string;
  sleepEnd: string;
  lunchStart: string;
  lunchEnd: string;
  dndStart: string;
  dndEnd: string;
}

export interface SchedulableTask {
  id: string;
  weekday: Weekday;
  time: string;
  priority: Priority;
  deadlineWeekday: Weekday | null;
  memberIds: string[];
}

export interface Candidate {
  weekday: Weekday;
  time: string;
  score: number;
  reasons: string[];
}

function toMin(t: string): number {
  const [h, m] = (t || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
}

function inRange(min: number, start: string, end: string): boolean {
  const s = toMin(start);
  const e = toMin(end);
  if (s <= e) return min >= s && min < e;
  return min >= s || min < e;
}

export function scoreCandidate(
  weekday: Weekday,
  time: string,
  task: SchedulableTask,
  allTasks: SchedulableTask[],
  constraints: Constraints
): Candidate | null {
  const tMin = toMin(time);
  if (inRange(tMin, constraints.lunchStart, constraints.lunchEnd)) return null;
  if (inRange(tMin, constraints.dndStart, constraints.dndEnd)) return null;
  if (inRange(tMin, constraints.sleepStart, constraints.sleepEnd)) return null;
  if (task.deadlineWeekday != null && weekday > task.deadlineWeekday) return null;

  const memberIds = task.memberIds;
  const conflict = allTasks.some(
    (t) => t.id !== task.id && t.weekday === weekday && t.time === time && t.memberIds.some((m) => memberIds.includes(m))
  );
  if (conflict) return null;

  let score = 0;
  const reasons: string[] = [];
  const priority = task.priority || "medium";
  if (priority === "high" && MORNING.has(time)) {
    score += 3;
    reasons.push("Créneau de concentration le matin — adapté à une tâche prioritaire.");
  } else if (priority === "low" && EVENING.has(time)) {
    score += 3;
    reasons.push("Tâche légère placée en fin de journée.");
  } else if (priority === "medium" && MIDDAY.has(time)) {
    score += 2;
    reasons.push("Énergie moyenne, créneau de milieu de journée.");
  } else {
    score += 0.5;
  }

  if (task.deadlineWeekday != null) {
    const daysUntil = task.deadlineWeekday - weekday;
    score += Math.max(0, 3 - daysUntil);
    if (daysUntil <= 1) reasons.push(`Respecte l'échéance (${WEEKDAYS[task.deadlineWeekday]}).`);
  }
  const loadOnDay = allTasks.filter((t) => t.id !== task.id && t.weekday === weekday).length;
  score += Math.max(0, 2 - loadOnDay);
  if (loadOnDay === 0) reasons.push("Journée encore dégagée.");
  reasons.push("Respecte la pause déjeuner et les plages de repos.");
  reasons.push("Aucun conflit avec le planning existant.");
  return { weekday, time, score, reasons };
}

export function getProposals(task: SchedulableTask, allTasks: SchedulableTask[], constraints: Constraints, limit = 3): Candidate[] {
  const candidates: Candidate[] = [];
  for (let weekday = 0 as Weekday; weekday <= 6; weekday++) {
    for (const time of TIME_POOL) {
      const c = scoreCandidate(weekday as Weekday, time, task, allTasks, constraints);
      if (c) candidates.push(c);
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const seenDays = new Set<number>();
  const top: Candidate[] = [];
  for (const c of candidates) {
    if (seenDays.has(c.weekday)) continue;
    seenDays.add(c.weekday);
    top.push(c);
    if (top.length === limit) break;
  }
  return top;
}
