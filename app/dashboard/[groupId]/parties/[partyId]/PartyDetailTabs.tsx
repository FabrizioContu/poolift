"use client";

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
  isCoordinator: boolean;
}

const tabs = [
  { id: "proposals", label: "Propuestas" },
  { id: "ideas", label: "Ideas" },
];

export function PartyDetailTabs({
  proposals,
  ideas,
  celebrants,
  partyId,
  isCoordinator,
}: PartyDetailTabsProps) {
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
