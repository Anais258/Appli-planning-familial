import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";
import { authHeader, signup } from "../helpers";

describe("recipes CRUD", () => {
  it("creates, lists, patches and deletes a recipe, persisting memberIds", async () => {
    const { accessToken } = await signup(app);
    const auth = authHeader(accessToken);

    const member = await request(app).post("/members").set(auth).send({ name: "Léo" });
    const memberId = member.body.member.id;

    const created = await request(app)
      .post("/recipes")
      .set(auth)
      .send({ title: "Gratin de courgettes", ingredients: ["Courgettes", "Crème", "Gruyère"], steps: ["Couper", "Cuire", "Gratiner"], memberIds: [memberId] });
    expect(created.status).toBe(201);
    expect(created.body.recipe).toMatchObject({
      title: "Gratin de courgettes",
      ingredients: ["Courgettes", "Crème", "Gruyère"],
      steps: ["Couper", "Cuire", "Gratiner"],
      memberIds: [memberId],
    });
    const recipeId = created.body.recipe.id;

    const list = await request(app).get("/recipes").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.recipes).toHaveLength(1);

    const patched = await request(app).patch(`/recipes/${recipeId}`).set(auth).send({ title: "Gratin de courgettes (léger)", memberIds: [] });
    expect(patched.status).toBe(200);
    expect(patched.body.recipe.title).toBe("Gratin de courgettes (léger)");
    expect(patched.body.recipe.memberIds).toEqual([]);
    expect(patched.body.recipe.ingredients).toEqual(["Courgettes", "Crème", "Gruyère"]);

    const deleted = await request(app).delete(`/recipes/${recipeId}`).set(auth);
    expect(deleted.status).toBe(204);

    const listAfter = await request(app).get("/recipes").set(auth);
    expect(listAfter.body.recipes).toHaveLength(0);
  });

  it("defaults ingredients/steps/notes when omitted", async () => {
    const { accessToken } = await signup(app);
    const res = await request(app).post("/recipes").set(authHeader(accessToken)).send({ title: "Salade" });
    expect(res.status).toBe(201);
    expect(res.body.recipe).toMatchObject({ ingredients: [], steps: [], notes: "", memberIds: [] });
  });

  it("rejects an invalid payload", async () => {
    const res = await request(app)
      .post("/recipes")
      .set(authHeader((await signup(app)).accessToken))
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("isolates recipes between users", async () => {
    const userA = await signup(app, { email: "a@passerelle.test" });
    const userB = await signup(app, { email: "b@passerelle.test" });

    const recipe = await request(app).post("/recipes").set(authHeader(userA.accessToken)).send({ title: "Tarte" });

    const getAsB = await request(app).patch(`/recipes/${recipe.body.recipe.id}`).set(authHeader(userB.accessToken)).send({ title: "Hacked" });
    expect(getAsB.status).toBe(404);

    const deleteAsB = await request(app).delete(`/recipes/${recipe.body.recipe.id}`).set(authHeader(userB.accessToken));
    expect(deleteAsB.status).toBe(404);
  });
});
