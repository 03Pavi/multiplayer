/**
 * Abstraction for persistent key-value storage.
 * Easily switch to Capacitor Preferences for Android/iOS apps in the future.
 */
export const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Error reading from storage", e);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Error writing to storage", e);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from storage", e);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
