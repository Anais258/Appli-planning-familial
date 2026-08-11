import { Platform } from "react-native";
import { useAuthStore } from "../state/authStore";

// EXPO_PUBLIC_API_URL lets a real device/dev-build point at a LAN IP; the
// Android emulator can't reach the host via "localhost" so it gets the
// 10.0.2.2 alias instead.
const DEFAULT_URL = Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && useAuthStore.getState().refreshToken) {
    const refreshed = await useAuthStore.getState().refresh();
    if (refreshed) return request<T>(path, options, false);
    useAuthStore.getState().signOut();
    throw new ApiError(401, "Session expirée");
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? "Une erreur est survenue");
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
