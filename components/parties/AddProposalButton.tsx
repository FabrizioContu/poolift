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

// Hook to check if current user is the coordinator using localStorage
function useIsCoordinator(coordinatorId: string | null, groupId: string): boolean {
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    if (!coordinatorId || !groupId) return;

    try {
      const sessions = localStorage.getItem("poolift_groups");
      if (!sessions) return;
      const groupSessions = JSON.parse(sessions);
      const session = groupSessions.find(
        (s: { groupId: string; familyId: string }) => s.groupId === groupId
      );
      setIsCoordinator(session?.familyId === coordinatorId);
    } catch {
      setIsCoordinator(false);
    }
  }, [coordinatorId, groupId]);

  return isCoordinator;
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
