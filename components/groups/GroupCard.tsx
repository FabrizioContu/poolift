"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users, Copy, Check, MessageCircle, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
      <div className="block border border-green-200 rounded-lg p-6 bg-green-50">
        <div className="text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Grupo eliminado
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            &quot;{group.name}&quot; ha sido eliminado correctamente
          </p>
          <a
            href="/groups"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition text-sm"
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
        className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition bg-white"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isCreator ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Users
                className={isCreator ? "text-blue-600" : "text-gray-600"}
                size={28}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
              <div className="flex gap-2 mt-1 flex-wrap">
                {group.familyCount !== undefined && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {group.familyCount}{" "}
                    {group.familyCount === 1 ? "familia" : "familias"}
                  </span>
                )}
                {group.partyCount !== undefined && group.partyCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {group.partyCount}{" "}
                    {group.partyCount === 1 ? "fiesta" : "fiestas"}
                  </span>
                )}
                {isCreator !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isCreator
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
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
          <code className="text-sm text-gray-500 font-mono">
            {group.invite_code}
          </code>

          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Copiar código"
              >
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Compartir por WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
              {isCreator && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
