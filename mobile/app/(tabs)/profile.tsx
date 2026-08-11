import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Avatar } from "../../src/components/Avatar";
import { CalendarIcon, ChevronRightIcon } from "../../src/components/icons";
import { useCalendarStatus, useDisconnectCalendar, useMembers } from "../../src/hooks/useApi";
import { useAuthStore } from "../../src/state/authStore";
import { useToastStore } from "../../src/state/toastStore";
import { connectAppleCalendar, startOAuthConnect } from "../../src/lib/calendarConnect";
import { color, space } from "../../src/theme/tokens";
import { Platform, Pressable } from "react-native";

const PROVIDERS: { key: "google" | "outlook" | "apple"; label: string }[] = [
  { key: "google", label: "Google Calendar" },
  { key: "outlook", label: "Outlook" },
  { key: "apple", label: "Apple Calendar" },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { data: members = [] } = useMembers();
  const { data: status, refetch } = useCalendarStatus();
  const disconnect = useDisconnectCalendar();
  const [connecting, setConnecting] = useState<string | null>(null);

  async function onConnect(provider: "google" | "outlook" | "apple") {
    setConnecting(provider);
    try {
      if (provider === "apple") {
        if (Platform.OS === "web") {
          useToastStore.getState().show("Apple Calendar n'est disponible que sur iOS/Android.");
        } else {
          const res = await connectAppleCalendar();
          useToastStore.getState().show(res.ok ? "Apple Calendar connecté." : (res.reason ?? "Échec de connexion."));
          refetch();
        }
      } else {
        // The server's OAuth route segment is "microsoft"; the stored/display
        // provider key is "outlook" (see app/server/src/routes/calendar.ts).
        const res = await startOAuthConnect(provider === "outlook" ? "microsoft" : "google");
        if (res.ok) useToastStore.getState().show(`${provider === "google" ? "Google Calendar" : "Outlook"} connecté.`);
        refetch();
      }
    } finally {
      setConnecting(null);
    }
  }

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space[3] }}>
        <Avatar initials={user?.initials ?? ""} bg={color.accent800} fg={color.accent100} size={56} />
        <View>
          <Text heading weight="semibold" size={18}>
            {user?.name}
          </Text>
          <Text tone="muted" size={13}>
            {user?.email}
          </Text>
        </View>
      </View>

      <View style={{ gap: space[2] }}>
        <Text weight="medium" size={13} tone="muted">
          Famille ({members.length})
        </Text>
        <Card>
          {members.map((m, i) => (
            <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: space[2], paddingVertical: 6, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: color.divider }}>
              <Avatar initials={m.initials} bg={m.tint === "neutral" ? color.neutral700 : color.accent800} fg={m.tint === "neutral" ? color.neutral100 : color.accent100} size={30} />
              <Text size={14}>{m.name}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={{ gap: space[2] }}>
        <Text weight="medium" size={13} tone="muted">
          Synchronisation calendrier
        </Text>
        <Card>
          {PROVIDERS.map((p, i) => {
            const connection = status?.connections.find((c) => c.provider === p.key);
            return (
              <View
                key={p.key}
                style={{ flexDirection: "row", alignItems: "center", gap: space[2], paddingVertical: 8, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: color.divider }}
              >
                <CalendarIcon size={16} color={color.neutral400} />
                <View style={{ flex: 1 }}>
                  <Text size={13.5}>{p.label}</Text>
                  {connection?.email && (
                    <Text size={11} tone="faint">
                      {connection.email}
                    </Text>
                  )}
                </View>
                <Button
                  label={connection ? "Déconnecter" : "Connecter"}
                  variant={connection ? "secondary" : "ghost"}
                  loading={connecting === p.key}
                  onPress={() => (connection ? disconnect.mutate(p.key) : onConnect(p.key))}
                />
              </View>
            );
          })}
        </Card>
      </View>

      <Pressable onPress={() => router.push("/share")}>
        <Card row style={{ alignItems: "center" }}>
          <Text size={14} style={{ flex: 1 }}>
            Partager mon planning
          </Text>
          <ChevronRightIcon size={14} color={color.neutral500} />
        </Card>
      </Pressable>

      <Button
        label="Se déconnecter"
        variant="secondary"
        block
        onPress={async () => {
          await signOut();
          router.replace("/");
        }}
      />
    </Screen>
  );
}
