import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { StepDots } from "../../src/components/StepDots";
import { Avatar } from "../../src/components/Avatar";
import { TrashIcon } from "../../src/components/icons";
import { Pressable } from "react-native";
import { useCreateMember, useDeleteMember, useMembers } from "../../src/hooks/useApi";
import { color, space } from "../../src/theme/tokens";
import type { Tint } from "../../src/api/types";

const TINTS: { tint: Tint; bg: string; fg: string }[] = [
  { tint: "accent", bg: color.accent800, fg: color.accent100 },
  { tint: "accent2", bg: color.accent800, fg: color.accent100 },
  { tint: "neutral", bg: color.neutral700, fg: color.neutral100 },
];

export default function MembersOnboardingScreen() {
  const { data: members = [] } = useMembers();
  const createMember = useCreateMember();
  const deleteMember = useDeleteMember();
  const [name, setName] = useState("");
  const [tintIndex, setTintIndex] = useState(0);

  function addMember() {
    if (!name.trim()) return;
    const t = TINTS[tintIndex % TINTS.length];
    createMember.mutate({ name: name.trim(), tint: t.tint });
    setName("");
    setTintIndex((i) => i + 1);
  }

  return (
    <Screen style={{ justifyContent: "space-between", flexGrow: 1 }}>
      <View style={{ gap: space[6] }}>
        <View style={{ gap: 4 }}>
          <Text heading weight="semibold" size={22}>
            Qui compose la famille ?
          </Text>
          <Text tone="muted" size={14}>
            Ajoutez chaque membre — vous pourrez leur assigner des tâches ensuite.
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: space[2] }}>
          <View style={{ flex: 1 }}>
            <TextField value={name} onChangeText={setName} placeholder="Prénom" onSubmitEditing={addMember} returnKeyType="done" />
          </View>
          <Button label="Ajouter" variant="secondary" onPress={addMember} disabled={!name.trim()} />
        </View>

        <View style={{ gap: space[2] }}>
          {members.map((m) => {
            const t = TINTS.find((x) => x.tint === m.tint) ?? TINTS[0];
            return (
              <Card key={m.id} row style={{ alignItems: "center" }}>
                <Avatar initials={m.initials} bg={t.bg} fg={t.fg} size={32} />
                <Text weight="medium" size={14} style={{ flex: 1, marginLeft: space[2] }}>
                  {m.name}
                </Text>
                <Pressable onPress={() => deleteMember.mutate(m.id)} accessibilityLabel={`Supprimer ${m.name}`}>
                  <TrashIcon size={16} color={color.neutral500} />
                </Pressable>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space[4], alignItems: "center" }}>
        <StepDots step={1} total={4} />
        <Button label="Continuer" variant="primary" block onPress={() => router.push("/(onboarding)/constraints")} disabled={members.length === 0} />
      </View>
    </Screen>
  );
}
