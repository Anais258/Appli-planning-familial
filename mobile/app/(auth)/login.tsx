import { useState } from "react";
import { View } from "react-native";
import { router, Link } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuthStore } from "../../src/state/authStore";
import { color, space } from "../../src/theme/tokens";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false} style={{ justifyContent: "center", gap: space[6] }}>
      <View style={{ gap: 4 }}>
        <Text heading weight="semibold" size={26}>
          Passerelle
        </Text>
        <Text tone="muted" size={14}>
          Le planning de la famille, sans friction.
        </Text>
      </View>

      <View style={{ gap: space[3] }}>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.fr" />
        <TextField label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        {error && (
          <Text tone="danger" size={13}>
            {error}
          </Text>
        )}
        <Button label="Se connecter" variant="primary" block onPress={onSubmit} loading={loading} disabled={!email || !password} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <Text tone="muted" size={13}>
          Pas encore de compte ?
        </Text>
        <Link href="/(auth)/signup">
          <Text tone="accent" size={13} weight="medium">
            Créer un compte
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
