import { ScrollView, Pressable, View } from "react-native";
import { Text } from "./Text";
import { color, radius } from "../theme/tokens";
import { WEEKDAYS_SHORT } from "../lib/weekdays";
import type { Weekday } from "../api/types";

export function WeekStrip({ selected, onSelect, today }: { selected: Weekday; onSelect: (w: Weekday) => void; today: Weekday }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {WEEKDAYS_SHORT.map((label, i) => {
        const w = i as Weekday;
        const isSelected = w === selected;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(w)}
            style={{
              width: 46,
              paddingVertical: 10,
              borderRadius: radius.md,
              alignItems: "center",
              gap: 4,
              backgroundColor: isSelected ? color.accent800 : color.surface,
            }}
          >
            <Text size={11} weight="medium" style={{ color: isSelected ? color.accent100 : color.neutral500 }}>
              {label}
            </Text>
            {w === today && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? color.accent100 : color.accent }} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
