"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

const AddProposalModal = dynamic(
  () => import("@/components/modals/AddProposalModal"),
);

interface AddProposalButtonProps {
  partyId: string;
  isCoordinator: boolean;
}

export function AddProposalButton({
  partyId,
  isCoordinator,
}: AddProposalButtonProps) {
  const [showModal, setShowModal] = useState(false);

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
