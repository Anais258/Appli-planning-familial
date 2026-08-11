import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { prisma } from "../../src/db";
import { authHeader, signup } from "../helpers";

describe("calendar", () => {
  it("reports providers as unconfigured with no OAuth env vars set", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app).get("/calendar/status").set(authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.googleConfigured).toBe(false);
    expect(res.body.microsoftConfigured).toBe(false);
    expect(res.body.connections).toEqual([]);
  });

  it("connects and disconnects Apple (on-device) sync", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const connect = await request(app).post("/calendar/apple/connect").set(auth);
    expect(connect.status).toBe(200);
    expect(connect.body.connection.provider).toBe("apple");

    const status = await request(app).get("/calendar/status").set(auth);
    expect(status.body.connections).toEqual([{ provider: "apple", email: null }]);

    const disconnect = await request(app).delete("/calendar/apple").set(auth);
    expect(disconnect.status).toBe(204);

    const statusAfter = await request(app).get("/calendar/status").set(auth);
    expect(statusAfter.body.connections).toEqual([]);
  });

  it("un-syncs affected tasks when a provider is disconnected", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const created = await request(app).post("/tasks").set(auth).send({ title: "Ménage", category: "Maison", weekday: 0, time: "08:00" });
    // Simulate a task that was already synced to Apple's on-device calendar
    // (that link is recorded by the mobile app, not by a server-side sync call).
    await prisma.task.update({ where: { id: created.body.task.id }, data: { synced: true, externalProvider: "apple", externalEventId: "evt-1" } });

    const disconnect = await request(app).delete("/calendar/apple").set(auth);
    expect(disconnect.status).toBe(204);

    const list = await request(app).get("/tasks").set(auth);
    const task = list.body.tasks.find((t: { id: string }) => t.id === created.body.task.id);
    expect(task).toMatchObject({ synced: false, externalProvider: null });
  });

  it("503s starting Google/Microsoft OAuth when the provider isn't configured", async () => {
    const { accessToken } = await signup(app);
    const googleStart = await request(app).get("/calendar/google/start").query({ token: accessToken });
    expect(googleStart.status).toBe(503);

    const microsoftStart = await request(app).get("/calendar/microsoft/start").query({ token: accessToken });
    expect(microsoftStart.status).toBe(503);
  });
});
