import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db";
import { generateRefreshToken, hashRefreshToken, signAccessToken, verifyAccessToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" });
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet email" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, initials: initialsFor(name), constraints: { create: {} } },
  });

  const tokens = await issueTokens(user.id, user.email);
  res.status(201).json({ user: publicUser(user), ...tokens });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Requête invalide" });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }
  const tokens = await issueTokens(user.id, user.email);
  res.json({ user: publicUser(user), ...tokens });
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.body?.refreshToken as string | undefined;
  if (!refreshToken) return res.status(400).json({ error: "Missing refreshToken" });

  const hash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: "Invalid refresh token" });

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) return res.status(401).json({ error: "Invalid refresh token" });

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(user.id, user.email);
  res.json({ user: publicUser(user), ...tokens });
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.body?.refreshToken as string | undefined;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { tokenHash: hashRefreshToken(refreshToken) } });
  }
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user: publicUser(user) });
});

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const { token: refreshToken, hash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({ data: { userId, tokenHash: hash, expiresAt } });
  return { accessToken, refreshToken };
}

function publicUser(user: { id: string; email: string; name: string; initials: string }) {
  return { id: user.id, email: user.email, name: user.name, initials: user.initials };
}

// exported for the calendar OAuth callback routes, which authenticate the
// in-flight request via the access token embedded in `state`.
export function userIdFromAccessToken(token: string): string {
  return verifyAccessToken(token).sub;
}
