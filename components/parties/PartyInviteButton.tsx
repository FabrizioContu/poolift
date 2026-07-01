"use client";

import { MessageCircle } from "lucide-react";
import { generatePartyInviteMessage } from "@/lib/messages";

interface PartyInviteButtonProps {
  celebrantNames: string[];
  partyDate: string;
  groupName: string;
  inviteCode: string;
  variant?: "icon" | "full";
}

export function PartyInviteButton({
  celebrantNames,
  partyDate,
  groupName,
  inviteCode,
  variant = "full",
}: PartyInviteButtonProps) {
  const handleShareWhatsApp = (e: React.MouseEvent) => {
    // El botón puede estar dentro de un <Link> (tarjeta): evitar la navegación.
    e.preventDefault();
    e.stopPropagation();

    const inviteLink =
      typeof window !== "undefined"
        ? `${window.location.origin}/join/${inviteCode}`
        : `/join/${inviteCode}`;

    const message = generatePartyInviteMessage(
      celebrantNames,
      partyDate,
      groupName,
      inviteLink,
    );

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShareWhatsApp}
        title="Invitar por WhatsApp"
        aria-label="Invitar por WhatsApp"
        className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition dark:hover:text-emerald-400 dark:hover:bg-emerald-900"
      >
        <MessageCircle size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleShareWhatsApp}
      className="px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 bg-emerald-400 text-white hover:bg-emerald-500"
    >
      <MessageCircle size={18} />
      <span>Invitar por WhatsApp</span>
    </button>
  );
}

export default PartyInviteButton;
