import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

describe("constraints", () => {
  it("GET creates default values on first access", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app).get("/constraints").set(authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.constraints).toMatchObject({
      sleepStart: "20:00",
      sleepEnd: "07:00",
      lunchStart: "12:00",
      lunchEnd: "13:30",
    });
  });

  it("PATCH persists a partial update without touching the rest", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);
    await request(app).get("/constraints").set(auth);

    const patched = await request(app).patch("/constraints").set(auth).send({ sleepStart: "22:00" });
    expect(patched.status).toBe(200);
    expect(patched.body.constraints.sleepStart).toBe("22:00");
    expect(patched.body.constraints.lunchStart).toBe("12:00");

    const refetched = await request(app).get("/constraints").set(auth);
    expect(refetched.body.constraints.sleepStart).toBe("22:00");
  });

  it("rejects a malformed time", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app).patch("/constraints").set(authHeader(accessToken)).send({ sleepStart: "not-a-time" });
    expect(res.status).toBe(400);
  });
});
