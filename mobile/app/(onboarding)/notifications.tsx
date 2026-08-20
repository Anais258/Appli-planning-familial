import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Button } from "../../src/components/Button";
import { StepDots } from "../../src/components/StepDots";
import { BellIcon } from "../../src/components/icons";
import { useOnboardingStore } from "../../src/state/onboardingStore";
import { color, space } from "../../src/theme/tokens";

export default function NotificationsOnboardingScreen() {
  const complete = useOnboardingStore((s) => s.complete);

  async function finish() {
    await complete();
    router.replace({ pathname: "/suggestions", params: { onboarding: "1" } });
  }

  return (
    <Screen scroll={false} style={{ justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center", gap: space[4] }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: color.accent800, alignItems: "center", justifyContent: "center" }}>
          <BellIcon size={30} color={color.accent200} />
        </View>
        <Text heading weight="semibold" size={22} center>
          Restez au courant
        </Text>
        <Text tone="muted" size={14} center style={{ maxWidth: 280 }}>
          Passerelle vous prévient des changements de planning et des tâches à venir. Vous pourrez ajuster cela dans votre profil.
        </Text>
      </View>
      <View style={{ gap: space[4], alignItems: "center", width: "100%" }}>
        <StepDots step={4} total={5} />
        <Button label="Terminer" variant="primary" block onPress={finish} />
      </View>
    </Screen>
  );
}
