import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { TrashIcon } from "./icons";
import { color, space } from "../theme/tokens";

interface Props {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  numbered?: boolean;
}

// Free-form "add one line at a time" list editor, used for recipe
// ingredients and steps — same "type + Ajouter" pattern as onboarding's
// recurring-task drafts, but for plain text lines instead of task cards.
export function ListEditor({ label, placeholder, items, onChange, numbered }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <View style={{ gap: space[2] }}>
      <Text size={13} tone="muted">
        {label}
      </Text>

      {items.length > 0 && (
        <View style={{ gap: space[1] }}>
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
              {numbered && (
                <Text size={13} tone="faint" mono>
                  {i + 1}.
                </Text>
              )}
              <Text size={14} style={{ flex: 1 }}>
                {item}
              </Text>
              <Pressable onPress={() => remove(i)} accessibilityLabel={`Supprimer la ligne ${i + 1}`}>
                <TrashIcon size={14} color={color.neutral500} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={{ flexDirection: "row", gap: space[2] }}>
        <View style={{ flex: 1 }}>
          <TextField value={draft} onChangeText={setDraft} placeholder={placeholder} onSubmitEditing={add} returnKeyType="done" />
        </View>
        <Button label="Ajouter" variant="secondary" onPress={add} disabled={!draft.trim()} />
      </View>
    </View>
  );
}
