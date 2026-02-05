"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ProposalCard } from "@/components/cards/ProposalCard";
import { IdeasByChild } from "@/components/cards/IdeasByChild";
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

interface Idea {
  id: string;
  birthday_id: string;
  product_name: string;
  product_link: string | null;
  price: number | null;
  comment: string | null;
  suggested_by: string;
}

interface Celebrant {
  birthday_id: string;
  birthdays: {
    id: string;
    child_name: string;
  };
}

interface PartyDetailTabsProps {
  proposals: Proposal[];
  ideas: Idea[];
  celebrants: Celebrant[];
  partyId: string;
  coordinatorId: string | null;
  groupId: string;
}

const tabs = [
  { id: "proposals", label: "Propuestas" },
  { id: "ideas", label: "Ideas" },
];

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

export function PartyDetailTabs({
  proposals,
  ideas,
  celebrants,
  partyId,
  coordinatorId,
  groupId,
}: PartyDetailTabsProps) {
  const isCoordinator = useIsCoordinator(coordinatorId, groupId);
  const hasAnySelected = proposals.some((p) => p.is_selected);

  return (
    <Tabs tabs={tabs} defaultTab="proposals">
      {(activeTab) => (
        <>
          {activeTab === "proposals" && (
            <div>
              {proposals.length === 0 ? (
                <div className="text-center py-8 text-gray-700">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No hay propuestas todavía.</p>
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
          )}

          {activeTab === "ideas" && (
            <IdeasByChild ideas={ideas} celebrants={celebrants} />
          )}
        </>
      )}
    </Tabs>
  );
}
