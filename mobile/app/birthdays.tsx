import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { TopBar } from "../src/components/TopBar";
import { Avatar } from "../src/components/Avatar";
import { DateField } from "../src/components/DateField";
import { GiftIcon } from "../src/components/icons";
import { useMembers, useUpdateMember } from "../src/hooks/useApi";
import { daysUntilBirthday } from "../src/lib/notifications";
import { color, space } from "../src/theme/tokens";
import type { Member } from "../src/api/types";

function tintColors(m: Member) {
  return m.tint === "neutral" ? { bg: color.neutral700, fg: color.neutral100 } : { bg: color.accent800, fg: color.accent100 };
}

function daysLabel(days: number): string {
  if (days === 0) return "Aujourd'hui 🎉";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

export default function BirthdaysScreen() {
  const { data: members = [] } = useMembers();
  const updateMember = useUpdateMember();

  const sorted = [...members].sort((a, b) => {
    if (!a.birthday && !b.birthday) return 0;
    if (!a.birthday) return 1;
    if (!b.birthday) return -1;
    return daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday);
  });

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="Anniversaires" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[2] }} showsVerticalScrollIndicator={false}>
        <Text tone="muted" size={13} style={{ marginBottom: space[2] }}>
          Ajoute la date de naissance de chaque membre pour un rappel automatique le jour J.
        </Text>

        {sorted.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <GiftIcon size={22} color={color.neutral600} />
            <Text tone="muted" size={13} center style={{ marginTop: space[2] }}>
              Ajoute d'abord des membres dans ton profil.
            </Text>
          </Card>
        )}

        {sorted.map((member) => {
          const t = tintColors(member);
          return (
            <Card key={member.id} style={{ gap: space[2] }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
                <Avatar initials={member.initials} bg={t.bg} fg={t.fg} size={32} />
                <Text weight="medium" size={14} style={{ flex: 1 }}>
                  {member.name}
                </Text>
                {member.birthday && (
                  <Text size={12} tone="accent" mono>
                    {daysLabel(daysUntilBirthday(member.birthday))}
                  </Text>
                )}
              </View>
              <DateField
                label="Date de naissance"
                value={member.birthday ? new Date(member.birthday) : null}
                onChange={(date) => updateMember.mutate({ id: member.id, data: { birthday: date.toISOString() } })}
              />
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
