import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Card } from "../../src/components/Card";
import { Tag } from "../../src/components/Tag";
import { TopBar } from "../../src/components/TopBar";
import { Avatar } from "../../src/components/Avatar";
import { CalendarIcon, ClockIcon, DeadlineIcon } from "../../src/components/icons";
import { useDeleteTask, useMembers, useTasks } from "../../src/hooks/useApi";
import { useToastStore } from "../../src/state/toastStore";
import { color, space } from "../../src/theme/tokens";
import { categoryTagVariant, formatDuration, priorityLabel, WEEKDAYS_FULL } from "../../src/lib/weekdays";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const deleteTask = useDeleteTask();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <Screen scroll={false}>
        <TopBar title="Tâche" onBack={() => router.back()} />
        <Text tone="muted" style={{ padding: 18 }}>
          Cette tâche n'existe plus.
        </Text>
      </Screen>
    );
  }

  const assigned = task.memberIds.map((mid) => members.find((m) => m.id === mid)).filter((m): m is NonNullable<typeof m> => !!m);

  function onDelete() {
    Alert.alert("Supprimer la tâche", `Supprimer « ${task!.title} » ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteTask.mutate(task!.id, {
            onSuccess: () => {
              useToastStore.getState().show("Tâche supprimée.");
              router.back();
            },
          });
        },
      },
    ]);
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title={task.title} onBack={() => router.back()} onEdit={() => router.push(`/task/new?edit=${task.id}`)} onDelete={onDelete} />
      <View style={{ padding: 18, gap: space[4] }}>
        <View style={{ flexDirection: "row", gap: space[2] }}>
          <Tag label={task.category} variant={categoryTagVariant(task.category)} />
          {task.priority === "high" && <Tag label={priorityLabel(task.priority)} variant="outline" />}
          {task.recurring && <Tag label="Récurrente" variant="neutral" />}
          {task.flexible && <Tag label="Flexible" variant="neutral" />}
        </View>

        <Card style={{ gap: space[3] }}>
          <Row icon={<CalendarIcon size={16} color={color.neutral400} />} label={WEEKDAYS_FULL[task.weekday]} />
          <Row icon={<ClockIcon size={16} color={color.neutral400} />} label={`${task.time} · ${formatDuration(task.duration)}`} />
          {task.deadlineWeekday !== null && (
            <Row icon={<DeadlineIcon size={16} color={color.neutral400} />} label={`Échéance : ${WEEKDAYS_FULL[task.deadlineWeekday]}`} />
          )}
        </Card>

        {assigned.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Assigné à
            </Text>
            <View style={{ flexDirection: "row", gap: space[2] }}>
              {assigned.map((m) => (
                <View key={m.id} style={{ alignItems: "center", gap: 4 }}>
                  <Avatar initials={m.initials} bg={m.tint === "neutral" ? color.neutral700 : color.accent800} fg={m.tint === "neutral" ? color.neutral100 : color.accent100} size={32} />
                  <Text size={11} tone="muted">
                    {m.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {task.notes ? (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Notes
            </Text>
            <Text size={14}>{task.notes}</Text>
          </View>
        ) : null}

        {task.synced && (
          <Text size={12} tone="faint">
            Synchronisée avec {task.externalProvider === "outlook" ? "Outlook" : task.externalProvider === "apple" ? "Apple Calendar" : "Google Calendar"}
          </Text>
        )}
      </View>
    </Screen>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
      {icon}
      <Text size={14}>{label}</Text>
    </View>
  );
}
