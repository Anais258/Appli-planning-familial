import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

const baseTask = {
  title: "Devoirs de Léo",
  category: "École" as const,
  weekday: 1,
  time: "17:00",
  duration: 30,
  priority: "high" as const,
};

describe("tasks CRUD", () => {
  it("creates, lists, patches and deletes a task, persisting memberIds", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const member = await request(app).post("/members").set(auth).send({ name: "Léo" });
    const memberId = member.body.member.id;

    const created = await request(app).post("/tasks").set(auth).send({ ...baseTask, memberIds: [memberId] });
    expect(created.status).toBe(201);
    expect(created.body.task).toMatchObject({ title: baseTask.title, weekday: 1, memberIds: [memberId] });
    const taskId = created.body.task.id;

    const list = await request(app).get("/tasks").set(auth);
    expect(list.body.tasks).toHaveLength(1);

    const patched = await request(app).patch(`/tasks/${taskId}`).set(auth).send({ time: "18:00", memberIds: [] });
    expect(patched.status).toBe(200);
    expect(patched.body.task.time).toBe("18:00");
    expect(patched.body.task.memberIds).toEqual([]);

    const deleted = await request(app).delete(`/tasks/${taskId}`).set(auth);
    expect(deleted.status).toBe(204);

    const listAfter = await request(app).get("/tasks").set(auth);
    expect(listAfter.body.tasks).toHaveLength(0);
  });

  it("rejects an invalid payload", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app)
      .post("/tasks")
      .set(authHeader(accessToken))
      .send({ ...baseTask, category: "Not-A-Category" });
    expect(res.status).toBe(400);
  });

  it("isolates tasks between users", async () => {
    const userA = await signup(app, { email: "a@passerelle.test" });
    const userB = await signup(app, { email: "b@passerelle.test" });

    const created = await request(app).post("/tasks").set(authHeader(userA.accessToken)).send(baseTask);
    const taskId = created.body.task.id;

    const listAsB = await request(app).get("/tasks").set(authHeader(userB.accessToken));
    expect(listAsB.body.tasks).toHaveLength(0);

    const deleteAsB = await request(app).delete(`/tasks/${taskId}`).set(authHeader(userB.accessToken));
    expect(deleteAsB.status).toBe(404);
  });
});

describe("GET /tasks/replan/proposals", () => {
  it("returns proposals only for flexible tasks", async () => {
    // Signup already creates a default Constraints row for the user (see
    // src/routes/auth.ts: `constraints: { create: {} }`), so no separate
    // GET /constraints warm-up is needed here.
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    await request(app).post("/tasks").set(auth).send({ ...baseTask, title: "Rigide", flexible: false });
    await request(app).post("/tasks").set(auth).send({ ...baseTask, title: "Flexible", flexible: true, priority: "high" });

    const res = await request(app).get("/tasks/replan/proposals").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.proposals).toHaveLength(1);
    expect(res.body.proposals[0].title).toBe("Flexible");
    expect(res.body.proposals[0].candidates.length).toBeGreaterThan(0);
  });
});
