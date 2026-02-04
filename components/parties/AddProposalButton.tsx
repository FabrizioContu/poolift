"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

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
  const [isCoordinator, setIsCoordinator] = useState(false);

  // Check if current user is the coordinator
  useEffect(() => {
    if (!coordinatorId || !groupId) {
      setIsCoordinator(false);
      return;
    }

    const sessions = localStorage.getItem("poolift_groups");
    if (sessions) {
      const groupSessions = JSON.parse(sessions);
      const session = groupSessions.find(
        (s: { groupId: string; familyId: string }) => s.groupId === groupId
      );
      if (session && session.familyId === coordinatorId) {
        setIsCoordinator(true);
      }
    }
  }, [coordinatorId, groupId]);

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
