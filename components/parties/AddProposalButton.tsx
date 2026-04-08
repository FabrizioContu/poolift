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
}

export function AddProposalButton({
  partyId,
  coordinatorId,
  groupId,
}: AddProposalButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const isCoordinator = useIsCoordinator(coordinatorId, groupId);

  if (!isCoordinator) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Añadir Propuesta</Button>

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
