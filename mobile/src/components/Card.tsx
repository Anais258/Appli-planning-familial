import { View, ViewProps, ViewStyle } from "react-native";
import { color, radius, space } from "../theme/tokens";

interface Props extends ViewProps {
  row?: boolean;
  gap?: number;
  padded?: boolean;
  bracket?: boolean;
  bg?: string;
  style?: ViewStyle | ViewStyle[];
}

// The Nocturne .card surface plus Passerelle's cyan "reticle" corner accents,
// applied to every card per the design decision ("bracket_accent: Sur
// toutes les cartes").
export function Card({ row, gap = space[2], padded = true, bracket = true, bg = color.surface, style, children, ...rest }: Props) {
  return (
    <View
      style={[
        {
          flexDirection: row ? "row" : "column",
          gap,
          padding: padded ? space[3] : 0,
          borderRadius: radius.md,
          backgroundColor: bg,
        },
        style,
      ]}
      {...rest}
    >
      {children}
      {bracket && (
        <>
          <View pointerEvents="none" style={[cornerBase, { top: -1, left: -1, borderTopWidth: 1.5, borderLeftWidth: 1.5 }]} />
          <View pointerEvents="none" style={[cornerBase, { bottom: -1, right: -1, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />
        </>
      )}
    </View>
  );
}

const cornerBase: ViewStyle = {
  position: "absolute",
  width: 9,
  height: 9,
  borderColor: color.accent,
  opacity: 0.65,
};
