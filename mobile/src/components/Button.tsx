import { ActivityIndicator, Pressable, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { Text } from "./Text";
import { color, radius, space } from "../theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "icon";

interface Props {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// Primary actions are an accent outline, never a filled button — Nocturne's
// "Do: Outline primary actions" rule.
export function Button({ label, onPress, variant = "secondary", block, disabled, loading, icon, style, accessibilityLabel }: Props) {
  const isIcon = variant === "icon";
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingVertical: isIcon ? 0 : space[2],
          paddingHorizontal: isIcon ? 0 : space[3] * 1.2,
          width: isIcon ? 36 : block ? "100%" : undefined,
          height: isIcon ? 36 : undefined,
          borderRadius: radius.md,
          borderWidth: variant === "ghost" ? 0 : 1,
          borderColor: variant === "primary" ? color.accent : variant === "secondary" || isIcon ? color.divider : "transparent",
          backgroundColor: pressed
            ? variant === "primary"
              ? "rgba(34,211,238,0.22)"
              : variant === "secondary" || isIcon
              ? "rgba(233,233,237,0.14)"
              : "transparent"
            : "transparent",
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? color.accent : color.text} />
      ) : (
        <>
          {icon}
          {label ? (
            <Text weight="medium" heading size={14} style={{ color: variant === "primary" || variant === "ghost" ? color.accent : color.text }}>
              {label}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
