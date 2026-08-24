import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Card } from "../../src/components/Card";
import { TopBar } from "../../src/components/TopBar";
import { Avatar } from "../../src/components/Avatar";
import { useDeleteRecipe, useMembers, useRecipes } from "../../src/hooks/useApi";
import { useToastStore } from "../../src/state/toastStore";
import { color, space } from "../../src/theme/tokens";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipes = [] } = useRecipes();
  const { data: members = [] } = useMembers();
  const deleteRecipe = useDeleteRecipe();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <Screen scroll={false}>
        <TopBar title="Recette" onBack={() => router.back()} />
        <Text tone="muted" style={{ padding: 18 }}>
          Cette recette n'existe plus.
        </Text>
      </Screen>
    );
  }

  const fans = recipe.memberIds.map((mid) => members.find((m) => m.id === mid)).filter((m): m is NonNullable<typeof m> => !!m);

  function onDelete() {
    Alert.alert("Supprimer la recette", `Supprimer « ${recipe!.title} » ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          deleteRecipe.mutate(recipe!.id, {
            onSuccess: () => {
              useToastStore.getState().show("Recette supprimée.");
              router.back();
            },
          });
        },
      },
    ]);
  }

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title={recipe.title} onBack={() => router.back()} onEdit={() => router.push(`/recipe/new?edit=${recipe.id}`)} onDelete={onDelete} />
      <View style={{ padding: 18, gap: space[4] }}>
        {fans.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Qui aime ce plat
            </Text>
            <View style={{ flexDirection: "row", gap: space[2] }}>
              {fans.map((m) => (
                <View key={m.id} style={{ alignItems: "center", gap: 4 }}>
                  <Avatar initials={m.initials} bg={m.tint === "neutral" ? color.neutral700 : color.accent800} fg={m.tint === "neutral" ? color.neutral100 : color.accent100} size={32} />
                  <Text size={11} tone="muted">
                    {m.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {recipe.ingredients.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Ingrédients
            </Text>
            <Card style={{ gap: space[2] }}>
              {recipe.ingredients.map((item, i) => (
                <Text key={i} size={14}>
                  • {item}
                </Text>
              ))}
            </Card>
          </View>
        )}

        {recipe.steps.length > 0 && (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Étapes
            </Text>
            <Card style={{ gap: space[2] }}>
              {recipe.steps.map((item, i) => (
                <Text key={i} size={14}>
                  {i + 1}. {item}
                </Text>
              ))}
            </Card>
          </View>
        )}

        {recipe.notes ? (
          <View style={{ gap: space[2] }}>
            <Text weight="medium" size={13} tone="muted">
              Notes
            </Text>
            <Text size={14}>{recipe.notes}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
