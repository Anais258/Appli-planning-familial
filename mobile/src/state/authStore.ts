import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_URL } from "../api/client";
import type { User } from "../api/types";

const ACCESS_KEY = "passerelle.accessToken";
const REFRESH_KEY = "passerelle.refreshToken";
const USER_KEY = "passerelle.user";

// expo-secure-store has no web implementation; the web target (used only for
// quick iteration, not a shipping platform here) falls back to localStorage.
const storage = {
  async get(key: string) {
    if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.setItem(key, value) : undefined;
    return SecureStore.setItemAsync(key, value);
  },
  async del(key: string) {
    if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.removeItem(key) : undefined;
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

async function persist(user: User, accessToken: string, refreshToken: string) {
  await Promise.all([
    storage.set(ACCESS_KEY, accessToken),
    storage.set(REFRESH_KEY, refreshToken),
    storage.set(USER_KEY, JSON.stringify(user)),
  ]);
}

async function authRequest(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue");
  if (typeof data.accessToken !== "string" || typeof data.refreshToken !== "string" || !data.user) {
    throw new Error("Le serveur met parfois quelques secondes à se réveiller. Réessaie dans un instant.");
  }
  return data as { user: User; accessToken: string; refreshToken: string };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,

  hydrate: async () => {
    const [accessToken, refreshToken, userRaw] = await Promise.all([
      storage.get(ACCESS_KEY),
      storage.get(REFRESH_KEY),
      storage.get(USER_KEY),
    ]);
    set({
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      user: userRaw ? (JSON.parse(userRaw) as User) : null,
      hydrated: true,
    });
  },

  signUp: async (email, password, name) => {
    const data = await authRequest("/auth/signup", { email, password, name });
    await persist(data.user, data.accessToken, data.refreshToken);
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
  },

  signIn: async (email, password) => {
    const data = await authRequest("/auth/login", { email, password });
    await persist(data.user, data.accessToken, data.refreshToken);
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
  },

  signOut: async () => {
    const { refreshToken } = get();
    await Promise.all([storage.del(ACCESS_KEY), storage.del(REFRESH_KEY), storage.del(USER_KEY)]);
    set({ user: null, accessToken: null, refreshToken: null });
    if (refreshToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    try {
      const data = await authRequest("/auth/refresh", { refreshToken });
      await persist(data.user, data.accessToken, data.refreshToken);
      set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      return true;
    } catch {
      return false;
    }
  },
}));
