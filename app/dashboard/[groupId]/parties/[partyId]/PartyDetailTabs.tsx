"use client";

import { ProposalCard } from "@/components/cards/ProposalCard";
import { FileText } from "lucide-react";
import { useIsCoordinator } from "@/lib/hooks/useIsCoordinator";

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
}

interface PartyDetailTabsProps {
  proposals: Proposal[];
  partyId: string;
  coordinatorId: string | null;
  groupId: string;
}

export function PartyDetailTabs({
  proposals,
  partyId,
  coordinatorId,
  groupId,
}: PartyDetailTabsProps) {
  const isCoordinator = useIsCoordinator(coordinatorId, groupId);
  const proposal = proposals[0] ?? null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Propuesta de regalo
      </h2>
      {!proposal ? (
        <div className="text-center py-8 text-gray-700">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay propuesta todavia.</p>
          <p className="text-sm mt-1">
            El coordinador puede crear la propuesta de regalo.
          </p>
        </div>
      ) : (
        <ProposalCard
          proposal={proposal}
          partyId={partyId}
          groupId={groupId}
          isCoordinator={isCoordinator}
        />
      )}
    </div>
  );
}
