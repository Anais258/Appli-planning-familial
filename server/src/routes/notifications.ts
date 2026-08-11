import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

function groupFor(createdAt: Date): "today" | "week" {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return createdAt >= startOfToday ? "today" : "week";
}

notificationsRouter.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" } });
  res.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      unread: n.unread,
      createdAt: n.createdAt.toISOString(),
      group: groupFor(n.createdAt),
    })),
  });
});

notificationsRouter.post("/:id/read", async (req, res) => {
  const existing = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.notification.update({ where: { id: existing.id }, data: { unread: false } });
  res.status(204).end();
});

notificationsRouter.post("/read-all", async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId, unread: true }, data: { unread: false } });
  res.status(204).end();
});
