import { createClient } from "@/lib/supabase/server";
import { GiftParticipation } from "./GiftParticipation";
import { DirectGiftParticipation } from "./DirectGiftParticipation";
import { DirectGiftOrganizerActions } from "./DirectGiftOrganizerActions";
import { CoordinatorActions } from "./CoordinatorActions";
import {
  formatDate,
  formatPrice,
  formatCelebrants,
  calculatePricePerFamily,
} from "@/lib/utils";
import {
  Gift,
  Calendar,
  Users,
  CheckCircle,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { OCCASION_LABELS, type OccasionType } from "@/lib/types";
import Link from "next/link";

interface DirectGiftParticipant {
  id: string;
  participant_name: string;
  joined_at: string;
  status: "joined" | "declined";
}

interface DirectGift {
  id: string;
  recipient_name: string;
  occasion: OccasionType;
  gift_idea: string | null;
  estimated_price: number | null;
  organizer_name: string;
  organizer_comment: string | null;
  receipt_image_url: string | null;
  share_code: string;
  status: string;
  created_at: string;
  participants: DirectGiftParticipant[];
}

async function getDirectGift(shareCode: string): Promise<DirectGift | null> {
  const supabase = await createClient();
  const { data: gift, error } = await supabase
    .from("direct_gifts")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (error || !gift) {
    return null;
  }

  // Fetch participants separately
  const { data: participants } = await supabase
    .from("direct_gift_participants")
    .select("*")
    .eq("direct_gift_id", gift.id)
    .order("joined_at", { ascending: true });

  return {
    ...gift,
    participants: participants || [],
  };
}

async function getGift(shareCode: string) {
  const supabase = await createClient();
  const { data: gift, error } = await supabase
    .from("gifts")
    .select(
      `
      *,
      party:parties(
        id,
        party_date,
        coordinator_id,
        group_id,
        coordinator:families!parties_coordinator_id_fkey(id, name),
        party_celebrants(
          birthdays(child_name)
        )
      ),
      proposal:proposals(
        id,
        name,
        total_price,
        proposal_items(
          id,
          item_name,
          item_price,
          product_link
        )
      ),
      participants(
        id,
        family_name,
        joined_at,
        status
      )
    `,
    )
    .eq("share_code", shareCode)
    .single();

  if (error) {
    console.error("Error fetching gift:", error);
    return null;
  }

  return gift;
}

export default async function GiftPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;

  // First try direct gift, then party gift
  const directGift = await getDirectGift(shareCode);

  if (directGift) {
    // Handle cancelled direct gifts
    if (directGift.status === "cancelled") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="text-center px-4">
            <Gift className="mx-auto text-muted-foreground/60 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Regalo Cancelado
            </h1>
            <p className="text-muted-foreground mb-4">
              Este regalo ha sido cancelado por el organizador
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/70 font-medium"
            >
              <ArrowLeft size={18} />
              Ir a Mis Grupos
            </Link>
          </div>
        </div>
      );
    }

    const isClosed = directGift.status === "closed";
    const isPurchased = directGift.status === "purchased";
    const joinedParticipants = directGift.participants.filter(
      (p) => p.status === "joined",
    );
    const declinedParticipants = directGift.participants.filter(
      (p) => p.status === "declined",
    );
    const participantCount = joinedParticipants.length;
    const pricePerPerson =
      participantCount > 0 && directGift.estimated_price
        ? calculatePricePerFamily(directGift.estimated_price, participantCount)
        : null;

    // Render Direct Gift page
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 to-background py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Navigation */}
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Mis Grupos</span>
          </Link>

          {/* Header Card */}
          <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="text-center">
              <div className="mb-4">
                {isPurchased ? (
                  <CheckCircle className="mx-auto text-emerald-500" size={56} />
                ) : isClosed ? (
                  <Lock className="mx-auto text-muted-foreground" size={56} />
                ) : (
                  <Gift className="mx-auto text-primary" size={56} />
                )}
              </div>

              <span className="inline-block bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full font-medium mb-3">
                {OCCASION_LABELS[directGift.occasion]}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Regalo para {directGift.recipient_name}
              </h1>

              {/* Status Badge */}
              {isPurchased && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium mb-2">
                  <CheckCircle size={16} />
                  Comprado
                </span>
              )}
              {isClosed && !isPurchased && (
                <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full font-medium mb-2">
                  <Lock size={16} />
                  Participación Cerrada
                </span>
              )}

              <p className="text-muted-foreground text-sm">
                Organizado por {directGift.organizer_name}
              </p>
            </div>

            {/* Gift Idea */}
            {directGift.gift_idea && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  Regalo propuesto
                </h3>
                <p className="text-muted-foreground">{directGift.gift_idea}</p>
                {directGift.estimated_price && (
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {formatPrice(directGift.estimated_price)}
                  </p>
                )}
              </div>
            )}

            {/* Only price if no idea */}
            {!directGift.gift_idea && directGift.estimated_price && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Precio estimado</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(directGift.estimated_price)}
                </p>
              </div>
            )}

            {/* Price Per Person - when closed or purchased */}
            {(isClosed || isPurchased) && pricePerPerson && (
              <div className="mt-4 p-4 bg-primary/10 rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-1">Precio por familia</p>
                <p className="text-3xl font-bold text-primary">
                  {pricePerPerson}€
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({participantCount} familias)
                </p>
              </div>
            )}

            {/* Organizer Comment */}
            {directGift.organizer_comment && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border-l-4 border-primary/40">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Comentario del organizador:
                </p>
                <p className="text-foreground italic">
                  &quot;{directGift.organizer_comment}&quot;
                </p>
              </div>
            )}

            {/* Receipt Link */}
            {directGift.receipt_image_url && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <a
                  href={directGift.receipt_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/70 text-sm font-medium"
                >
                  📎 Ver recibo de compra
                </a>
              </div>
            )}
          </div>

          {/* Organizer Actions */}
          <DirectGiftOrganizerActions
            giftId={directGift.id}
            shareCode={shareCode}
            recipientName={directGift.recipient_name}
            giftIdea={directGift.gift_idea}
            status={directGift.status}
            participantCount={participantCount}
            participantNames={joinedParticipants.map(
              (p) => p.participant_name,
            )}
            estimatedPrice={directGift.estimated_price}
          />

          {/* Participants Card */}
          <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Users size={20} />
                Familias participantes
              </h2>
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full font-semibold">
                {participantCount}
              </span>
            </div>

            {participantCount === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                Sé la primera familia en apuntarse
              </p>
            ) : (
              <ul className="space-y-2">
                {joinedParticipants.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium text-foreground">
                      {p.participant_name}
                    </span>
                    <span className="text-sm text-foreground">
                      {new Date(p.joined_at).toLocaleDateString("es-ES")}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {declinedParticipants.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  No pueden participar
                </p>
                <ul className="space-y-1">
                  {declinedParticipants.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg"
                    >
                      <span className="text-sm text-muted-foreground/60 line-through">
                        {p.participant_name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Participation Component */}
          <DirectGiftParticipation
            giftId={directGift.id}
            shareCode={shareCode}
            status={directGift.status}
            organizerName={directGift.organizer_name}
            participants={directGift.participants}
          />
        </div>
      </div>
    );
  }

  const gift = await getGift(shareCode);

  if (!gift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center px-4">
          <Gift className="mx-auto text-muted-foreground/60 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Regalo no encontrado
          </h1>
          <p className="text-muted-foreground mb-4">
            Verifica el enlace e intenta nuevamente
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/70 font-medium"
          >
            <ArrowLeft size={18} />
            Ir a Mis Grupos
          </Link>
        </div>
      </div>
    );
  }

  const celebrantNames =
    gift.party?.party_celebrants?.map(
      (pc: { birthdays: { child_name: string } }) => pc.birthdays.child_name,
    ) || [];

  const isClosed = !gift.participation_open;
  const isPurchased = !!gift.purchased_at;
  const joinedGiftParticipants =
    gift.participants?.filter(
      (p: { status: string }) => p.status === "joined",
    ) || [];
  const declinedGiftParticipants =
    gift.participants?.filter(
      (p: { status: string }) => p.status === "declined",
    ) || [];
  const participantCount = joinedGiftParticipants.length;
  const totalPrice = gift.proposal?.total_price || 0;

  // Calculate price per family
  const pricePerFamily =
    participantCount > 0
      ? calculatePricePerFamily(
          gift.final_price || totalPrice,
          participantCount,
        )
      : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-primary/20 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Navigation */}
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Mis Grupos</span>
        </Link>

        {/* Header Card */}
        <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="text-center">
            <div className="mb-4">
              {isPurchased ? (
                <CheckCircle className="mx-auto text-emerald-500" size={56} />
              ) : isClosed ? (
                <Lock className="mx-auto text-muted-foreground" size={56} />
              ) : (
                <Gift className="mx-auto text-primary" size={56} />
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Regalo para {formatCelebrants(celebrantNames)}
            </h1>

            {/* Status Badge */}
            {isPurchased && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm px-3 py-1 rounded-full font-medium mb-4">
                <CheckCircle size={16} />
                Comprado
              </span>
            )}
            {isClosed && !isPurchased && (
              <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full font-medium mb-4">
                <Lock size={16} />
                Participación Cerrada
              </span>
            )}

            {/* Party Date */}
            {gift.party?.party_date && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
                <Calendar size={18} />
                <span>{formatDate(gift.party.party_date)}</span>
              </div>
            )}
          </div>

          {/* Selected Proposal */}
          {gift.proposal && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                {gift.proposal.name}
              </h3>
              {gift.proposal.proposal_items?.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {gift.proposal.proposal_items.map(
                    (item: {
                      id: string;
                      item_name: string;
                      item_price: number | null;
                      product_link: string | null;
                    }) => (
                      <li
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          {item.item_name}
                          {item.product_link && (
                            <a
                              href={item.product_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/70 text-xs"
                            >
                              Ver
                            </a>
                          )}
                        </span>
                        {item.item_price && (
                          <span className="font-medium text-muted-foreground">
                            {formatPrice(item.item_price)}
                          </span>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              )}
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(gift.final_price || totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Price Per Family - Finalized (with real price) */}
          {isPurchased && (
            <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-primary/10 dark:from-emerald-900/20 dark:to-primary/10 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio final pagado:</p>
              <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400 mb-3">
                {formatPrice(gift.final_price || totalPrice)}
              </p>
              <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-muted-foreground mb-1">
                  Precio por familia:
                </p>
                <p className="text-2xl font-bold text-primary">
                  {pricePerFamily}€
                </p>
                <p className="text-xs text-foreground mt-1">
                  ({participantCount} familias participantes)
                </p>
              </div>
            </div>
          )}

          {/* Price Per Family - Closed but not purchased (estimated) */}
          {isClosed && !isPurchased && pricePerFamily && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio por familia:</p>
              <p className="text-3xl font-bold text-primary">
                {pricePerFamily}€
              </p>
              <p className="text-xs text-foreground mt-1">
                ({participantCount} familias participantes)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                (Precio estimado - pendiente de compra final)
              </p>
            </div>
          )}

          {/* Coordinator Comment */}
          {gift.coordinator_comment && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border-l-4 border-primary/40">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                💬 Comentario del coordinador:
              </p>
              <p className="text-foreground italic">
                &quot;{gift.coordinator_comment}&quot;
              </p>
            </div>
          )}

          {/* Receipt Link */}
          {gift.receipt_image_url && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <a
                href={gift.receipt_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/70 text-sm font-medium"
              >
                📎 Ver recibo de compra
              </a>
            </div>
          )}
        </div>

        {/* Participants Card */}
        <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Users size={24} />
              Familias Participantes
            </h2>
            <span className="bg-primary/15 text-primary px-3 py-1 rounded-full font-semibold">
              {participantCount}
            </span>
          </div>

          {participantCount === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Sé la primera familia en apuntarte
            </p>
          ) : (
            <ul className="space-y-2">
              {joinedGiftParticipants.map(
                (p: { id: string; family_name: string; joined_at: string }) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{p.family_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(p.joined_at).toLocaleDateString("es-ES")}
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}

          {declinedGiftParticipants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                No pueden participar
              </p>
              <ul className="space-y-1">
                {declinedGiftParticipants.map(
                  (p: { id: string; family_name: string }) => (
                    <li key={p.id} className="flex items-center p-2 rounded-lg">
                      <span className="text-sm text-muted-foreground/60 line-through">
                        {p.family_name}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Coordinator Actions */}
        <CoordinatorActions
          giftId={gift.id}
          shareCode={shareCode}
          giftName={gift.proposal?.name || "Regalo"}
          celebrantNames={celebrantNames}
          coordinatorId={gift.party?.coordinator_id || null}
          groupId={gift.party?.group_id || null}
          participationOpen={gift.participation_open}
          isPurchased={isPurchased}
          participantCount={participantCount}
          participantNames={joinedGiftParticipants.map(
            (p: { family_name: string }) => p.family_name,
          )}
          totalPrice={totalPrice}
        />

        {/* Participation Component */}
        <GiftParticipation
          giftId={gift.id}
          participationOpen={gift.participation_open}
          isPurchased={isPurchased}
          coordinatorName={gift.party?.coordinator?.name || null}
          groupId={gift.party?.group_id || null}
          participants={gift.participants?.map((p: { id: string; family_name: string; status: string }) => ({
            id: p.id,
            family_name: p.family_name,
            status: (p.status ?? 'joined') as 'joined' | 'declined',
          })) || []}
        />
      </div>
    </div>
  );
}
