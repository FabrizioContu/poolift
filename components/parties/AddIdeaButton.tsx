"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

const AddIdeaModal = dynamic(() => import("@/components/modals/AddIdeaModal"));

interface AddIdeaButtonProps {
  partyId: string;
}

export function AddIdeaButton({ partyId }: AddIdeaButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Añadir Idea
      </Button>

      {showModal && (
        <AddIdeaModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          partyId={partyId}
        />
      )}
    </>
  );
}
