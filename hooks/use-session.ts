"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/types/auth";

async function fetchSession(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.user ?? null;
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
  });

  return { user: data ?? null, isLoading };
}
