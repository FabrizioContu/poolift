"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getGroupSessions, getDirectGiftSessions } from "@/lib/auth";

export function MisGruposButton() {
  const [count, setCount] = useState(0);

  const updateCount = useCallback(() => {
    const groups = getGroupSessions();
    const directGifts = getDirectGiftSessions();
    setCount(groups.length + directGifts.length);
  }, []);

  useEffect(() => {
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, [updateCount]);

  return (
    <Link
      href="/groups"
      className="relative px-4 py-2 rounded-lg font-bold transition bg-muted text-foreground hover:bg-muted/80"
    >
      Mis Grupos
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
          {count}
        </span>
      )}
    </Link>
  );
}
