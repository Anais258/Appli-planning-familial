import { useMemo, useState } from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { WeekStrip } from "../../src/components/WeekStrip";
import { TaskCard } from "../../src/components/TaskCard";
import { Avatar } from "../../src/components/Avatar";
import { ReshuffleIcon, CalendarIcon } from "../../src/components/icons";
import { useMembers, useTasks } from "../../src/hooks/useApi";
import { useAuthStore } from "../../src/state/authStore";
import { color, space } from "../../src/theme/tokens";
import { todayWeekday, WEEKDAYS_FULL } from "../../src/lib/weekdays";
import type { Weekday } from "../../src/api/types";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const today = todayWeekday();
  const [selected, setSelected] = useState<Weekday>(today);
  const { data: tasks = [], isLoading, refetch, isRefetching } = useTasks();
  const { data: members = [] } = useMembers();

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.weekday === selected).sort((a, b) => a.time.localeCompare(b.time)),
    [tasks, selected]
  );

  const flexibleCount = tasks.filter((t) => t.flexible).length;

  return (
    <Screen techGrid refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={color.accent} />}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text heading weight="semibold" size={20}>
            Salut, {user?.name?.split(" ")[0] ?? ""} 👋
          </Text>
        </View>
        <Avatar initials={user?.initials ?? ""} bg={color.accent800} fg={color.accent100} size={38} />
      </View>

      <WeekStrip selected={selected} onSelect={setSelected} today={today} />

      {flexibleCount > 0 && (
        <Card row style={{ alignItems: "center", backgroundColor: color.accent900 }}>
          <ReshuffleIcon size={16} color={color.accent200} />
          <Text size={13} style={{ flex: 1, marginLeft: space[2] }}>
            {flexibleCount} tâche{flexibleCount > 1 ? "s" : ""} flexible{flexibleCount > 1 ? "s" : ""} — Passerelle peut réajuster votre semaine.
          </Text>
          <Button label="Replanifier" variant="ghost" onPress={() => router.push("/replan")} />
        </Card>
      )}

      <View style={{ gap: space[2] }}>
        <Text weight="medium" size={14} tone="muted">
          {WEEKDAYS_FULL[selected]}
        </Text>
        {!isLoading && dayTasks.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[6] }}>
            <CalendarIcon size={26} color={color.neutral600} />
            <Text tone="muted" size={13} center>
              Rien de prévu ce jour-là.
            </Text>
          </Card>
        )}
        {dayTasks.map((task) => (
          <TaskCard key={task.id} task={task} members={members} />
        ))}
      </View>
    </Screen>
  );
}
