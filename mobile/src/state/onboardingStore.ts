import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "passerelle.onboarded";

async function read(): Promise<boolean> {
  const v = Platform.OS === "web" ? (typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null) : await SecureStore.getItemAsync(KEY);
  return v === "1";
}
async function write(value: boolean) {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, value ? "1" : "0");
    return;
  }
  await SecureStore.setItemAsync(KEY, value ? "1" : "0");
}

interface OnboardingState {
  completed: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  complete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  hydrated: false,
  hydrate: async () => set({ completed: await read(), hydrated: true }),
  complete: async () => {
    await write(true);
    set({ completed: true });
  },
}));
