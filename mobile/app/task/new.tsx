import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Chip } from "../../src/components/Chip";
import { Button } from "../../src/components/Button";
import { TopBar } from "../../src/components/TopBar";
import { useAutoSlotTask, useCreateTask, useMembers, useTasks, useUpdateTask } from "../../src/hooks/useApi";
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
  const { edit, title: prefillTitle, category: prefillCategory, recurring: prefillRecurring, duration: prefillDuration, member: prefillMember } =
    useLocalSearchParams<{ edit?: string; title?: string; category?: string; recurring?: string; duration?: string; member?: string }>();
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const autoSlotTask = useAutoSlotTask();

  const existing: Task | undefined = useMemo(() => tasks.find((t) => t.id === edit), [tasks, edit]);

  const [title, setTitle] = useState(prefillTitle ?? "");
  const [category, setCategory] = useState<Category>((prefillCategory as Category) ?? "Maison");
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState(prefillDuration ? Number(prefillDuration) : 30);
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadlineWeekday, setDeadlineWeekday] = useState<Weekday | null>(null);
  const [recurring, setRecurring] = useState(prefillRecurring === "1");
  const [reminder, setReminder] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>(prefillMember ? [prefillMember] : []);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setCategory(existing.category);
    setWeekdays([existing.weekday]);
    setTime(existing.time);
    setDuration(existing.duration);
    setPriority(existing.priority);
    setDeadlineWeekday(existing.deadlineWeekday);
    setRecurring(existing.recurring);
    setReminder(existing.reminder);
    setFlexible(existing.flexible);
    setMemberIds(existing.memberIds);
    setNotes(existing.notes);
  }, [existing]);

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // En édition une tâche ne peut avoir qu'un seul jour ; en création on peut
  // en cocher plusieurs (ex. lundi + mercredi) — une tâche est créée par jour.
  function toggleWeekday(w: Weekday) {
    if (existing) {
      setWeekdays([w]);
    } else {
      setWeekdays((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
    }
  }

  // Aucun jour coché en création = on laisse Passerelle choisir le créneau
  // (priorité, échéance, charge de la semaine...), donc l'heure saisie
  // manuellement ne s'applique qu'au placement manuel.
  const autoPlacement = !existing && weekdays.length === 0;

  const missing: string[] = [];
  if (!title.trim()) missing.push("un titre");
  if (!autoPlacement && !/^\d{2}:\d{2}$/.test(time)) missing.push("une heure valide (HH:MM)");
  const isValid = missing.length === 0;
  const saving = createTask.isPending || updateTask.isPending || autoSlotTask.isPending;

  async function onSave() {
    const base = { title: title.trim(), category, duration, priority, deadlineWeekday, recurring, reminder, memberIds, notes };
    try {
      if (existing) {
        await updateTask.mutateAsync({ id: existing.id, data: { ...base, time, flexible, weekday: weekdays[0] } });
        useToastStore.getState().show("Tâche modifiée.");
      } else if (autoPlacement) {
        const slot = await autoSlotTask.mutateAsync({ priority, deadlineWeekday, memberIds });
        await createTask.mutateAsync({ ...base, time: slot.time, weekday: slot.weekday, flexible: true });
        useToastStore.getState().show(`Tâche créée automatiquement — ${WEEKDAYS_SHORT[slot.weekday]} à ${slot.time}.`);
      } else {
        for (const weekday of weekdays) {
          await createTask.mutateAsync({ ...base, time, weekday, flexible });
        }
        useToastStore.getState().show(weekdays.length > 1 ? "Tâches créées." : "Tâche créée.");
      }
      router.back();
    } catch (e) {
      useToastStore.getState().show(e instanceof Error ? e.message : "Une erreur est survenue.");
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
            Jour{!existing ? " (plusieurs possibles, ou aucun)" : ""}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
            {WEEKDAYS_SHORT.map((label, i) => (
              <Chip key={label} label={label} selected={weekdays.includes(i as Weekday)} onPress={() => toggleWeekday(i as Weekday)} size="sm" />
            ))}
          </View>
          {autoPlacement && (
            <Text tone="faint" size={12}>
              Aucun jour choisi : Passerelle sélectionnera elle-même le meilleur créneau de la semaine selon la priorité, l'échéance et les tâches déjà planifiées.
            </Text>
          )}
        </View>

        {!autoPlacement && (
          <TextField label="Heure (HH:MM)" value={time} onChangeText={setTime} placeholder="08:00" keyboardType="numbers-and-punctuation" />
        )}

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
          {recurring && <Chip label="Rappel" selected={reminder} onPress={() => setReminder((v) => !v)} size="sm" />}
          {!autoPlacement && (
            <Chip label="Flexible (replanifiable)" selected={flexible} onPress={() => setFlexible((v) => !v)} size="sm" />
          )}
        </View>

        <TextField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Détails, lieu, contexte..." />

        {!isValid && (
          <Text tone="muted" size={12} center>
            Pour {existing ? "enregistrer" : "créer la tâche"}, il manque : {missing.join(", ")}.
          </Text>
        )}

        <Button label={existing ? "Enregistrer" : "Créer la tâche"} variant="primary" block onPress={onSave} disabled={!isValid} loading={saving} />
      </ScrollView>
    </Screen>
  );
}
