import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

describe("share", () => {
  it("creates a share link idempotently and lists shared people", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const first = await request(app).get("/share").set(auth);
    expect(first.status).toBe(200);
    expect(typeof first.body.shareToken).toBe("string");
    expect(first.body.sharedWith).toEqual([]);

    const second = await request(app).get("/share").set(auth);
    expect(second.body.shareToken).toBe(first.body.shareToken);
  });

  it("invites and removes a shared person", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const invited = await request(app).post("/share/people").set(auth).send({ name: "Marc", role: "Co-parent" });
    expect(invited.status).toBe(201);
    expect(invited.body.person).toMatchObject({ name: "Marc", role: "Co-parent" });

    const list = await request(app).get("/share").set(auth);
    expect(list.body.sharedWith).toHaveLength(1);

    const removed = await request(app).delete(`/share/people/${invited.body.person.id}`).set(auth);
    expect(removed.status).toBe(204);

    const listAfter = await request(app).get("/share").set(auth);
    expect(listAfter.body.sharedWith).toHaveLength(0);
  });

  it("exposes only synced tasks on the public token endpoint", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);
    const shareRes = await request(app).get("/share").set(auth);
    const token = shareRes.body.shareToken;

    await request(app).post("/tasks").set(auth).send({ title: "Privée", category: "Maison", weekday: 0, time: "08:00", synced: false });
    await request(app).post("/tasks").set(auth).send({ title: "Synchronisée", category: "Maison", weekday: 0, time: "09:00", synced: true });

    const publicView = await request(app).get(`/share/public/${token}`);
    expect(publicView.status).toBe(200);
    expect(publicView.body.tasks).toHaveLength(1);
    expect(publicView.body.tasks[0].title).toBe("Synchronisée");
  });

  it("404s on an invalid share token", async () => {
    const res = await request(app).get("/share/public/not-a-real-token");
    expect(res.status).toBe(404);
  });
});
