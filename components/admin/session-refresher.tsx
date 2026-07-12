"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function SessionRefresher() {
  useEffect(() => {
    const refresh = () => {
      fetch("/api/auth/refresh", { method: "POST" }).catch(() => {
        // A failed refresh just means the next authenticated request will
        // redirect to /login on its own — nothing to handle here.
      });
    };

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
