"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getGroupSessions, getDirectGiftSessions } from "@/lib/auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getClientSnapshot() {
  return getGroupSessions().length + getDirectGiftSessions().length;
}

function getServerSnapshot() {
  return 0;
}

export function MisGruposButton() {
  const count = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

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
