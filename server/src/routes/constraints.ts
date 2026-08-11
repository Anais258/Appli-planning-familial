import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const constraintsRouter = Router();
constraintsRouter.use(requireAuth);

constraintsRouter.get("/", async (req, res) => {
  const constraints = await prisma.constraints.upsert({
    where: { userId: req.userId! },
    update: {},
    create: { userId: req.userId! },
  });
  res.json({ constraints });
});

const timeRe = /^\d{2}:\d{2}$/;
const patchSchema = z.object({
  sleepStart: z.string().regex(timeRe).optional(),
  sleepEnd: z.string().regex(timeRe).optional(),
  lunchStart: z.string().regex(timeRe).optional(),
  lunchEnd: z.string().regex(timeRe).optional(),
  dndStart: z.string().regex(timeRe).optional(),
  dndEnd: z.string().regex(timeRe).optional(),
});

constraintsRouter.patch("/", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const constraints = await prisma.constraints.upsert({
    where: { userId: req.userId! },
    update: parsed.data,
    create: { userId: req.userId!, ...parsed.data },
  });
  res.json({ constraints });
});
