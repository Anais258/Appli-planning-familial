import { Pressable, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { BellIcon } from "../../src/components/icons";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../src/hooks/useApi";
import { color, space } from "../../src/theme/tokens";

export default function NotificationsScreen() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const today = notifications.filter((n) => n.group === "today");
  const week = notifications.filter((n) => n.group === "week");
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text heading weight="semibold" size={20}>
          Notifications
        </Text>
        {hasUnread && <Button label="Tout marquer lu" variant="ghost" onPress={() => markAllRead.mutate()} />}
      </View>

      {notifications.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: space[8] }}>
          <BellIcon size={26} color={color.neutral600} />
          <Text tone="muted" size={13} center>
            Aucune notification pour le moment.
          </Text>
        </Card>
      ) : (
        <>
          {today.length > 0 && <NotificationGroup title="Aujourd'hui" items={today} onRead={(id) => markRead.mutate(id)} />}
          {week.length > 0 && <NotificationGroup title="Cette semaine" items={week} onRead={(id) => markRead.mutate(id)} />}
        </>
      )}
    </Screen>
  );
}

function NotificationGroup({
  title,
  items,
  onRead,
}: {
  title: string;
  items: { id: string; title: string; unread: boolean }[];
  onRead: (id: string) => void;
}) {
  return (
    <View style={{ gap: space[2] }}>
      <Text weight="medium" size={13} tone="muted">
        {title}
      </Text>
      {items.map((n) => (
        <Pressable key={n.id} onPress={() => n.unread && onRead(n.id)}>
          <Card row style={{ alignItems: "center" }}>
            {n.unread && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color.accent }} />}
            <Text size={13.5} style={{ flex: 1, marginLeft: n.unread ? space[2] : 0 }} tone={n.unread ? "text" : "muted"}>
              {n.title}
            </Text>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}
