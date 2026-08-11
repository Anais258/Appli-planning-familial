import { View } from "react-native";
import { Text } from "./Text";
import { color as themeColor } from "../theme/tokens";

interface AvatarProps {
  initials: string;
  size?: number;
  bg: string;
  fg: string;
  borderColor?: string;
  style?: object;
}

export function Avatar({ initials, size = 32, bg, fg, borderColor, style }: AvatarProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: borderColor ? 2 : 0,
          borderColor,
        },
        style,
      ]}
    >
      <Text weight="semibold" heading size={Math.max(9, size * 0.32)} style={{ color: fg }}>
        {initials}
      </Text>
    </View>
  );
}

export interface StackAvatar {
  initials: string;
  bg: string;
  fg: string;
}

export function AvatarStack({ avatars, size = 24, bgBehind = themeColor.bg }: { avatars: StackAvatar[]; size?: number; bgBehind?: string }) {
  return (
    <View style={{ flexDirection: "row", paddingLeft: 8 }}>
      {avatars.map((a, i) => (
        <Avatar key={i} initials={a.initials} bg={a.bg} fg={a.fg} size={size} borderColor={bgBehind} style={{ marginLeft: -8 }} />
      ))}
    </View>
  );
}
