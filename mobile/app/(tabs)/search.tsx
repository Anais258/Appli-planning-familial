import { useMemo, useState } from "react";
import { View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { Card } from "../../src/components/Card";
import { Chip } from "../../src/components/Chip";
import { TaskCard } from "../../src/components/TaskCard";
import { SearchEmptyIcon } from "../../src/components/icons";
import { useMembers, useTasks } from "../../src/hooks/useApi";
import { color, space } from "../../src/theme/tokens";
import type { Category } from "../../src/api/types";

const CATEGORIES: Category[] = ["École", "Travail", "Maison", "Santé", "Loisirs"];

export default function SearchScreen() {
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => (category ? t.category === category : true))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));
  }, [tasks, query, category]);

  return (
    <Screen>
      <Text heading weight="semibold" size={20}>
        Recherche
      </Text>
      <TextField value={query} onChangeText={setQuery} placeholder="Rechercher une tâche..." autoCapitalize="none" />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[2] }}>
        <Chip label="Toutes" selected={category === null} onPress={() => setCategory(null)} size="sm" />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} size="sm" />
        ))}
      </View>

      <View style={{ gap: space[2] }}>
        {results.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
            <SearchEmptyIcon size={26} color={color.neutral600} />
            <Text tone="muted" size={13} center>
              Aucune tâche ne correspond.
            </Text>
          </Card>
        ) : (
          results.map((task) => <TaskCard key={task.id} task={task} members={members} />)
        )}
      </View>
    </Screen>
  );
}
