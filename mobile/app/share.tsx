import { useState } from "react";
import { Pressable, ScrollView, Share as RNShare, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { TextField } from "../src/components/TextField";
import { TopBar } from "../src/components/TopBar";
import { TrashIcon } from "../src/components/icons";
import { useInvitePerson, useRemoveSharedPerson, useShare } from "../src/hooks/useApi";
import { useToastStore } from "../src/state/toastStore";
import { color, space } from "../src/theme/tokens";

// EXPO_PUBLIC_SHARE_URL should be set once a domain is secured for the app —
// "passerelle.app" has not been verified/purchased, so this default is a
// placeholder, not a real endpoint.
const SHARE_BASE_URL = process.env.EXPO_PUBLIC_SHARE_URL ?? "https://passerelle.app/s";

export default function ShareScreen() {
  const { data, isLoading } = useShare();
  const invite = useInvitePerson();
  const remove = useRemoveSharedPerson();
  const [name, setName] = useState("");

  const link = data ? `${SHARE_BASE_URL}/${data.shareToken}` : "";

  async function onShareLink() {
    if (!link) return;
    try {
      await RNShare.share({ message: link });
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  }

  function onInvite() {
    if (!name.trim()) return;
    invite.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          useToastStore.getState().show("Invitation envoyée.");
        },
      }
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="Partager mon planning" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[4] }} showsVerticalScrollIndicator={false}>
        <Text tone="muted" size={13}>
          Les personnes invitées voient les tâches synchronisées de votre planning, sans avoir besoin d'un compte.
        </Text>

        {!isLoading && (
          <Card style={{ gap: space[2] }}>
            <Text size={12} tone="faint">
              Lien de partage
            </Text>
            <Text size={13} mono numberOfLines={1}>
              {link}
            </Text>
            <Button label="Partager le lien" variant="secondary" onPress={onShareLink} />
          </Card>
        )}

        <View style={{ gap: space[2] }}>
          <Text weight="medium" size={13} tone="muted">
            Inviter quelqu'un
          </Text>
          <View style={{ flexDirection: "row", gap: space[2] }}>
            <View style={{ flex: 1 }}>
              <TextField value={name} onChangeText={setName} placeholder="Nom" onSubmitEditing={onInvite} returnKeyType="done" />
            </View>
            <Button label="Inviter" variant="secondary" onPress={onInvite} disabled={!name.trim()} loading={invite.isPending} />
          </View>
        </View>

        <View style={{ gap: space[2] }}>
          {(data?.sharedWith ?? []).map((p) => (
            <Card key={p.id} row style={{ alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text size={14}>{p.name}</Text>
                <Text size={11} tone="faint">
                  {p.role}
                </Text>
              </View>
              <Pressable onPress={() => remove.mutate(p.id)} accessibilityLabel={`Retirer ${p.name}`}>
                <TrashIcon size={16} color={color.neutral500} />
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
