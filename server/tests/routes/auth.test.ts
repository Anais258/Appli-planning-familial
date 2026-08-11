import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

describe("POST /auth/signup", () => {
  it("creates a user and returns tokens", async () => {
    const res = await request(app).post("/auth/signup").send({ email: "claire@passerelle.test", password: "password123", name: "Claire Dubois" });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: "claire@passerelle.test", name: "Claire Dubois", initials: "CD" });
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
  });

  it("rejects a duplicate email", async () => {
    await signup(app, { email: "dup@passerelle.test" });
    const res = await request(app).post("/auth/signup").send({ email: "dup@passerelle.test", password: "password123", name: "Someone Else" });
    expect(res.status).toBe(409);
  });

  it("rejects an invalid payload", async () => {
    const res = await request(app).post("/auth/signup").send({ email: "not-an-email", password: "short", name: "" });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("logs in with the correct password", async () => {
    await signup(app, { email: "login@passerelle.test", password: "password123" });
    const res = await request(app).post("/auth/login").send({ email: "login@passerelle.test", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("login@passerelle.test");
  });

  it("rejects a wrong password", async () => {
    await signup(app, { email: "login2@passerelle.test", password: "password123" });
    const res = await request(app).post("/auth/login").send({ email: "login2@passerelle.test", password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email", async () => {
    const res = await request(app).post("/auth/login").send({ email: "nobody@passerelle.test", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/refresh", () => {
  it("rotates the refresh token and invalidates the old one", async () => {
    const { refreshToken } = await signup(app, { email: "refresh@passerelle.test" });

    const first = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(first.status).toBe(200);
    expect(first.body.refreshToken).not.toBe(refreshToken);

    // The old refresh token was consumed — reusing it fails.
    const reuse = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(reuse.status).toBe(401);

    // The newly issued one still works.
    const second = await request(app).post("/auth/refresh").send({ refreshToken: first.body.refreshToken });
    expect(second.status).toBe(200);
  });

  it("rejects a bogus refresh token", async () => {
    const res = await request(app).post("/auth/refresh").send({ refreshToken: "not-a-real-token" });
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("invalidates the refresh token", async () => {
    const { refreshToken } = await signup(app, { email: "logout@passerelle.test" });
    const logoutRes = await request(app).post("/auth/logout").send({ refreshToken });
    expect(logoutRes.status).toBe(204);

    const refreshRes = await request(app).post("/auth/refresh").send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

describe("GET /auth/me", () => {
  it("requires a bearer token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const { accessToken, user } = await signup(app, { email: "me@passerelle.test" });
    const res = await request(app).get("/auth/me").set(authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });
});
