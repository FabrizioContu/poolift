"use client";

import { useState, useEffect } from "react";
import { ProposalCard } from "@/components/cards/ProposalCard";
import { FileText } from "lucide-react";

interface Proposal {
  id: string;
  name: string;
  total_price: number;
  is_selected: boolean;
  proposal_items: Array<{
    id: string;
    item_name: string;
    item_price: number | null;
    product_link: string | null;
  }>;
  votes: Array<{
    id: string;
    voter_name: string;
  }>;
}

interface PartyDetailTabsProps {
  proposals: Proposal[];
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

export function PartyDetailTabs({
  proposals,
  partyId,
  coordinatorId,
  groupId,
}: PartyDetailTabsProps) {
  const isCoordinator = useIsCoordinator(coordinatorId, groupId);
  const hasAnySelected = proposals.some((p) => p.is_selected);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Propuestas</h2>
      {proposals.length === 0 ? (
        <div className="text-center py-8 text-gray-700">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay propuestas todavia.</p>
          <p className="text-sm mt-1">
            El coordinador puede crear propuestas de regalo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              partyId={partyId}
              isCoordinator={isCoordinator}
              hasOtherSelected={hasAnySelected && !proposal.is_selected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
