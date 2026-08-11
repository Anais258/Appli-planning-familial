import express from "express";
import cors from "cors";
import { env } from "./env";
import { authRouter } from "./routes/auth";
import { membersRouter } from "./routes/members";
import { tasksRouter } from "./routes/tasks";
import { constraintsRouter } from "./routes/constraints";
import { notificationsRouter } from "./routes/notifications";
import { shareRouter } from "./routes/share";
import { calendarRouter } from "./routes/calendar";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/members", membersRouter);
app.use("/tasks", tasksRouter);
app.use("/constraints", constraintsRouter);
app.use("/notifications", notificationsRouter);
app.use("/share", shareRouter);
app.use("/calendar", calendarRouter);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

if (require.main === module) {
  app.listen(env.port, () => console.log(`Passerelle API listening on :${env.port}`));
}
