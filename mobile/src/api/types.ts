export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
}

export type Tint = "accent" | "neutral" | "accent2";

export interface Member {
  id: string;
  userId: string;
  name: string;
  initials: string;
  tint: Tint;
  age: number | null;
  order: number;
}

export type Category = "École" | "Travail" | "Maison" | "Santé" | "Loisirs";
export type Priority = "high" | "medium" | "low";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Task {
  id: string;
  title: string;
  category: Category;
  weekday: Weekday;
  date: string;
  time: string;
  duration: number;
  priority: Priority;
  deadlineWeekday: Weekday | null;
  recurring: boolean;
  flexible: boolean;
  synced: boolean;
  notes: string;
  memberIds: string[];
  externalProvider: string | null;
}

export type TaskInput = Partial<Omit<Task, "id" | "date" | "externalProvider">> & {
  title: string;
  category: Category;
  weekday: Weekday;
  time: string;
};

export interface Constraints {
  userId: string;
  sleepStart: string;
  sleepEnd: string;
  lunchStart: string;
  lunchEnd: string;
  dndStart: string;
  dndEnd: string;
}

export interface ReplanCandidate {
  weekday: Weekday;
  time: string;
  score: number;
  reason: string;
}

export interface AutoSlotResult {
  weekday: Weekday;
  time: string;
  reasons: string[];
}

export interface ReplanProposal {
  taskId: string;
  title: string;
  currentWeekday: Weekday;
  currentTime: string;
  candidates: ReplanCandidate[];
}

export interface Notification {
  id: string;
  title: string;
  unread: boolean;
  createdAt: string;
  group: "today" | "week";
}

export interface SharedPerson {
  id: string;
  userId: string;
  name: string;
  role: string;
}

export interface CalendarConnection {
  provider: "google" | "outlook" | "apple";
  email: string | null;
}

export interface CalendarStatus {
  connections: CalendarConnection[];
  googleConfigured: boolean;
  microsoftConfigured: boolean;
}
