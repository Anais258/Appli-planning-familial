import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { dateForWeekday } from "../lib/dates";
import { getProposals, SchedulableTask, Weekday } from "../lib/scheduling";
import { syncTaskToCalendar, unsyncTaskFromCalendar } from "../services/calendarSync";
import type { Task } from "@prisma/client";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

type TaskWithMembers = Task & { members: { memberId: string }[] };

function serializeTask(task: TaskWithMembers) {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    weekday: task.weekday,
    date: task.date.toISOString(),
    time: task.time,
    duration: task.duration,
    priority: task.priority,
    deadlineWeekday: task.deadlineWeekday,
    recurring: task.recurring,
    flexible: task.flexible,
    synced: task.synced,
    notes: task.notes,
    memberIds: task.members.map((m) => m.memberId),
    externalProvider: task.externalProvider,
  };
}

const include = { members: { select: { memberId: true } } } as const;

tasksRouter.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { userId: req.userId }, include, orderBy: [{ weekday: "asc" }, { time: "asc" }] });
  res.json({ tasks: tasks.map(serializeTask) });
});

const taskSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["École", "Travail", "Maison", "Santé", "Loisirs"]),
  weekday: z.number().int().min(0).max(6),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().min(5).max(480).default(30),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  deadlineWeekday: z.number().int().min(0).max(6).nullable().optional(),
  recurring: z.boolean().default(false),
  flexible: z.boolean().default(false),
  synced: z.boolean().default(false),
  notes: z.string().default(""),
  memberIds: z.array(z.string()).default([]),
});

async function loadOwnedTask(userId: string, id: string) {
  return prisma.task.findFirst({ where: { id, userId }, include });
}

async function applyCalendarSideEffects(task: Task) {
  if (task.synced) {
    const { externalEventId, externalProvider } = await syncTaskToCalendar(task);
    if (externalEventId) {
      return prisma.task.update({ where: { id: task.id }, data: { externalEventId, externalProvider }, include });
    }
  } else if (task.externalEventId) {
    await unsyncTaskFromCalendar(task);
    return prisma.task.update({ where: { id: task.id }, data: { externalEventId: null, externalProvider: null }, include });
  }
  return prisma.task.findUniqueOrThrow({ where: { id: task.id }, include });
}

tasksRouter.post("/", async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const d = parsed.data;

  const task = await prisma.task.create({
    data: {
      userId: req.userId!,
      title: d.title,
      category: d.category,
      weekday: d.weekday,
      date: dateForWeekday(d.weekday as Weekday),
      time: d.time,
      duration: d.duration,
      priority: d.priority,
      deadlineWeekday: d.deadlineWeekday ?? null,
      recurring: d.recurring,
      flexible: d.flexible,
      synced: d.synced,
      notes: d.notes,
      members: { create: d.memberIds.map((memberId) => ({ memberId })) },
    },
    include,
  });

  let final = task;
  try {
    final = (await applyCalendarSideEffects(task)) as TaskWithMembers;
  } catch (e) {
    console.error("Calendar sync failed on create:", e);
  }
  res.status(201).json({ task: serializeTask(final) });
});

tasksRouter.patch("/:id", async (req, res) => {
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const existing = await loadOwnedTask(req.userId!, req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const d = parsed.data;

  const { memberIds, ...rest } = d;
  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...rest,
      date: d.weekday !== undefined ? dateForWeekday(d.weekday as Weekday) : undefined,
      ...(memberIds ? { members: { deleteMany: {}, create: memberIds.map((memberId) => ({ memberId })) } } : {}),
    },
    include,
  });

  let final = task;
  try {
    final = (await applyCalendarSideEffects(task)) as TaskWithMembers;
  } catch (e) {
    console.error("Calendar sync failed on update:", e);
  }
  res.json({ task: serializeTask(final) });
});

tasksRouter.delete("/:id", async (req, res) => {
  const existing = await loadOwnedTask(req.userId!, req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  try {
    await unsyncTaskFromCalendar(existing);
  } catch (e) {
    console.error("Calendar unsync failed on delete:", e);
  }
  await prisma.task.delete({ where: { id: existing.id } });
  res.status(204).end();
});

const autoSlotSchema = z.object({
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  deadlineWeekday: z.number().int().min(0).max(6).nullable().optional(),
  memberIds: z.array(z.string()).default([]),
});

// Called when a task is created with no day picked: reuses the same scoring
// engine as "Replanifier ma semaine" to pick the single best slot up front,
// against a draft task that doesn't exist in the DB yet.
tasksRouter.post("/auto-slot", async (req, res) => {
  const parsed = autoSlotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const d = parsed.data;

  const [tasks, constraints] = await Promise.all([
    prisma.task.findMany({ where: { userId: req.userId }, include }),
    prisma.constraints.findUnique({ where: { userId: req.userId } }),
  ]);
  if (!constraints) return res.status(400).json({ error: "Constraints not set up" });

  const schedulable: SchedulableTask[] = tasks.map((t) => ({
    id: t.id,
    weekday: t.weekday as Weekday,
    time: t.time,
    priority: t.priority as SchedulableTask["priority"],
    deadlineWeekday: (t.deadlineWeekday ?? null) as Weekday | null,
    memberIds: t.members.map((m) => m.memberId),
  }));

  const draft: SchedulableTask = {
    id: "__draft__",
    weekday: 0,
    time: "09:00",
    priority: d.priority,
    deadlineWeekday: (d.deadlineWeekday ?? null) as Weekday | null,
    memberIds: d.memberIds,
  };

  const [best] = getProposals(draft, schedulable, constraints, 1);
  if (!best) return res.status(422).json({ error: "Aucun créneau disponible cette semaine." });
  res.json({ weekday: best.weekday, time: best.time, reasons: best.reasons });
});

// "Replanifier ma semaine" — top-3 scored slot proposals for every flexible task.
tasksRouter.get("/replan/proposals", async (req, res) => {
  const [tasks, constraints] = await Promise.all([
    prisma.task.findMany({ where: { userId: req.userId }, include }),
    prisma.constraints.findUnique({ where: { userId: req.userId } }),
  ]);
  if (!constraints) return res.status(400).json({ error: "Constraints not set up" });

  const schedulable: SchedulableTask[] = tasks.map((t) => ({
    id: t.id,
    weekday: t.weekday as Weekday,
    time: t.time,
    priority: t.priority as SchedulableTask["priority"],
    deadlineWeekday: (t.deadlineWeekday ?? null) as Weekday | null,
    memberIds: t.members.map((m) => m.memberId),
  }));

  const flexible = tasks.filter((t) => t.flexible);
  const proposals = flexible.map((t) => {
    const schedulableTask = schedulable.find((s) => s.id === t.id)!;
    const candidates = getProposals(schedulableTask, schedulable, constraints);
    return { taskId: t.id, title: t.title, currentWeekday: t.weekday, currentTime: t.time, candidates };
  });

  res.json({ proposals: proposals.filter((p) => p.candidates.length > 0) });
});
