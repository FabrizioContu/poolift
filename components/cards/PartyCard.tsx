"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, User, Trash2 } from "lucide-react";
import { formatDate, formatCelebrants } from "@/lib/utils";
import dynamic from "next/dynamic";

const ConfirmDeleteModal = dynamic(
  () => import("@/components/modals/ConfirmDeleteModal")
);

interface PartyCardProps {
  party: {
    id: string;
    group_id: string;
    party_date: string;
    coordinator: { name: string } | null;
    party_celebrants: Array<{
      birthdays: { child_name: string };
    }>;
  };
}

export function PartyCard({ party }: PartyCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const celebrantNames = party.party_celebrants.map(
    (pc) => pc.birthdays.child_name
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (): Promise<{ error?: string } | void> => {
    try {
      const response = await fetch(`/api/parties/${party.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Error al eliminar la fiesta" };
      }

      setShowDeleteModal(false);
      window.location.reload();
    } catch {
      return { error: "Error de conexión al eliminar la fiesta" };
    }
  };

  return (
    <>
      <Link
        href={`/dashboard/${party.group_id}/parties/${party.id}`}
        className="block bg-background border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/40 transition"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Calendar size={16} />
              <span>{formatDate(party.party_date)}</span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
              Fiesta de {formatCelebrants(celebrantNames)}
            </h3>

            <div className="flex items-center gap-2 text-muted-foreground ">
              <Users size={16} />
              <span>
                {celebrantNames.length}{" "}
                {celebrantNames.length === 1 ? "niño" : "niños"}
              </span>
            </div>

            {party.coordinator && (
              <div className="flex items-center gap-2 text-muted-foreground mt-2 ">
                <User size={16} />
                <span>Coordinador: {party.coordinator.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 px-3 py-1 rounded-full dark:bg-yellow-900">
              <span className="text-yellow-800 text-sm font-medium dark:text-yellow-300">Ideas</span>
            </div>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition dark:hover:text-red-400 dark:hover:bg-red-900"
              title="Eliminar fiesta"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </Link>

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar fiesta?"
          message={`Se eliminará la fiesta de ${formatCelebrants(celebrantNames)}.`}
          confirmText="Eliminar Fiesta"
        />
      )}
    </>
  );
}
