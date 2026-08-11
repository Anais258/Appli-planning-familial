import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { prisma } from "../../src/db";
import { authHeader, signup } from "../helpers";

describe("notifications", () => {
  it("lists notifications grouped as today/week and supports mark-read / mark-all-read", async () => {
    const { user, accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const todayOne = await prisma.notification.create({ data: { userId: user.id, title: "Aujourd'hui", createdAt: new Date() } });
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    await prisma.notification.create({ data: { userId: user.id, title: "La semaine dernière", createdAt: lastWeek } });

    const list = await request(app).get("/notifications").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.notifications).toHaveLength(2);
    const groups = Object.fromEntries(list.body.notifications.map((n: { title: string; group: string }) => [n.title, n.group]));
    expect(groups["Aujourd'hui"]).toBe("today");
    expect(groups["La semaine dernière"]).toBe("week");
    expect(list.body.notifications.every((n: { unread: boolean }) => n.unread)).toBe(true);

    const markOne = await request(app).post(`/notifications/${todayOne.id}/read`).set(auth);
    expect(markOne.status).toBe(204);

    const afterOne = await request(app).get("/notifications").set(auth);
    const unreadCountAfterOne = afterOne.body.notifications.filter((n: { unread: boolean }) => n.unread).length;
    expect(unreadCountAfterOne).toBe(1);

    const markAll = await request(app).post("/notifications/read-all").set(auth);
    expect(markAll.status).toBe(204);

    const afterAll = await request(app).get("/notifications").set(auth);
    expect(afterAll.body.notifications.every((n: { unread: boolean }) => !n.unread)).toBe(true);
  });

  it("404s marking read a notification that doesn't belong to the user", async () => {
    const userA = await signup(app, { email: "a@passerelle.test" });
    const userB = await signup(app, { email: "b@passerelle.test" });
    const notif = await prisma.notification.create({ data: { userId: userA.user.id, title: "Privée" } });

    const res = await request(app).post(`/notifications/${notif.id}/read`).set(authHeader(userB.accessToken));
    expect(res.status).toBe(404);
  });
});
