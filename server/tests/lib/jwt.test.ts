import { describe, expect, it } from "vitest";
import { generateRefreshToken, hashRefreshToken, signAccessToken, verifyAccessToken } from "../../src/lib/jwt";

describe("access token sign/verify", () => {
  it("round-trips the payload", () => {
    const token = signAccessToken({ sub: "user-1", email: "claire@passerelle.test" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("claire@passerelle.test");
  });

  it("rejects a garbage token", () => {
    expect(() => verifyAccessToken("not-a-real-token")).toThrow();
  });

  it("rejects a token signed with a different secret", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require("jsonwebtoken");
    const forged = jwt.sign({ sub: "user-1", email: "x@x.test" }, "wrong-secret");
    expect(() => verifyAccessToken(forged)).toThrow();
  });
});

describe("refresh tokens", () => {
  it("generates a random token with a matching hash and future expiry", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a.token).not.toBe(b.token);
    expect(a.hash).toBe(hashRefreshToken(a.token));
    expect(a.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("hashes deterministically", () => {
    expect(hashRefreshToken("same-token")).toBe(hashRefreshToken("same-token"));
    expect(hashRefreshToken("token-a")).not.toBe(hashRefreshToken("token-b"));
  });
});
