import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calendarApi, constraintsApi, membersApi, notificationsApi, shareApi, tasksApi } from "../api/resources";
import type { TaskInput, Tint } from "../api/types";
import { useAuthStore } from "../state/authStore";

function useEnabled() {
  return !!useAuthStore((s) => s.accessToken);
}

export function useMembers() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["members"], queryFn: () => membersApi.list().then((r) => r.members), enabled });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; initials?: string; tint?: Tint; age?: number | null }) => membersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; initials: string; tint: Tint; age: number | null }> }) =>
      membersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useTasks() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["tasks"], queryFn: () => tasksApi.list().then((r) => r.tasks), enabled });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskInput> }) => tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useReplanProposals(enabledExtra = true) {
  const enabled = useEnabled() && enabledExtra;
  return useQuery({ queryKey: ["replan"], queryFn: () => tasksApi.replanProposals().then((r) => r.proposals), enabled });
}

export function useConstraints() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["constraints"], queryFn: () => constraintsApi.get().then((r) => r.constraints), enabled });
}

export function useUpdateConstraints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: constraintsApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["constraints"] }),
  });
}

export function useNotifications() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list().then((r) => r.notifications), enabled });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useShare() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["share"], queryFn: () => shareApi.get(), enabled });
}

export function useInvitePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; role?: string }) => shareApi.invite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["share"] }),
  });
}

export function useRemoveSharedPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shareApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["share"] }),
  });
}

export function useCalendarStatus() {
  const enabled = useEnabled();
  return useQuery({ queryKey: ["calendar-status"], queryFn: () => calendarApi.status(), enabled });
}

export function useDisconnectCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => calendarApi.disconnect(provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-status"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
