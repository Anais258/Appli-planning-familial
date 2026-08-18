import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { TopBar } from "../src/components/TopBar";
import { TextField } from "../src/components/TextField";
import { Avatar } from "../src/components/Avatar";
import { useMembers, useTasks, useUpdateMember } from "../src/hooks/useApi";
import { AGE_BRACKETS, bracketForAge } from "../src/lib/ageTasks";
import { color, space } from "../src/theme/tokens";
import type { Member } from "../src/api/types";

function AgeSetter({ member }: { member: Member }) {
  const [value, setValue] = useState("");
  const updateMember = useUpdateMember();
  const age = Number(value);
  const valid = value.trim().length > 0 && Number.isInteger(age) && age >= 0 && age <= 120;

  return (
    <Card row style={{ alignItems: "center" }}>
      <Avatar
        initials={member.initials}
        bg={member.tint === "neutral" ? color.neutral700 : color.accent800}
        fg={member.tint === "neutral" ? color.neutral100 : color.accent100}
        size={28}
      />
      <Text size={14} style={{ flex: 1, marginLeft: space[2] }}>
        {member.name}
      </Text>
      <View style={{ width: 64 }}>
        <TextField value={value} onChangeText={setValue} placeholder="Âge" keyboardType="number-pad" />
      </View>
      <Button
        label="OK"
        variant="ghost"
        disabled={!valid}
        loading={updateMember.isPending}
        onPress={() => updateMember.mutate({ id: member.id, data: { age } })}
      />
    </Card>
  );
}

export default function SuggestionsScreen() {
  const { data: members = [] } = useMembers();
  const { data: tasks = [] } = useTasks();

  const withAge = members.filter((m): m is Member & { age: number } => m.age != null);
  const withoutAge = members.filter((m) => m.age == null);

  function goCreate(memberId: string, title: string, category: string, duration: number) {
    router.push({
      pathname: "/task/new",
      params: { title, category, recurring: "1", duration: String(duration), member: memberId },
    });
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="Suggestions selon l'âge" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[4] }} showsVerticalScrollIndicator={false}>
        <Text tone="muted" size={13}>
          Des tâches récurrentes courantes pour l'âge de chaque membre — appuie sur une suggestion pour la créer, tu choisiras ensuite le jour et l'heure.
        </Text>

        {withAge.length === 0 && withoutAge.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <Text tone="muted" size={13} center>
              Ajoute un membre de la famille pour voir des suggestions.
            </Text>
          </Card>
        )}

        {withoutAge.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Renseigne l'âge pour voir des suggestions
            </Text>
            {withoutAge.map((m) => (
              <AgeSetter key={m.id} member={m} />
            ))}
          </View>
        )}

        {withAge.map((member) => {
          const bracket = bracketForAge(member.age);
          const existingTitles = new Set(
            tasks.filter((t) => t.memberIds.includes(member.id)).map((t) => t.title.toLowerCase())
          );
          const suggestions = bracket?.tasks.filter((t) => !existingTitles.has(t.title.toLowerCase())) ?? [];

          return (
            <View key={member.id} style={{ gap: space[2] }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
                <Avatar
                  initials={member.initials}
                  bg={member.tint === "neutral" ? color.neutral700 : color.accent800}
                  fg={member.tint === "neutral" ? color.neutral100 : color.accent100}
                  size={28}
                />
                <Text weight="medium" size={14}>
                  {member.name}
                </Text>
                <Text tone="faint" size={12} mono>
                  {bracket ? bracket.label : `${member.age} ans`}
                </Text>
              </View>

              {!bracket && (
                <Card>
                  <Text tone="muted" size={13}>
                    Pas de suggestions pour cet âge.
                  </Text>
                </Card>
              )}

              {bracket && suggestions.length === 0 && (
                <Card>
                  <Text tone="muted" size={13}>
                    Toutes les tâches suggérées pour {bracket.label} sont déjà dans le planning de {member.name}.
                  </Text>
                </Card>
              )}

              {suggestions.map((s) => (
                <Card key={s.title} row style={{ alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text size={14}>{s.title}</Text>
                    <Text size={11.5} tone="faint">
                      {s.category} · {s.duration} min
                    </Text>
                  </View>
                  <Button label="Ajouter" variant="ghost" onPress={() => goCreate(member.id, s.title, s.category, s.duration)} />
                </Card>
              ))}
            </View>
          );
        })}

        <Text tone="faint" size={11} style={{ marginTop: space[2] }}>
          Repères tirés de guides parentaux courants (Naître et grandir, GoHenry…) — à ajuster selon ta famille. Tranches disponibles :{" "}
          {AGE_BRACKETS.map((b) => b.label).join(", ")}.
        </Text>
      </ScrollView>
    </Screen>
  );
}
