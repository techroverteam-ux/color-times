"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_THEME_COOKIE_KEY } from "@/lib/admin/theme-cookie";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ADMIN_THEME_STORAGE_KEY = ADMIN_THEME_COOKIE_KEY;

function persistTheme(theme: Theme): void {
  window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  document.cookie = `${ADMIN_THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function AdminThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    persistTheme(next);
  }

  // Pick up theme changes made in another tab (localStorage is the
  // cross-tab source of truth; the cookie only exists for SSR on load).
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === ADMIN_THEME_STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
        setTheme(event.newValue);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Base UI portals (dropdowns, sheets, dialogs) render into document.body,
  // outside the wrapper div below, so "dark" and "admin-theme" must also
  // live on <html> for portaled content to pick up the right CSS variables.
  useEffect(() => {
    document.documentElement.classList.add("admin-theme");
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => {
      document.documentElement.classList.remove("dark", "admin-theme");
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className={
          theme === "dark"
            ? "admin-theme dark min-h-screen bg-background text-foreground"
            : "admin-theme min-h-screen bg-background text-foreground"
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
