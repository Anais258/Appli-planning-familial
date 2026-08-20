import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "./Text";
import { Card } from "./Card";
import { Tag } from "./Tag";
import { AvatarStack } from "./Avatar";
import { ClockIcon, RecurringIcon } from "./icons";
import { color, space } from "../theme/tokens";
import { categoryTagVariant, formatDuration } from "../lib/weekdays";
import type { Member, Task } from "../api/types";

export function TaskCard({ task, members }: { task: Task; members: Member[] }) {
  const assigned = task.memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is Member => !!m)
    .map((m) => ({
      initials: m.initials,
      bg: m.tint === "neutral" ? color.neutral700 : color.accent800,
      fg: m.tint === "neutral" ? color.neutral100 : color.accent100,
    }));

  return (
    <Pressable onPress={() => router.push(`/task/${task.id}`)}>
      <Card
        row
        style={{
          alignItems: "center",
          ...(task.recurring ? { borderWidth: 1, borderStyle: "dashed", borderColor: color.accent700 } : null),
        }}
      >
        <View style={{ width: 52, gap: 3 }}>
          <Text mono size={13} weight="medium">
            {task.time}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <ClockIcon size={9} color={color.neutral500} />
            <Text size={10.5} tone="faint" mono>
              {formatDuration(task.duration)}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {task.recurring && <RecurringIcon size={11} color={color.accent400} />}
            <Text weight="medium" size={14} numberOfLines={1} style={{ flexShrink: 1 }}>
              {task.title}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: space[2], alignItems: "center" }}>
            <Tag label={task.category} variant={categoryTagVariant(task.category)} />
            {task.priority === "high" && <Tag label="Priorité haute" variant="outline" />}
          </View>
        </View>

        {assigned.length > 0 && <AvatarStack avatars={assigned} size={22} />}
      </Card>
    </Pressable>
  );
}
