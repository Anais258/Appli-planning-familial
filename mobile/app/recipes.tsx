import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { TopBar } from "../src/components/TopBar";
import { BookIcon } from "../src/components/icons";
import { useRecipes } from "../src/hooks/useApi";
import { color, space } from "../src/theme/tokens";

export default function RecipesScreen() {
  const { data: recipes = [] } = useRecipes();

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="Livre de recettes" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: space[2] }} showsVerticalScrollIndicator={false}>
        <Button label="+ Nouvelle recette" variant="secondary" block onPress={() => router.push("/recipe/new")} />

        {recipes.length === 0 && (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <BookIcon size={22} color={color.neutral600} />
            <Text tone="muted" size={13} center style={{ marginTop: space[2] }}>
              Aucune recette pour l'instant.
            </Text>
          </Card>
        )}

        {recipes.map((recipe) => (
          <Pressable key={recipe.id} onPress={() => router.push(`/recipe/${recipe.id}`)}>
            <Card row style={{ alignItems: "center" }}>
              <BookIcon size={14} color={color.accent400} />
              <View style={{ flex: 1, marginLeft: space[2] }}>
                <Text size={14} weight="medium">
                  {recipe.title}
                </Text>
                <Text size={11.5} tone="faint">
                  {recipe.ingredients.length} ingrédient{recipe.ingredients.length !== 1 ? "s" : ""} · {recipe.steps.length} étape{recipe.steps.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}
