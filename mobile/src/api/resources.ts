import { api } from "./client";
import type {
  AutoSlotResult,
  CalendarStatus,
  Constraints,
  Member,
  Notification,
  Priority,
  ReplanProposal,
  SharedPerson,
  Task,
  TaskInput,
  Tint,
  Weekday,
} from "./types";

export const membersApi = {
  list: () => api.get<{ members: Member[] }>("/members"),
  create: (data: { name: string; initials?: string; tint?: Tint; age?: number | null }) =>
    api.post<{ member: Member }>("/members", data),
  update: (id: string, data: Partial<{ name: string; initials: string; tint: Tint; age: number | null }>) =>
    api.patch<{ member: Member }>(`/members/${id}`, data),
  remove: (id: string) => api.delete<void>(`/members/${id}`),
};

export const tasksApi = {
  list: () => api.get<{ tasks: Task[] }>("/tasks"),
  create: (data: TaskInput) => api.post<{ task: Task }>("/tasks", data),
  update: (id: string, data: Partial<TaskInput>) => api.patch<{ task: Task }>(`/tasks/${id}`, data),
  remove: (id: string) => api.delete<void>(`/tasks/${id}`),
  replanProposals: () => api.get<{ proposals: ReplanProposal[] }>("/tasks/replan/proposals"),
  autoSlot: (data: { priority: Priority; deadlineWeekday: Weekday | null; memberIds: string[] }) =>
    api.post<AutoSlotResult>("/tasks/auto-slot", data),
};

export const constraintsApi = {
  get: () => api.get<{ constraints: Constraints }>("/constraints"),
  update: (data: Partial<Pick<Constraints, "sleepStart" | "sleepEnd" | "lunchStart" | "lunchEnd" | "dndStart" | "dndEnd">>) =>
    api.patch<{ constraints: Constraints }>("/constraints", data),
};

export const notificationsApi = {
  list: () => api.get<{ notifications: Notification[] }>("/notifications"),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>("/notifications/read-all"),
};

export const shareApi = {
  get: () => api.get<{ shareToken: string; sharedWith: SharedPerson[] }>("/share"),
  invite: (data: { name: string; role?: string }) => api.post<{ person: SharedPerson }>("/share/people", data),
  remove: (id: string) => api.delete<void>(`/share/people/${id}`),
};

export const calendarApi = {
  status: () => api.get<CalendarStatus>("/calendar/status"),
  disconnect: (provider: string) => api.delete<void>(`/calendar/${provider}`),
  connectApple: () => api.post<{ connection: { provider: string } }>("/calendar/apple/connect"),
};
