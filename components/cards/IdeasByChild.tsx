"use client";

import { useState } from "react";
import { ExternalLink, Gift, User, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";

const ConfirmDeleteModal = dynamic(
  () => import("@/components/modals/ConfirmDeleteModal")
);

interface Idea {
  id: string;
  birthday_id: string;
  product_name: string;
  product_link: string | null;
  price: number | null;
  comment: string | null;
  suggested_by: string;
}

interface Celebrant {
  birthday_id: string;
  birthdays: {
    id: string;
    child_name: string;
  };
}

interface IdeasByChildProps {
  ideas: Idea[];
  celebrants: Celebrant[];
}

export function IdeasByChild({ ideas, celebrants }: IdeasByChildProps) {
  const [deleteIdeaId, setDeleteIdeaId] = useState<string | null>(null);
  const [deleteIdeaName, setDeleteIdeaName] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const ideasByBirthday = celebrants.map((celebrant) => ({
    childName: celebrant.birthdays.child_name,
    birthdayId: celebrant.birthday_id,
    ideas: ideas.filter((idea) => idea.birthday_id === celebrant.birthday_id),
  }));

  const handleDeleteClick = (idea: Idea) => {
    setDeleteIdeaId(idea.id);
    setDeleteIdeaName(idea.product_name);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteIdeaId) return;

    try {
      const response = await fetch(`/api/ideas/${deleteIdeaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error);
        return;
      }

      setDeleteIdeaId(null);
      window.location.reload();
    } catch {
      setDeleteError("Error al eliminar la idea");
    }
  };

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Gift size={48} className="mx-auto mb-3 opacity-50" />
        <p>No hay ideas registradas todavía.</p>
        <p className="text-sm mt-1">
          Las familias pueden sugerir regalos para los celebrantes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {ideasByBirthday.map(({ childName, birthdayId, ideas: childIdeas }) => (
          <div key={birthdayId}>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 p-1 rounded">
                <Gift size={16} />
              </span>
              Ideas para {childName}
            </h3>

            {childIdeas.length === 0 ? (
              <p className="text-gray-500 text-sm pl-7">
                Sin ideas por el momento
              </p>
            ) : (
              <div className="space-y-2 pl-7">
                {childIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{idea.product_name}</span>
                          {idea.product_link && (
                            <a
                              href={idea.product_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        {idea.comment && (
                          <p className="text-gray-600 text-sm mt-1">
                            {idea.comment}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                          <User size={12} />
                          <span>Sugerido por {idea.suggested_by}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {idea.price && (
                          <span className="text-blue-600 font-medium text-sm">
                            {formatPrice(idea.price)}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteClick(idea)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                          title="Eliminar idea"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteIdeaId && (
        <ConfirmDeleteModal
          isOpen={!!deleteIdeaId}
          onClose={() => setDeleteIdeaId(null)}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar idea?"
          message={`Se eliminará la idea "${deleteIdeaName}".`}
          warningText={deleteError || undefined}
          confirmText="Eliminar Idea"
        />
      )}
    </>
  );
}
