"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

function checkLocalStorage(coordinatorId: string, groupId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const sessions = localStorage.getItem("poolift_groups");
    if (!sessions) return false;
    const groupSessions: Array<{ groupId: string; familyId: string }> =
      JSON.parse(sessions);
    const session = groupSessions.find((s) => s.groupId === groupId);
    return session?.familyId === coordinatorId;
  } catch {
    return false;
  }
}

/**
 * Determina si el usuario actual es el coordinador de una fiesta.
 *
 * - Usuarios anónimos: comprueba localStorage (poolift_groups)
 * - Usuarios autenticados: comprueba localStorage primero (sesión aún no migrada),
 *   luego hace fallback a la BD (post-migración, cuando localStorage ya fue limpiado)
 */
export function useIsCoordinator(
  coordinatorId: string | null,
  groupId: string
): boolean {
  const { user } = useAuth();
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!coordinatorId || !groupId) return;

      // 1. Check localStorage (works for anon users and auth users pre-migration)
      if (checkLocalStorage(coordinatorId, groupId)) {
        if (!cancelled) setIsCoordinator(true);
        return;
      }

      // 2. For authenticated users, fall back to DB (post-migration)
      if (!user) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("families")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled && data?.id === coordinatorId) {
        setIsCoordinator(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coordinatorId, groupId, user]);

  return isCoordinator;
}
