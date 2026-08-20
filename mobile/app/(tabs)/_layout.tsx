import { useEffect } from "react";
import { Tabs } from "expo-router";
import { CustomTabBar } from "../../src/components/CustomTabBar";
import { useTasks } from "../../src/hooks/useApi";
import { syncTaskReminders } from "../../src/lib/notifications";

export default function TabsLayout() {
  const { data: tasks } = useTasks();

  useEffect(() => {
    if (tasks) syncTaskReminders(tasks);
  }, [tasks]);

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Accueil" }} />
      <Tabs.Screen name="search" options={{ title: "Recherche" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
