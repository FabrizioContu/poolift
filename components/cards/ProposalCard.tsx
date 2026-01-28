"use client";

import { useState } from "react";
import { ThumbsUp, ExternalLink, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";
import { SelectProposalButton } from "@/components/proposals/SelectProposalButton";

const ConfirmDeleteModal = dynamic(
  () => import("@/components/modals/ConfirmDeleteModal"),
);

interface ProposalItem {
  id: string;
  item_name: string;
  item_price: number | null;
  product_link: string | null;
}

interface Vote {
  id: string;
  voter_name: string;
}

interface ProposalCardProps {
  proposal: {
    id: string;
    name: string;
    total_price: number;
    is_selected: boolean;
    proposal_items: ProposalItem[];
    votes: Vote[];
    party_id?: string;
  };
  partyId?: string;
  isCoordinator?: boolean;
  hasOtherSelected?: boolean;
  onVoteSuccess?: () => void;
}

export function ProposalCard({
  proposal,
  partyId,
  isCoordinator = false,
  hasOtherSelected = false,
  onVoteSuccess,
}: ProposalCardProps) {
  const effectivePartyId = partyId || proposal.party_id || "";
  const [isVoting, setIsVoting] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!voterName.trim()) {
      setError("Ingresa tu nombre");
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterName: voterName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al votar");
      }

      setShowVoteForm(false);
      setVoterName("");
      onVoteSuccess?.();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al votar");
    } finally {
      setIsVoting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error);
        return;
      }

      setShowDeleteModal(false);
      window.location.reload();
    } catch {
      setDeleteError("Error al eliminar la propuesta");
    }
  };

  const canDelete = !proposal.is_selected && proposal.votes.length === 0;

  return (
    <>
      <div
        className={`border rounded-lg p-4 ${
          proposal.is_selected
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {proposal.name}
              {proposal.is_selected && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={12} />
                  Seleccionada
                </span>
              )}
            </h3>
            <p className="text-blue-600 font-medium">
              {formatPrice(proposal.total_price)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-500">
              <ThumbsUp size={16} />
              <span className="text-sm font-medium">
                {proposal.votes.length}
              </span>
            </div>
            {canDelete && (
              <button
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                title="Eliminar propuesta"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {proposal.proposal_items.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Items:</p>
            <ul className="space-y-1">
              {proposal.proposal_items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {item.item_name}
                    {item.product_link && (
                      <a
                        href={item.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </span>
                  {item.item_price && (
                    <span className="text-gray-500">
                      {formatPrice(item.item_price)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposal.votes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Votos:</p>
            <div className="flex flex-wrap gap-1">
              {proposal.votes.map((vote) => (
                <span
                  key={vote.id}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {vote.voter_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {!proposal.is_selected && !hasOtherSelected && (
          <div>
            {showVoteForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className="flex gap-4">
                  <Button
                    onClick={handleVote}
                    disabled={isVoting}
                    className="flex-1 text-sm"
                  >
                    {isVoting ? "Votando..." : "Confirmar"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowVoteForm(false);
                      setError(null);
                    }}
                    className="text-sm hover:bg-red-100 "
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowVoteForm(true)}
                className="w-full flex justify-center gap-2 items-center"
              >
                <ThumbsUp size={14} className="mr-2" />
                Votar
              </Button>
            )}
          </div>
        )}

        {/* Coordinator Actions */}
        <SelectProposalButton
          proposalId={proposal.id}
          proposalName={proposal.name}
          totalPrice={proposal.total_price}
          partyId={effectivePartyId}
          isSelected={proposal.is_selected}
          isCoordinator={isCoordinator}
          hasOtherSelected={hasOtherSelected}
        />
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar propuesta?"
          message={`Se eliminará la propuesta "${proposal.name}".`}
          warningText={deleteError || undefined}
          confirmText="Eliminar Propuesta"
        />
      )}
    </>
  );
}
