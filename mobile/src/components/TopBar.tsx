import { View, Pressable } from "react-native";
import { Text } from "./Text";
import { ChevronLeftIcon, EditIcon, TrashIcon } from "./icons";
import { color, space } from "../theme/tokens";

interface Props {
  title: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TopBar({ title, onBack, onEdit, onDelete }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.divider }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={{ width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: color.divider, alignItems: "center", justifyContent: "center" }}
      >
        <ChevronLeftIcon size={17} color={color.text} />
      </Pressable>
      <Text heading weight="medium" size={16} style={{ flex: 1 }}>
        {title}
      </Text>
      {(onEdit || onDelete) && (
        <View style={{ flexDirection: "row", gap: space[2] }}>
          {onEdit && (
            <Pressable onPress={onEdit} accessibilityLabel="Modifier" style={{ width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: color.divider, alignItems: "center", justifyContent: "center" }}>
              <EditIcon size={16} color={color.text} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} accessibilityLabel="Supprimer" style={{ width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: color.divider, alignItems: "center", justifyContent: "center" }}>
              <TrashIcon size={16} color={color.text} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
