import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const membersRouter = Router();
membersRouter.use(requireAuth);

membersRouter.get("/", async (req, res) => {
  const members = await prisma.familyMember.findMany({ where: { userId: req.userId }, orderBy: { order: "asc" } });
  res.json({ members });
});

const memberSchema = z.object({
  name: z.string().min(1),
  initials: z.string().min(1).max(3).optional(),
  tint: z.enum(["accent", "neutral", "accent2"]).default("neutral"),
  age: z.number().int().min(0).max(120).nullable().optional(),
  birthday: z.coerce.date().nullable().optional(),
});

membersRouter.post("/", async (req, res) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const count = await prisma.familyMember.count({ where: { userId: req.userId } });
  const member = await prisma.familyMember.create({
    data: {
      userId: req.userId!,
      name: parsed.data.name,
      initials: parsed.data.initials ?? parsed.data.name.slice(0, 2).toUpperCase(),
      tint: parsed.data.tint,
      age: parsed.data.age ?? null,
      birthday: parsed.data.birthday ?? null,
      order: count,
    },
  });
  res.status(201).json({ member });
});

membersRouter.patch("/:id", async (req, res) => {
  const parsed = memberSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const existing = await prisma.familyMember.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  const member = await prisma.familyMember.update({ where: { id: existing.id }, data: parsed.data });
  res.json({ member });
});

membersRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.familyMember.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.familyMember.delete({ where: { id: existing.id } });
  res.status(204).end();
});
