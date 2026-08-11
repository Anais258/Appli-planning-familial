import { Text as RNText, TextProps, TextStyle } from "react-native";
import { color, font } from "../theme/tokens";

interface Props extends TextProps {
  size?: number;
  weight?: "regular" | "medium" | "semibold";
  tone?: "text" | "muted" | "faint" | "accent" | "danger";
  mono?: boolean;
  heading?: boolean;
  center?: boolean;
}

const toneColor: Record<NonNullable<Props["tone"]>, string> = {
  text: color.text,
  muted: color.neutral400,
  faint: color.neutral500,
  accent: color.accent300,
  danger: color.danger,
};

const weightFont: Record<NonNullable<Props["weight"]>, string> = {
  regular: font.body,
  medium: font.bodyMedium,
  semibold: font.bodySemibold,
};

export function Text({ size = 14, weight = "regular", tone = "text", mono, heading, center, style, ...rest }: Props) {
  const s: TextStyle = {
    fontSize: size,
    color: toneColor[tone],
    fontFamily: mono ? font.mono : heading ? (weight === "semibold" ? font.headingSemibold : font.heading) : weightFont[weight],
    textAlign: center ? "center" : undefined,
  };
  return <RNText style={[s, style]} {...rest} />;
}
