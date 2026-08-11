import { Pressable, ViewStyle } from "react-native";
import { Text } from "./Text";
import { color, radius } from "../theme/tokens";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
  mono?: boolean;
  squareRadius?: boolean;
  style?: ViewStyle;
}

// The selectable pill used for day/duration/priority/deadline/category/filter
// choices — selected state is the accent-800 tint, matching every `h.style`/
// `c.style` selection block in the DC templates (chips go square-cornered in
// the "data-grid" direction, radius-md not full pill).
export function Chip({ label, selected, onPress, size = "md", mono, squareRadius = true, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: size === "sm" ? 5 : 7,
          paddingHorizontal: size === "sm" ? 10 : 14,
          borderRadius: squareRadius ? radius.md : 999,
          backgroundColor: selected ? color.accent800 : color.surface,
        },
        style,
      ]}
    >
      <Text size={size === "sm" ? 11.5 : 13} mono={mono} style={{ color: selected ? color.accent100 : color.neutral400 }}>
        {label}
      </Text>
    </Pressable>
  );
}
