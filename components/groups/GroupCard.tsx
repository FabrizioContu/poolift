"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users, Copy, Check, MessageCircle, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import { removeGroupSession } from "@/lib/auth";

const ConfirmDeleteModal = dynamic(
  () => import("@/components/modals/ConfirmDeleteModal")
);

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    invite_code: string;
    familyCount?: number;
    partyCount?: number;
  };
  isCreator?: boolean;
  showActions?: boolean;
}

export function GroupCard({
  group,
  isCreator,
  showActions = true,
}: GroupCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${group.invite_code}`
      : `/join/${group.invite_code}`;

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `¡Únete a nuestro grupo "${group.name}" en Poolift!\n\nCódigo: ${group.invite_code}\nLink: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/groups/${group.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar grupo");
    }

    // Remove from localStorage
    removeGroupSession(group.id);

    // Show success state
    setShowDeleteModal(false);
    setDeleted(true);
  };

  if (deleted) {
    return (
      <div className="block border border-emerald-200 rounded-lg p-6 bg-emerald-50 dark:border-emerald-700 dark:bg-ocean-mist-800">
        <div className="text-center">
          <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-emerald-800">
            <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-300" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1 dark:text-bondi-blue-50">
            Grupo eliminado
          </h3>
          <p className="text-muted-foreground text-sm mb-4 dark:text-bondi-blue-200">
            &quot;{group.name}&quot; ha sido eliminado correctamente
          </p>
          <a
            href="/groups"
            className="inline-block bg-bondi-blue-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-bondi-blue-500 transition text-sm"
          >
            Ver Todos los Grupos
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link
        href={`/dashboard/${group.id}`}
        className="block border border-border rounded-lg p-6 hover:shadow-lg hover:border-bondi-blue-200 transition bg-background dark:bg-bondi-blue-700 dark:border-bondi-blue-600 dark:hover:border-bondi-blue-400"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isCreator ? "bg-bondi-blue-100 dark:bg-bondi-blue-600" : "bg-muted dark:bg-bondi-blue-700"
              }`}
            >
              <Users
                className={isCreator ? "text-bondi-blue-500 dark:text-bondi-blue-200" : "text-muted-foreground dark:text-bondi-blue-300"}
                size={28}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground dark:text-bondi-blue-50">{group.name}</h3>
              <div className="flex gap-2 mt-1 flex-wrap">
                {group.familyCount !== undefined && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground dark:bg-bondi-blue-600 dark:text-bondi-blue-200">
                    {group.familyCount}{" "}
                    {group.familyCount === 1 ? "familia" : "familias"}
                  </span>
                )}
                {group.partyCount !== undefined && group.partyCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    {group.partyCount}{" "}
                    {group.partyCount === 1 ? "fiesta" : "fiestas"}
                  </span>
                )}
                {isCreator !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isCreator
                        ? "bg-bondi-blue-100 text-bondi-blue-700 dark:bg-bondi-blue-600 dark:text-bondi-blue-100"
                        : "bg-muted text-muted-foreground dark:bg-bondi-blue-600 dark:text-bondi-blue-200"
                    }`}
                  >
                    {isCreator ? "Creador" : "Miembro"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <code className="text-sm text-muted-foreground font-mono dark:text-bondi-blue-200">
            {group.invite_code}
          </code>

          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-2 text-muted-foreground hover:text-bondi-blue-500 hover:bg-bondi-blue-50 rounded-lg transition dark:text-bondi-blue-300 dark:hover:text-bondi-blue-100 dark:hover:bg-bondi-blue-600"
                title="Copiar código"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition dark:text-bondi-blue-300 dark:hover:text-emerald-300 dark:hover:bg-emerald-900"
                title="Compartir por WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
              {isCreator && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition dark:text-bondi-blue-300 dark:hover:text-red-400 dark:hover:bg-red-900"
                  title="Eliminar grupo"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <Button
                onClick={(e) => e.stopPropagation()}
                className="text-sm"
              >
                Dashboard →
              </Button>
            </div>
          )}
        </div>
      </Link>

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Eliminar grupo"
          message={`¿Estás seguro de eliminar el grupo "${group.name}"? Esta acción eliminará todas las familias y cumpleaños asociados.`}
          dangerous
        />
      )}
    </>
  );
}
