import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Chip } from "../../src/components/Chip";
import { Button } from "../../src/components/Button";
import { TopBar } from "../../src/components/TopBar";
import { useCreateTask, useMembers, useTasks, useUpdateTask } from "../../src/hooks/useApi";
import { useToastStore } from "../../src/state/toastStore";
import { space } from "../../src/theme/tokens";
import { WEEKDAYS_SHORT } from "../../src/lib/weekdays";
import type { Category, Priority, Task, Weekday } from "../../src/api/types";

const CATEGORIES: Category[] = ["École", "Travail", "Maison", "Santé", "Loisirs"];
const DURATIONS = [15, 30, 45, 60, 90, 120];
const PRIORITIES: { key: Priority; label: string }[] = [
  { key: "low", label: "Basse" },
  { key: "medium", label: "Moyenne" },
  { key: "high", label: "Haute" },
];

export default function TaskFormScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const existing: Task | undefined = useMemo(() => tasks.find((t) => t.id === edit), [tasks, edit]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Maison");
  const [weekday, setWeekday] = useState<Weekday>(0);
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadlineWeekday, setDeadlineWeekday] = useState<Weekday | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setCategory(existing.category);
    setWeekday(existing.weekday);
    setTime(existing.time);
    setDuration(existing.duration);
    setPriority(existing.priority);
    setDeadlineWeekday(existing.deadlineWeekday);
    setRecurring(existing.recurring);
    setFlexible(existing.flexible);
    setMemberIds(existing.memberIds);
    setNotes(existing.notes);
  }, [existing]);

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const isValid = title.trim().length > 0 && /^\d{2}:\d{2}$/.test(time);
  const saving = createTask.isPending || updateTask.isPending;

  function onSave() {
    const payload = { title: title.trim(), category, weekday, time, duration, priority, deadlineWeekday, recurring, flexible, memberIds, notes };
    const onDone = (verb: string) => () => {
      useToastStore.getState().show(`Tâche ${verb}.`);
      router.back();
    };
    if (existing) {
      updateTask.mutate({ id: existing.id, data: payload }, { onSuccess: onDone("modifiée") });
    } else {
      createTask.mutate(payload, { onSuccess: onDone("créée") });
    }
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title={existing ? "Modifier la tâche" : "Nouvelle tâche"} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[4] }} showsVerticalScrollIndicator={false}>
        <TextField label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. Devoirs de Léo" />

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

        <View style={{ gap: space[2] }}>
          <Text size={13} tone="muted">
            Jour
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
            {WEEKDAYS_SHORT.map((label, i) => (
              <Chip key={label} label={label} selected={weekday === i} onPress={() => setWeekday(i as Weekday)} size="sm" />
            ))}
          </View>
        </View>

        <TextField label="Heure (HH:MM)" value={time} onChangeText={setTime} placeholder="08:00" keyboardType="numbers-and-punctuation" />

        <View style={{ gap: space[2] }}>
          <Text size={13} tone="muted">
            Durée
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
            {DURATIONS.map((d) => (
              <Chip key={d} label={d < 60 ? `${d} min` : `${d / 60}h`} selected={duration === d} onPress={() => setDuration(d)} size="sm" mono />
            ))}
          </View>
        </View>

        <View style={{ gap: space[2] }}>
          <Text size={13} tone="muted">
            Priorité
          </Text>
          <View style={{ flexDirection: "row", gap: space[2] }}>
            {PRIORITIES.map((p) => (
              <Chip key={p.key} label={p.label} selected={priority === p.key} onPress={() => setPriority(p.key)} size="sm" />
            ))}
          </View>
        </View>

        <View style={{ gap: space[2] }}>
          <Text size={13} tone="muted">
            Échéance (optionnel)
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
            <Chip label="Aucune" selected={deadlineWeekday === null} onPress={() => setDeadlineWeekday(null)} size="sm" />
            {WEEKDAYS_SHORT.map((label, i) => (
              <Chip key={label} label={label} selected={deadlineWeekday === i} onPress={() => setDeadlineWeekday(i as Weekday)} size="sm" />
            ))}
          </View>
        </View>

        {members.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text size={13} tone="muted">
              Assigné à
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
              {members.map((m) => (
                <Chip key={m.id} label={m.name} selected={memberIds.includes(m.id)} onPress={() => toggleMember(m.id)} size="sm" />
              ))}
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
          <Chip label="Récurrente" selected={recurring} onPress={() => setRecurring((v) => !v)} size="sm" />
          <Chip label="Flexible (replanifiable)" selected={flexible} onPress={() => setFlexible((v) => !v)} size="sm" />
        </View>

        <TextField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Détails, lieu, contexte..." />

        <Button label={existing ? "Enregistrer" : "Créer la tâche"} variant="primary" block onPress={onSave} disabled={!isValid} loading={saving} />
      </ScrollView>
    </Screen>
  );
}
