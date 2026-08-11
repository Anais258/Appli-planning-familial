import { View } from "react-native";
import { color } from "../theme/tokens";

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 18 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === step ? color.accent : color.neutral800,
          }}
        />
      ))}
    </View>
  );
}
