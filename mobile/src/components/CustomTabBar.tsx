import { View, Pressable } from "react-native";
import { router } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeIcon, SearchIcon, BellIcon, ProfileIcon, PlusIcon } from "./icons";
import { useNotifications } from "../hooks/useApi";
import { color, space } from "../theme/tokens";

const ICONS: Record<string, (props: { size: number; color: string }) => React.JSX.Element> = {
  home: HomeIcon,
  search: SearchIcon,
  notifications: BellIcon,
  profile: ProfileIcon,
};

type RouteItem = BottomTabBarProps["state"]["routes"][number];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { data: notifications = [] } = useNotifications();
  const hasUnread = notifications.some((n) => n.unread);

  const routes = state.routes.filter((r: RouteItem) => ICONS[r.name]);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: insets.bottom || 10,
        paddingTop: 10,
        paddingHorizontal: 18,
        borderTopWidth: 1,
        borderTopColor: color.divider,
        backgroundColor: color.bg,
      }}
    >
      {left.map((route: RouteItem) => {
        const isFocused = state.routes[state.index].key === route.key;
        const Icon = ICONS[route.name];
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: "center" }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            <Icon size={22} color={isFocused ? color.accent : color.neutral500} />
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => router.push("/task/new")}
        accessibilityLabel="Nouvelle tâche"
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: color.accent,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: space[3],
          marginTop: -22,
          backgroundColor: color.bg,
        }}
      >
        <PlusIcon size={22} color={color.accent} />
      </Pressable>

      {right.map((route: RouteItem) => {
        const isFocused = state.routes[state.index].key === route.key;
        const Icon = ICONS[route.name];
        const showDot = route.name === "notifications" && hasUnread;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: "center" }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            <View>
              <Icon size={22} color={isFocused ? color.accent : color.neutral500} />
              {showDot && (
                <View style={{ position: "absolute", top: -2, right: -4, width: 7, height: 7, borderRadius: 3.5, backgroundColor: color.accent }} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
