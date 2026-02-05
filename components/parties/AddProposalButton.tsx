"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
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
  const getSnapshot = useCallback(() => {
    if (!coordinatorId || !groupId) return false;

    const sessions = localStorage.getItem("poolift_groups");
    if (sessions) {
      try {
        const groupSessions = JSON.parse(sessions);
        const session = groupSessions.find(
          (s: { groupId: string; familyId: string }) => s.groupId === groupId
        );
        return session?.familyId === coordinatorId;
      } catch {
        return false;
      }
    }
    return false;
  }, [coordinatorId, groupId]);

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
