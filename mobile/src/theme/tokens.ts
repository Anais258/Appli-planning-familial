// Passerelle's "data-grid" theme: the Nocturne design system's neutral ramp,
// dividers, shadows and type tokens, with Nocturne's default blurple accent
// (#9184d9) and blue-black ground (#161826) swapped for a cyan accent and a
// neutral graphite ground — the direction the design chat landed on
// ("un peu plus tech", then "change le bleu sombre en une autre couleur").
// Ported 1:1 from project/_ds/nocturne-.../styles.css + the design source file
// :root override block.

export const color = {
  bg: "#121316",
  surface: "#1c1e22",
  text: "#e9e9ed",
  divider: "rgba(233,233,237,0.16)",

  accent: "#22d3ee",
  accent100: "#e6fbff",
  accent200: "#b8f2fb",
  accent300: "#7ee6f5",
  accent400: "#3fd4ea",
  accent500: "#22d3ee",
  accent600: "#12a8c2",
  accent700: "#0e7c96",
  accent800: "#0a5568",
  accent900: "#062f3d",

  neutral100: "#f3f5fe",
  neutral200: "#e4e7f5",
  neutral300: "#cfd3e5",
  neutral400: "#b2b6ca",
  neutral500: "#9397ab",
  neutral600: "#75798c",
  neutral700: "#595d6c",
  neutral800: "#3f424d",
  neutral900: "#292b31",

  danger: "#ef4444",
} as const;

export const radius = { sm: 4, md: 8, lg: 14 } as const;

export const space = { 1: 3, 2: 6, 3: 8, 4: 11, 6: 17, 8: 22 } as const;

// React Native has no box-shadow; these translate the token *intent*
// (a hairline ring + ambient darkness, no flood) into elevation/shadow props
// applied via the Card component per platform.
export const shadow = {
  sm: { ring: color.neutral800 },
  md: { ring: color.neutral700, opacity: 0.55, radius: 18, y: 6 },
  lg: { ring: color.neutral500, opacity: 0.65, radius: 40, y: 16 },
} as const;

import { Platform } from "react-native";

export const font = {
  heading: "Inter_500Medium",
  headingSemibold: "Inter_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  // No bundled mono font (Passerelle just needs digits to look technical, not a
  // specific typeface) — the platform monospace covers times/durations fine.
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
} as const;

export const tint = {
  accent: { bg: color.accent800, fg: color.accent100 },
  neutral: { bg: color.neutral700, fg: color.neutral100 },
  accent2: { bg: color.accent800, fg: color.accent100 },
} as const;

export type TintName = keyof typeof tint;
