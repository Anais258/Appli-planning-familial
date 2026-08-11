import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { verifyAccessToken } from "../lib/jwt";
import { env, isGoogleConfigured, isMicrosoftConfigured } from "../env";
import { exchangeGoogleCode, getGoogleAuthUrl } from "../services/googleCalendar";
import { exchangeMicrosoftCode, getMicrosoftAuthUrl } from "../services/outlookCalendar";

export const calendarRouter = Router();

// In-memory CSRF-state -> userId map for the OAuth redirect round-trip
// (short-lived; a browser redirect can't carry an Authorization header, so
// the flow starts with the access token as a query param instead).
const pendingStates = new Map<string, { userId: string; expiresAt: number }>();
function issueState(userId: string): string {
  const state = crypto.randomBytes(16).toString("hex");
  pendingStates.set(state, { userId, expiresAt: Date.now() + 10 * 60_000 });
  return state;
}
function consumeState(state: string | undefined): string | null {
  if (!state) return null;
  const entry = pendingStates.get(state);
  pendingStates.delete(state);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

calendarRouter.get("/status", requireAuth, async (req, res) => {
  const connections = await prisma.calendarConnection.findMany({ where: { userId: req.userId } });
  res.json({
    connections: connections.map((c) => ({ provider: c.provider, email: c.email })),
    googleConfigured: isGoogleConfigured(),
    microsoftConfigured: isMicrosoftConfigured(),
  });
});

calendarRouter.delete("/:provider", requireAuth, async (req, res) => {
  await prisma.calendarConnection.deleteMany({ where: { userId: req.userId, provider: req.params.provider } });
  await prisma.task.updateMany({ where: { userId: req.userId, externalProvider: req.params.provider }, data: { synced: false, externalEventId: null, externalProvider: null } });
  res.status(204).end();
});

// Apple sync has no server-side OAuth: the mobile app writes directly to the
// device calendar via expo-calendar. This just records the connection so
// GET /calendar/status reflects it consistently across the three providers.
calendarRouter.post("/apple/connect", requireAuth, async (req, res) => {
  const connection = await prisma.calendarConnection.upsert({
    where: { userId_provider: { userId: req.userId!, provider: "apple" } },
    update: {},
    create: { userId: req.userId!, provider: "apple" },
  });
  res.json({ connection: { provider: connection.provider } });
});

function requireProviderConfigured(configured: boolean, name: string) {
  return (req: any, res: any, next: any) => {
    if (!configured) return res.status(503).json({ error: `${name} n'est pas configuré côté serveur (variables d'environnement manquantes).` });
    next();
  };
}

calendarRouter.get("/google/start", requireProviderConfigured(isGoogleConfigured(), "Google Calendar"), async (req, res) => {
  try {
    const userId = verifyAccessToken(String(req.query.token ?? "")).sub;
    const state = issueState(userId);
    res.redirect(getGoogleAuthUrl(state));
  } catch {
    res.status(401).send("Jeton invalide ou expiré");
  }
});

calendarRouter.get("/google/callback", async (req, res) => {
  const userId = consumeState(req.query.state as string | undefined);
  if (!userId) return res.status(400).send("État invalide ou expiré");
  try {
    const { accessToken, refreshToken, expiresAt, email } = await exchangeGoogleCode(String(req.query.code));
    await prisma.calendarConnection.upsert({
      where: { userId_provider: { userId, provider: "google" } },
      update: { accessToken, refreshToken, expiresAt, email },
      create: { userId, provider: "google", accessToken, refreshToken, expiresAt, email },
    });
    res.redirect(`${env.appDeepLink}?provider=google&status=connected`);
  } catch (e) {
    console.error("Google OAuth callback failed:", e);
    res.redirect(`${env.appDeepLink}?provider=google&status=error`);
  }
});

calendarRouter.get("/microsoft/start", requireProviderConfigured(isMicrosoftConfigured(), "Outlook"), async (req, res) => {
  try {
    const userId = verifyAccessToken(String(req.query.token ?? "")).sub;
    const state = issueState(userId);
    res.redirect(await getMicrosoftAuthUrl(state));
  } catch {
    res.status(401).send("Jeton invalide ou expiré");
  }
});

calendarRouter.get("/microsoft/callback", async (req, res) => {
  const userId = consumeState(req.query.state as string | undefined);
  if (!userId) return res.status(400).send("État invalide ou expiré");
  try {
    const { accessToken, refreshToken, expiresAt, email } = await exchangeMicrosoftCode(String(req.query.code));
    await prisma.calendarConnection.upsert({
      where: { userId_provider: { userId, provider: "outlook" } },
      update: { accessToken, refreshToken, expiresAt, email },
      create: { userId, provider: "outlook", accessToken, refreshToken, expiresAt, email },
    });
    res.redirect(`${env.appDeepLink}?provider=outlook&status=connected`);
  } catch (e) {
    console.error("Microsoft OAuth callback failed:", e);
    res.redirect(`${env.appDeepLink}?provider=outlook&status=error`);
  }
});
