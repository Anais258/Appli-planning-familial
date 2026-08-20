import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { TopBar } from "../src/components/TopBar";
import { RecurringIcon } from "../src/components/icons";
import { useMembers, useTasks } from "../src/hooks/useApi";
import { WEEKDAYS_SHORT } from "../src/lib/weekdays";
import { color, space } from "../src/theme/tokens";

export default function RecurringTasksScreen() {
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const recurring = tasks.filter((t) => t.recurring).sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="Tâches récurrentes" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[2] }} showsVerticalScrollIndicator={false}>
        <Text tone="muted" size={13} style={{ marginBottom: space[2] }}>
          Tape sur une tâche pour la modifier ou la supprimer.
        </Text>

        {recurring.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <RecurringIcon size={22} color={color.neutral600} />
            <Text tone="muted" size={13} center style={{ marginTop: space[2] }}>
              Aucune tâche récurrente pour l'instant.
            </Text>
          </Card>
        )}

        {recurring.map((task) => {
          const assignedNames = task.memberIds
            .map((id) => members.find((m) => m.id === id)?.name)
            .filter((n): n is string => !!n);
          return (
            <Pressable key={task.id} onPress={() => router.push(`/task/${task.id}`)}>
              <Card row style={{ alignItems: "center" }}>
                <RecurringIcon size={13} color={color.accent400} />
                <View style={{ flex: 1, marginLeft: space[2] }}>
                  <Text size={14} weight="medium">
                    {task.title}
                  </Text>
                  <Text size={11.5} tone="faint">
                    {WEEKDAYS_SHORT[task.weekday]} · {task.time} · {task.category}
                    {task.reminder ? " · Rappel" : ""}
                    {assignedNames.length > 0 ? ` · ${assignedNames.join(", ")}` : ""}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
