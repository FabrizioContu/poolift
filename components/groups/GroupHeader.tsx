"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users, Copy, Check, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";

const UserMenu = dynamic(() =>
  import("@/components/auth/UserMenu").then((m) => ({ default: m.UserMenu }))
);

interface GroupHeaderProps {
  groupName: string;
  inviteCode: string;
  familyCount: number;
}

export function GroupHeader({
  groupName,
  inviteCode,
  familyCount,
}: GroupHeaderProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteCode}`
      : `/join/${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Error copying code:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Error copying link:", err);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6 dark:border-bondi-blue-600">
      {/* Back navigation */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-bondi-blue-500 mb-4 transition dark:text-bondi-blue-300 dark:hover:text-bondi-blue-100"
      >
        <ArrowLeft size={16} />
        Volver a Grupos
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-bondi-blue-100 p-2 rounded-lg dark:bg-bondi-blue-600">
            <Users className="w-6 h-6 text-bondi-blue-500 dark:text-bondi-blue-200" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-bondi-blue-50">{groupName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-bondi-blue-600 dark:text-bondi-blue-200">
                {familyCount} {familyCount === 1 ? "familia" : "familias"}
              </span>
              <span className="text-gray-700 dark:text-bondi-blue-300">·</span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-bondi-blue-500 transition dark:text-bondi-blue-300 dark:hover:text-bondi-blue-100"
                title="Copiar código"
              >
                <span className="font-mono font-medium">{inviteCode}</span>
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              {copiedCode && (
                <span className="text-sm text-emerald-500">¡Copiado!</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserMenu />
          <Button
            onClick={handleCopyLink}
            variant={copiedLink ? "secondary" : "primary"}
            className="flex items-center gap-2"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                ¡Link copiado!
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Invitar Familias
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GroupHeader;
