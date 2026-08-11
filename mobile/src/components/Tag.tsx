import { View } from "react-native";
import { Text } from "./Text";
import { color, radius } from "../theme/tokens";

type Variant = "accent" | "neutral" | "outline";

const variants: Record<Variant, { bg?: string; fg: string; border?: string }> = {
  accent: { bg: color.accent800, fg: color.accent100 },
  neutral: { bg: color.neutral800, fg: color.neutral100 },
  outline: { fg: color.accent, border: color.accent },
};

export function Tag({ label, variant = "outline" }: { label: string; variant?: Variant }) {
  const v = variants[variant];
  return (
    <View
      style={{
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: radius.md * 0.75,
        backgroundColor: v.bg,
        borderWidth: v.border ? 1 : 0,
        borderColor: v.border,
      }}
    >
      <Text size={11} style={{ color: v.fg, letterSpacing: 0.2 }}>
        {label}
      </Text>
    </View>
  );
}
