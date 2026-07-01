"use client";

import { useState } from "react";
import { ExternalLink, Check, Trash2, Pencil } from "lucide-react";
import { Badge, IconButton } from "@/components/ui-custom";
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";
import { SelectProposalButton } from "@/components/proposals/SelectProposalButton";
import { getGroupSession } from "@/lib/auth";

const ConfirmDeleteModal = dynamic(
  () => import("@/components/modals/ConfirmDeleteModal"),
);

const AddProposalModal = dynamic(
  () => import("@/components/modals/AddProposalModal"),
);

interface ProposalItem {
  id: string;
  item_name: string;
  item_price: number | null;
  product_link: string | null;
}

interface ProposalCardProps {
  proposal: {
    id: string;
    name: string;
    total_price: number;
    is_selected: boolean;
    proposal_items: ProposalItem[];
    party_id?: string;
  };
  partyId?: string;
  groupId?: string;
  isCoordinator?: boolean;
}

export function ProposalCard({
  proposal,
  partyId,
  groupId = "",
  isCoordinator = false,
}: ProposalCardProps) {
  const effectivePartyId = partyId || proposal.party_id || "";
  const familyId = getGroupSession(groupId)?.familyId ?? null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId }),
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

  const canEdit = isCoordinator && !proposal.is_selected;
  const canDelete = !proposal.is_selected;

  return (
    <>
      <div
        className={`border rounded-lg p-4 ${
          proposal.is_selected
            ? "border-emerald-400 bg-emerald-50 dark:border-ocean-mist-400 dark:bg-ocean-mist-800"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              {proposal.name}
              {proposal.is_selected && (
                <Badge variant="green" size="sm" className="bg-emerald-400 text-white">
                  <Check size={12} className="mr-1" />
                  Regalo activo
                </Badge>
              )}
            </h3>
            <p className="text-primary font-medium">
              {formatPrice(proposal.total_price)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <IconButton
                icon={Pencil}
                label="Editar propuesta"
                onClick={() => setShowEditModal(true)}
              />
            )}
            {canDelete && (
              <IconButton
                icon={Trash2}
                variant="danger"
                label="Eliminar propuesta"
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteModal(true);
                }}
              />
            )}
          </div>
        </div>

        {proposal.proposal_items.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 ">Items:</p>
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
                        className="text-primary hover:text-primary/70"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </span>
                  {item.item_price && (
                    <span className="text-muted-foreground ">
                      {formatPrice(item.item_price)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coordinator Actions */}
        <SelectProposalButton
          proposalId={proposal.id}
          proposalName={proposal.name}
          totalPrice={proposal.total_price}
          partyId={effectivePartyId}
          groupId={groupId}
          isSelected={proposal.is_selected}
          isCoordinator={isCoordinator}
        />
      </div>

      {showEditModal && (
        <AddProposalModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          partyId={effectivePartyId}
          familyId={familyId}
          proposal={{
            id: proposal.id,
            name: proposal.name,
            proposal_items: proposal.proposal_items,
          }}
        />
      )}

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
