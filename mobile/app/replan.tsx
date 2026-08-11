import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { TopBar } from "../src/components/TopBar";
import { ReshuffleIcon } from "../src/components/icons";
import { useReplanProposals, useUpdateTask } from "../src/hooks/useApi";
import { useToastStore } from "../src/state/toastStore";
import { color, space } from "../src/theme/tokens";
import { WEEKDAYS_FULL } from "../src/lib/weekdays";
import type { ReplanCandidate } from "../src/api/types";

export default function ReplanScreen() {
  const { data: proposals = [], isLoading } = useReplanProposals();
  const updateTask = useUpdateTask();

  function apply(taskId: string, title: string, candidate: ReplanCandidate) {
    updateTask.mutate(
      { id: taskId, data: { weekday: candidate.weekday, time: candidate.time } },
      { onSuccess: () => useToastStore.getState().show(`« ${title} » déplacée au ${WEEKDAYS_FULL[candidate.weekday]} ${candidate.time}.`) }
    );
  }

  return (
    <Screen scroll={false} padded={false} techGrid>
      <TopBar title="Replanifier ma semaine" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[4] }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
          <ReshuffleIcon size={18} color={color.accent} />
          <Text tone="muted" size={13} style={{ flex: 1 }}>
            Passerelle propose de meilleurs créneaux pour vos tâches flexibles, en tenant compte de vos contraintes.
          </Text>
        </View>

        {!isLoading && proposals.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <Text tone="muted" size={13} center>
              Aucune tâche flexible à réajuster pour l'instant.
            </Text>
          </Card>
        )}

        {proposals.map((p) => (
          <Card key={p.taskId} bg={color.accent900} style={{ gap: space[3] }}>
            <View>
              <Text weight="medium" size={14}>
                {p.title}
              </Text>
              <Text size={12} tone="faint" mono>
                Actuellement : {WEEKDAYS_FULL[p.currentWeekday]} {p.currentTime}
              </Text>
            </View>
            <View style={{ gap: space[2] }}>
              {p.candidates.map((c, i) => (
                <Card key={i} row style={{ alignItems: "center" }} bracket={false}>
                  <View style={{ flex: 1 }}>
                    <Text weight="medium" size={13} mono>
                      {WEEKDAYS_FULL[c.weekday]} · {c.time}
                    </Text>
                    <Text size={11.5} tone="muted">
                      {c.reason}
                    </Text>
                  </View>
                  <Button label="Appliquer" variant="ghost" onPress={() => apply(p.taskId, p.title, c)} />
                </Card>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
