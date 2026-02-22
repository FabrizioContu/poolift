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

function checkIsCoordinator(coordinatorId: string | null, groupId: string): boolean {
  if (typeof window === "undefined" || !coordinatorId || !groupId) return false;
  try {
    const sessions = localStorage.getItem("poolift_groups");
    if (!sessions) return false;
    const groupSessions: Array<{ groupId: string; familyId: string }> = JSON.parse(sessions);
    const session = groupSessions.find((s) => s.groupId === groupId);
    return session?.familyId === coordinatorId;
  } catch {
    return false;
  }
}

function useIsCoordinator(coordinatorId: string | null, groupId: string): boolean {
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    setIsCoordinator(checkIsCoordinator(coordinatorId, groupId));
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
