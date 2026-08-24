import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { ListEditor } from "../../src/components/ListEditor";
import { Chip } from "../../src/components/Chip";
import { Button } from "../../src/components/Button";
import { TopBar } from "../../src/components/TopBar";
import { useCreateRecipe, useMembers, useRecipes, useUpdateRecipe } from "../../src/hooks/useApi";
import { useToastStore } from "../../src/state/toastStore";
import { space } from "../../src/theme/tokens";
import type { Recipe } from "../../src/api/types";

export default function RecipeFormScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { data: recipes = [] } = useRecipes();
  const { data: members = [] } = useMembers();
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const existing: Recipe | undefined = useMemo(() => recipes.find((r) => r.id === edit), [recipes, edit]);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setIngredients(existing.ingredients);
    setSteps(existing.steps);
    setNotes(existing.notes);
    setMemberIds(existing.memberIds);
  }, [existing]);

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const isValid = title.trim().length > 0;
  const saving = createRecipe.isPending || updateRecipe.isPending;

  async function onSave() {
    const data = { title: title.trim(), ingredients, steps, notes, memberIds };
    try {
      if (existing) {
        await updateRecipe.mutateAsync({ id: existing.id, data });
        useToastStore.getState().show("Recette modifiée.");
      } else {
        await createRecipe.mutateAsync(data);
        useToastStore.getState().show("Recette ajoutée.");
      }
      router.back();
    } catch (e) {
      useToastStore.getState().show(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title={existing ? "Modifier la recette" : "Nouvelle recette"} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[4] }} showsVerticalScrollIndicator={false}>
        <TextField label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. Gratin de courgettes" />

        <ListEditor label="Ingrédients" placeholder="Ex. 2 courgettes" items={ingredients} onChange={setIngredients} />

        <ListEditor label="Étapes" placeholder="Ex. Couper les courgettes en rondelles" items={steps} onChange={setSteps} numbered />

        {members.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text size={13} tone="muted">
              Qui aime ce plat ? (optionnel)
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
              {members.map((m) => (
                <Chip key={m.id} label={m.name} selected={memberIds.includes(m.id)} onPress={() => toggleMember(m.id)} size="sm" />
              ))}
            </View>
          </View>
        )}

        <TextField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Astuces, variantes..." />

        {!isValid && (
          <Text tone="muted" size={12} center>
            Un titre est nécessaire pour {existing ? "enregistrer" : "créer la recette"}.
          </Text>
        )}

        <Button label={existing ? "Enregistrer" : "Créer la recette"} variant="primary" block onPress={onSave} disabled={!isValid} loading={saving} />
      </ScrollView>
    </Screen>
  );
}
