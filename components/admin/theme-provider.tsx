"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "ct-admin-theme";
const THEME_CHANGE_EVENT = "ct-admin-theme-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function setStoredTheme(theme: Theme): void {
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    setStoredTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className={
          theme === "dark"
            ? "dark min-h-screen bg-background text-foreground"
            : "min-h-screen bg-background text-foreground"
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAdminTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
}
