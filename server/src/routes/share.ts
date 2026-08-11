import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const shareRouter = Router();

shareRouter.get("/", requireAuth, async (req, res) => {
  const [link, sharedWith] = await Promise.all([
    prisma.shareLink.upsert({
      where: { userId: req.userId! },
      update: {},
      create: { userId: req.userId!, token: nanoid(10) },
    }),
    prisma.sharedPerson.findMany({ where: { userId: req.userId } }),
  ]);
  res.json({ shareToken: link.token, sharedWith });
});

const inviteSchema = z.object({ name: z.string().min(1), role: z.string().default("Invité") });

shareRouter.post("/people", requireAuth, async (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const person = await prisma.sharedPerson.create({ data: { userId: req.userId!, name: parsed.data.name, role: parsed.data.role } });
  res.status(201).json({ person });
});

shareRouter.delete("/people/:id", requireAuth, async (req, res) => {
  const existing = await prisma.sharedPerson.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.sharedPerson.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Public read-only view of a shared planning, resolved by share token — what
// an invited person (per the design brief: "pour qu'ils puissent voir les
// tâches synchronisées") sees without needing an account.
shareRouter.get("/public/:token", async (req, res) => {
  const link = await prisma.shareLink.findUnique({ where: { token: req.params.token } });
  if (!link) return res.status(404).json({ error: "Lien invalide" });
  const [owner, tasks] = await Promise.all([
    prisma.user.findUnique({ where: { id: link.userId } }),
    prisma.task.findMany({
      where: { userId: link.userId, synced: true },
      include: { members: { include: { member: true } } },
      orderBy: [{ weekday: "asc" }, { time: "asc" }],
    }),
  ]);
  res.json({
    ownerName: owner?.name ?? "",
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      weekday: t.weekday,
      time: t.time,
      recurring: t.recurring,
      members: t.members.map((m) => m.member.name),
    })),
  });
});
