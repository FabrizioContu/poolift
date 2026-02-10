import { supabase } from "@/lib/supabase";
import { formatDate, formatCelebrants, getPartyStatus } from "@/lib/utils";
import { Calendar, Users, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PartyDetailTabs } from "./PartyDetailTabs";
import { AddProposalButton } from "@/components/parties/AddProposalButton";
import { GiftStatusCard } from "@/components/gifts/GiftStatusCard";

interface PartyWithRelations {
  id: string;
  party_date: string;
  coordinator_id: string | null;
  coordinator: { id: string; name: string } | null;
  party_celebrants: Array<{
    birthday_id: string;
    birthdays: {
      id: string;
      child_name: string;
    };
  }>;
}

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

async function getParty(partyId: string): Promise<PartyWithRelations | null> {
  const { data, error } = await supabase
    .from("parties")
    .select(
      `
      *,
      coordinator:families!parties_coordinator_id_fkey(id, name),
      party_celebrants(
        birthday_id,
        birthdays(id, child_name)
      )
    `
    )
    .eq("id", partyId)
    .single();

  if (error) {
    console.error("Error fetching party:", error);
    return null;
  }

  return data as PartyWithRelations;
}

async function getProposals(partyId: string): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      proposal_items(*),
      votes(id, voter_name)
    `
    )
    .eq("party_id", partyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  return data as Proposal[];
}

interface GiftWithParticipants {
  id: string;
  share_code: string;
  participation_open: boolean;
  purchased_at: string | null;
  final_price: number | null;
  proposal: { name: string; total_price: number } | null;
  participants: Array<{ id: string }>;
}

async function getGiftForParty(partyId: string): Promise<GiftWithParticipants | null> {
  const { data: gift, error } = await supabase
    .from("gifts")
    .select(`
      id,
      share_code,
      participation_open,
      purchased_at,
      final_price,
      proposal:proposals(name, total_price),
      participants(id)
    `)
    .eq("party_id", partyId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching gift:", error);
    return null;
  }

  if (!gift) return null;

  // Supabase join can return proposal as array or object
  const proposal = Array.isArray(gift.proposal)
    ? gift.proposal[0] || null
    : gift.proposal;

  return {
    id: gift.id,
    share_code: gift.share_code,
    participation_open: gift.participation_open,
    purchased_at: gift.purchased_at,
    final_price: gift.final_price,
    proposal,
    participants: gift.participants || [],
  } as GiftWithParticipants;
}

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; partyId: string }>;
}) {
  const { groupId, partyId } = await params;

  const [party, proposals, gift] = await Promise.all([
    getParty(partyId),
    getProposals(partyId),
    getGiftForParty(partyId),
  ]);

  if (!party) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Fiesta no encontrada</p>
        <Link
          href={`/dashboard/${groupId}`}
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const celebrantNames = party.party_celebrants.map(
    (pc) => pc.birthdays.child_name
  );
  const status = getPartyStatus(proposals, gift);

  // coordinatorId and groupId will be passed to client components
  // to check if current user (from localStorage) is the coordinator
  const coordinatorId = party.coordinator_id;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/dashboard/${groupId}`}
        className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} />
        <span>Volver al calendario</span>
      </Link>

      {/* Header */}
      <header className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-gray-700 text-sm mb-2">
              <Calendar size={16} />
              <span>{formatDate(party.party_date)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fiesta de {formatCelebrants(celebrantNames)}
            </h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {celebrantNames.length}{" "}
              {celebrantNames.length === 1 ? "celebrante" : "celebrantes"}
            </span>
          </div>
          {party.coordinator && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>Coordinador: {party.coordinator.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <AddProposalButton
          partyId={partyId}
          coordinatorId={coordinatorId}
          groupId={groupId}
        />
      </div>

      {/* Gift Status Card */}
      {gift && (
        <GiftStatusCard
          gift={{
            id: gift.id,
            share_code: gift.share_code,
            participation_open: gift.participation_open,
            purchased_at: gift.purchased_at,
            final_price: gift.final_price,
            participantCount: gift.participants?.length || 0,
          }}
          proposalName={gift.proposal?.name || 'Regalo conjunto'}
          totalPrice={gift.proposal?.total_price || 0}
        />
      )}

      {/* Proposals */}
      <PartyDetailTabs
        proposals={proposals}
        partyId={partyId}
        coordinatorId={coordinatorId}
        groupId={groupId}
      />
    </div>
  );
}
