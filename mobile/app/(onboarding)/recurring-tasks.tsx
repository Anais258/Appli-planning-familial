import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Chip } from "../../src/components/Chip";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { StepDots } from "../../src/components/StepDots";
import { TrashIcon, RecurringIcon } from "../../src/components/icons";
import { useCreateTask } from "../../src/hooks/useApi";
import { useToastStore } from "../../src/state/toastStore";
import { WEEKDAYS_SHORT } from "../../src/lib/weekdays";
import { color, space } from "../../src/theme/tokens";
import type { Category, Weekday } from "../../src/api/types";

const CATEGORIES: Category[] = ["École", "Travail", "Maison", "Santé", "Loisirs"];

interface Draft {
  key: string;
  title: string;
  weekdays: Weekday[];
  time: string;
  category: Category;
  reminder: boolean;
}

export default function RecurringTasksOnboardingScreen() {
  const createTask = useCreateTask();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);
  const [time, setTime] = useState("17:00");
  const [category, setCategory] = useState<Category>("Maison");
  const [reminder, setReminder] = useState(false);

  function toggleWeekday(w: Weekday) {
    setWeekdays((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  }

  const canAdd = title.trim().length > 0 && weekdays.length > 0 && /^\d{2}:\d{2}$/.test(time);

  function addDraft() {
    if (!canAdd) return;
    setDrafts((prev) => [...prev, { key: `${Date.now()}-${prev.length}`, title: title.trim(), weekdays, time, category, reminder }]);
    setTitle("");
    setWeekdays([]);
    setTime("17:00");
    setCategory("Maison");
    setReminder(false);
  }

  function removeDraft(key: string) {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  }

  async function onContinue() {
    if (drafts.length === 0) {
      router.push("/(onboarding)/notifications");
      return;
    }
    setSaving(true);
    try {
      for (const draft of drafts) {
        for (const weekday of draft.weekdays) {
          await createTask.mutateAsync({
            title: draft.title,
            category: draft.category,
            weekday,
            time: draft.time,
            duration: 30,
            priority: "medium",
            deadlineWeekday: null,
            recurring: true,
            reminder: draft.reminder,
            flexible: false,
            memberIds: [],
            notes: "",
          });
        }
      }
      useToastStore.getState().show(drafts.length > 1 ? "Tâches récurrentes créées." : "Tâche récurrente créée.");
      router.push("/(onboarding)/notifications");
    } catch (e) {
      useToastStore.getState().show(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen style={{ justifyContent: "space-between", flexGrow: 1 }}>
      <View style={{ gap: space[6] }}>
        <View style={{ gap: 4 }}>
          <Text heading weight="semibold" size={22}>
            Vos tâches récurrentes
          </Text>
          <Text tone="muted" size={14}>
            Elles se replaceront automatiquement chaque semaine dans la grille.
          </Text>
        </View>

        {drafts.length > 0 && (
          <View style={{ gap: space[2] }}>
            {drafts.map((d) => (
              <Card key={d.key} row style={{ alignItems: "center" }}>
                <RecurringIcon size={13} color={color.accent400} />
                <View style={{ flex: 1, marginLeft: space[2] }}>
                  <Text size={14} weight="medium">
                    {d.title}
                  </Text>
                  <Text size={11.5} tone="faint">
                    {d.weekdays.map((w) => WEEKDAYS_SHORT[w]).join(" · ")} — {d.time} · {d.category}
                    {d.reminder ? " · Rappel" : ""}
                  </Text>
                </View>
                <Pressable onPress={() => removeDraft(d.key)} accessibilityLabel={`Supprimer ${d.title}`}>
                  <TrashIcon size={16} color={color.neutral500} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        <View style={{ gap: space[3] }}>
          <TextField label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. Piano, Devoirs, Sport..." />

          <View style={{ gap: space[2] }}>
            <Text size={13} tone="muted">
              Jours
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
              {WEEKDAYS_SHORT.map((label, i) => (
                <Chip key={label} label={label} selected={weekdays.includes(i as Weekday)} onPress={() => toggleWeekday(i as Weekday)} size="sm" />
              ))}
            </View>
          </View>

          <TextField label="Heure (HH:MM)" value={time} onChangeText={setTime} placeholder="17:00" keyboardType="numbers-and-punctuation" />

          <View style={{ gap: space[2] }}>
            <Text size={13} tone="muted">
              Catégorie
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
              {CATEGORIES.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} size="sm" />
              ))}
            </View>
          </View>

          <Chip label="Rappel" selected={reminder} onPress={() => setReminder((v) => !v)} size="sm" style={{ alignSelf: "flex-start" }} />

          <Button label="+ Ajouter une tâche récurrente" variant="secondary" block onPress={addDraft} disabled={!canAdd} />
        </View>
      </View>

      <View style={{ gap: space[3], alignItems: "center" }}>
        <StepDots step={3} total={5} />
        <Button label="Continuer" variant="primary" block onPress={onContinue} loading={saving} />
        <Button label="Plus tard" variant="ghost" block onPress={() => router.push("/(onboarding)/notifications")} />
      </View>
    </Screen>
  );
}
