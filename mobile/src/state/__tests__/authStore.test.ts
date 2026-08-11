jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../authStore";

function jsonResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as Response;
}

const user = { id: "u1", email: "claire@passerelle.test", name: "Claire Dubois", initials: "CD" };

describe("authStore", () => {
  const initialState = useAuthStore.getState();

  beforeEach(() => {
    useAuthStore.setState(initialState, true);
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it("signIn persists tokens and user via SecureStore and updates state", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(true, 200, { user, accessToken: "access-1", refreshToken: "refresh-1" }));

    await useAuthStore.getState().signIn("claire@passerelle.test", "password123");

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().accessToken).toBe("access-1");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("passerelle.accessToken", "access-1");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("passerelle.refreshToken", "refresh-1");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("passerelle.user", JSON.stringify(user));
  });

  it("signIn throws the server's error message and leaves state untouched on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(false, 401, { error: "Email ou mot de passe incorrect" }));

    await expect(useAuthStore.getState().signIn("claire@passerelle.test", "wrong")).rejects.toThrow("Email ou mot de passe incorrect");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("signOut clears storage and state, and fires a best-effort logout call", async () => {
    useAuthStore.setState({ user, accessToken: "access-1", refreshToken: "refresh-1" });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(true, 204, {}));

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("passerelle.accessToken");
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), expect.objectContaining({ method: "POST" }));
  });

  it("refresh returns false without throwing when the server rejects the refresh token", async () => {
    useAuthStore.setState({ refreshToken: "stale-refresh" });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(false, 401, { error: "Invalid refresh token" }));

    await expect(useAuthStore.getState().refresh()).resolves.toBe(false);
  });

  it("refresh returns false immediately when there is no refresh token to send", async () => {
    useAuthStore.setState({ refreshToken: null });
    await expect(useAuthStore.getState().refresh()).resolves.toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
