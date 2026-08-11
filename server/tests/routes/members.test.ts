import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

describe("members", () => {
  it("creates, lists (ordered), updates and deletes a member", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const created1 = await request(app).post("/members").set(auth).send({ name: "Léo", tint: "accent" });
    expect(created1.status).toBe(201);
    expect(created1.body.member).toMatchObject({ name: "Léo", tint: "accent", order: 0 });

    const created2 = await request(app).post("/members").set(auth).send({ name: "Emma", tint: "neutral" });
    expect(created2.body.member.order).toBe(1);

    const list = await request(app).get("/members").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.members.map((m: { name: string }) => m.name)).toEqual(["Léo", "Emma"]);

    const updated = await request(app).patch(`/members/${created1.body.member.id}`).set(auth).send({ name: "Léo D." });
    expect(updated.status).toBe(200);
    expect(updated.body.member.name).toBe("Léo D.");

    const deleted = await request(app).delete(`/members/${created2.body.member.id}`).set(auth);
    expect(deleted.status).toBe(204);

    const listAfter = await request(app).get("/members").set(auth);
    expect(listAfter.body.members).toHaveLength(1);
  });

  it("defaults initials to the first two letters of the name", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app).post("/members").set(authHeader(accessToken)).send({ name: "zoe" });
    expect(res.body.member.initials).toBe("ZO");
  });

  it("isolates members between users", async () => {
    const userA = await signup(app, { email: "a@passerelle.test" });
    const userB = await signup(app, { email: "b@passerelle.test" });

    const member = await request(app).post("/members").set(authHeader(userA.accessToken)).send({ name: "Léo" });

    const getAsB = await request(app).patch(`/members/${member.body.member.id}`).set(authHeader(userB.accessToken)).send({ name: "Hacked" });
    expect(getAsB.status).toBe(404);

    const deleteAsB = await request(app).delete(`/members/${member.body.member.id}`).set(authHeader(userB.accessToken));
    expect(deleteAsB.status).toBe(404);
  });
});
