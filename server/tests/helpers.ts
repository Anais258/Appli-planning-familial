import request from "supertest";
import type { Express } from "express";
import { afterEach } from "vitest";
import { prisma } from "../src/db";

// Every model cascades from User (onDelete: Cascade in prisma/schema.prisma),
// so wiping users between tests is enough to isolate each test case.
afterEach(async () => {
  await prisma.user.deleteMany();
});

let counter = 0;

export async function signup(app: Express, overrides: Partial<{ email: string; password: string; name: string }> = {}) {
  counter += 1;
  const email = overrides.email ?? `user${counter}@passerelle.test`;
  const password = overrides.password ?? "password123";
  const name = overrides.name ?? "Claire Dubois";

  const res = await request(app).post("/auth/signup").send({ email, password, name });
  if (res.status !== 201) {
    throw new Error(`signup helper failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return {
    user: res.body.user as { id: string; email: string; name: string; initials: string },
    accessToken: res.body.accessToken as string,
    refreshToken: res.body.refreshToken as string,
  };
}

export function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}
