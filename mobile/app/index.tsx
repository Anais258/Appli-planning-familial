import { Redirect } from "expo-router";
import { useAuthStore } from "../src/state/authStore";
import { useOnboardingStore } from "../src/state/onboardingStore";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const onboarded = useOnboardingStore((s) => s.completed);

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!onboarded) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)/home" />;
}
