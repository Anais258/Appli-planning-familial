import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Button } from "../../src/components/Button";
import { StepDots } from "../../src/components/StepDots";
import { CalendarIcon } from "../../src/components/icons";
import { color, space } from "../../src/theme/tokens";

export default function WelcomeScreen() {
  return (
    <Screen scroll={false} style={{ justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center", gap: space[4] }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: color.accent800, alignItems: "center", justifyContent: "center" }}>
          <CalendarIcon size={30} color={color.accent200} />
        </View>
        <Text heading weight="semibold" size={24} center>
          Bienvenue sur Passerelle
        </Text>
        <Text tone="muted" size={14} center style={{ maxWidth: 280 }}>
          Organisez le planning de toute la famille en quelques minutes : membres, contraintes, synchronisation.
        </Text>
      </View>
      <View style={{ gap: space[4], alignItems: "center" }}>
        <StepDots step={0} total={4} />
        <Button label="Commencer" variant="primary" block onPress={() => router.push("/(onboarding)/members")} />
      </View>
    </Screen>
  );
}
