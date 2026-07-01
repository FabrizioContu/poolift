"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui-custom/Button";
import { useIsCoordinator } from "@/lib/hooks/useIsCoordinator";

const AddProposalModal = dynamic(
  () => import("@/components/modals/AddProposalModal"),
);

interface AddProposalButtonProps {
  partyId: string;
  coordinatorId: string | null;
  groupId: string;
  /** Cuando ya existe una propuesta para la fiesta, el botón no se muestra
   * (una sola propuesta de regalo por fiesta). */
  hasProposal?: boolean;
}

export function AddProposalButton({
  partyId,
  coordinatorId,
  groupId,
  hasProposal = false,
}: AddProposalButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const isCoordinator = useIsCoordinator(coordinatorId, groupId);

  if (!isCoordinator || hasProposal) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Crear propuesta de regalo</Button>

      {showModal && (
        <AddProposalModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          partyId={partyId}
        />
      )}
    </>
  );
}
