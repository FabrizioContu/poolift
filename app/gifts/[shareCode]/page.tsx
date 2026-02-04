import { supabase } from '@/lib/supabase'
import { GiftParticipation } from './GiftParticipation'
import { DirectGiftParticipation } from './DirectGiftParticipation'
import { DirectGiftOrganizerActions } from './DirectGiftOrganizerActions'
import { CoordinatorActions } from './CoordinatorActions'
import { formatDate, formatPrice, formatCelebrants, calculatePricePerFamily } from '@/lib/utils'
import { Gift, Calendar, Users, CheckCircle, Lock, ArrowLeft } from 'lucide-react'
import { OCCASION_LABELS, type OccasionType } from '@/lib/types'
import Link from 'next/link'

interface DirectGiftParticipant {
  id: string
  participant_name: string
  joined_at: string
}

interface DirectGift {
  id: string
  recipient_name: string
  occasion: OccasionType
  gift_idea: string | null
  estimated_price: number | null
  organizer_name: string
  organizer_comment: string | null
  share_code: string
  status: string
  created_at: string
  participants: DirectGiftParticipant[]
}

async function getDirectGift(shareCode: string): Promise<DirectGift | null> {
  const { data: gift, error } = await supabase
    .from('direct_gifts')
    .select('*')
    .eq('share_code', shareCode)
    .single()

  if (error || !gift) {
    return null
  }

  // Fetch participants separately
  const { data: participants } = await supabase
    .from('direct_gift_participants')
    .select('*')
    .eq('direct_gift_id', gift.id)
    .order('joined_at', { ascending: true })

  return {
    ...gift,
    participants: participants || []
  }
}

async function getGift(shareCode: string) {
  const { data: gift, error } = await supabase
    .from('gifts')
    .select(`
      *,
      party:parties(
        id,
        party_date,
        coordinator_id,
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
        joined_at
      )
    `)
    .eq('share_code', shareCode)
    .single()

  if (error) {
    console.error('Error fetching gift:', error)
    return null
  }

  return gift
}

export default async function GiftPage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params

  // First try direct gift, then party gift
  const directGift = await getDirectGift(shareCode)

  if (directGift) {
    const isClosed = directGift.status === 'closed'
    const isPurchased = directGift.status === 'purchased'
    const participantCount = directGift.participants.length
    const pricePerPerson = participantCount > 0 && directGift.estimated_price
      ? calculatePricePerFamily(directGift.estimated_price, participantCount)
      : null

    // Render Direct Gift page
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Navigation */}
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Mis Grupos</span>
          </Link>

          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="text-center">
              <div className="mb-4">
                {isPurchased ? (
                  <CheckCircle className="mx-auto text-green-500" size={56} />
                ) : isClosed ? (
                  <Lock className="mx-auto text-orange-500" size={56} />
                ) : (
                  <Gift className="mx-auto text-green-500" size={56} />
                )}
              </div>

              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-3">
                {OCCASION_LABELS[directGift.occasion]}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Regalo para {directGift.recipient_name}
              </h1>

              {/* Status Badge */}
              {isPurchased && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-2">
                  <CheckCircle size={16} />
                  Comprado
                </span>
              )}
              {isClosed && !isPurchased && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium mb-2">
                  <Lock size={16} />
                  Participación Cerrada
                </span>
              )}

              <p className="text-gray-700 text-sm">
                Organizado por {directGift.organizer_name}
              </p>
            </div>

            {/* Gift Idea */}
            {directGift.gift_idea && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Regalo propuesto</h3>
                <p className="text-gray-700">{directGift.gift_idea}</p>
                {directGift.estimated_price && (
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {formatPrice(directGift.estimated_price)}
                  </p>
                )}
              </div>
            )}

            {/* Only price if no idea */}
            {!directGift.gift_idea && directGift.estimated_price && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-gray-700 mb-1">Precio estimado</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(directGift.estimated_price)}
                </p>
              </div>
            )}

            {/* Price Per Person - when closed or purchased */}
            {(isClosed || isPurchased) && pricePerPerson && (
              <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                <p className="text-sm text-gray-700 mb-1">Precio por persona</p>
                <p className="text-3xl font-bold text-green-600">
                  {pricePerPerson}€
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  ({participantCount} participantes)
                </p>
              </div>
            )}

            {/* Organizer Comment */}
            {directGift.organizer_comment && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Comentario del organizador:
                </p>
                <p className="text-gray-800 italic">
                  &quot;{directGift.organizer_comment}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Organizer Actions */}
          <DirectGiftOrganizerActions
            giftId={directGift.id}
            shareCode={shareCode}
            recipientName={directGift.recipient_name}
            organizerName={directGift.organizer_name}
            giftIdea={directGift.gift_idea}
            status={directGift.status}
            participantCount={participantCount}
            participantNames={directGift.participants.map(p => p.participant_name)}
            estimatedPrice={directGift.estimated_price}
          />

          {/* Participants Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={24} />
                Participantes
              </h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                {participantCount}
              </span>
            </div>

            {participantCount === 0 ? (
              <p className="text-gray-700 text-center py-6">
                Sé el primero en apuntarte
              </p>
            ) : (
              <ul className="space-y-2">
                {directGift.participants.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{p.participant_name}</span>
                    <span className="text-sm text-gray-700">
                      {new Date(p.joined_at).toLocaleDateString('es-ES')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Participation Component */}
          <DirectGiftParticipation
            giftId={directGift.id}
            shareCode={shareCode}
            status={directGift.status}
          />
        </div>
      </div>
    )
  }

  const gift = await getGift(shareCode)

  if (!gift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <Gift className="mx-auto text-gray-700 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Regalo no encontrado
          </h1>
          <p className="text-gray-700 mb-4">
            Verifica el enlace e intenta nuevamente
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={18} />
            Ir a Mis Grupos
          </Link>
        </div>
      </div>
    )
  }

  const celebrantNames = gift.party?.party_celebrants?.map(
    (pc: { birthdays: { child_name: string } }) => pc.birthdays.child_name
  ) || []

  const isClosed = !gift.participation_open
  const isPurchased = !!gift.purchased_at
  const participantCount = gift.participants?.length || 0
  const totalPrice = gift.proposal?.total_price || 0

  // Calculate price per family
  const pricePerFamily = participantCount > 0
    ? calculatePricePerFamily(gift.final_price || totalPrice, participantCount)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Navigation */}
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Mis Grupos</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="text-center">
            <div className="mb-4">
              {isPurchased ? (
                <CheckCircle className="mx-auto text-green-500" size={56} />
              ) : isClosed ? (
                <Lock className="mx-auto text-orange-500" size={56} />
              ) : (
                <Gift className="mx-auto text-blue-500" size={56} />
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Regalo para {formatCelebrants(celebrantNames)}
            </h1>

            {/* Status Badge */}
            {isPurchased && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-4">
                <CheckCircle size={16} />
                Comprado
              </span>
            )}
            {isClosed && !isPurchased && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium mb-4">
                <Lock size={16} />
                Participación Cerrada
              </span>
            )}

            {/* Party Date */}
            {gift.party?.party_date && (
              <div className="flex items-center justify-center gap-2 text-gray-700 mt-4">
                <Calendar size={18} />
                <span>{formatDate(gift.party.party_date)}</span>
              </div>
            )}
          </div>

          {/* Selected Proposal */}
          {gift.proposal && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">
                {gift.proposal.name}
              </h3>
              {gift.proposal.proposal_items?.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {gift.proposal.proposal_items.map((item: {
                    id: string
                    item_name: string
                    item_price: number | null
                    product_link: string | null
                  }) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-gray-700">•</span>
                        {item.item_name}
                        {item.product_link && (
                          <a
                            href={item.product_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Ver
                          </a>
                        )}
                      </span>
                      {item.item_price && (
                        <span className="font-medium text-gray-700">
                          {formatPrice(item.item_price)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(gift.final_price || totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Price Per Family - Finalized (with real price) */}
          {isPurchased && (
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl text-center">
              <p className="text-sm text-gray-700 mb-1">Precio final pagado:</p>
              <p className="text-3xl font-bold text-green-600 mb-3">
                {formatPrice(gift.final_price || totalPrice)}
              </p>
              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-gray-700 mb-1">Precio por familia:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pricePerFamily}€
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  ({participantCount} familias participantes)
                </p>
              </div>
            </div>
          )}

          {/* Price Per Family - Closed but not purchased (estimated) */}
          {isClosed && !isPurchased && pricePerFamily && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-gray-700 mb-1">Precio por familia:</p>
              <p className="text-3xl font-bold text-green-600">
                {pricePerFamily}€
              </p>
              <p className="text-xs text-gray-700 mt-1">
                ({participantCount} familias participantes)
              </p>
              <p className="text-xs text-orange-600 mt-2">
                (Precio estimado - pendiente de compra final)
              </p>
            </div>
          )}

          {/* Coordinator Comment */}
          {gift.coordinator_comment && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-700 mb-1">
                💬 Comentario del coordinador:
              </p>
              <p className="text-gray-800 italic">
                &quot;{gift.coordinator_comment}&quot;
              </p>
            </div>
          )}

          {/* Receipt Link */}
          {gift.receipt_image_url && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <a
                href={gift.receipt_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📎 Ver recibo de compra
              </a>
            </div>
          )}
        </div>

        {/* Participants Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} />
              Familias Participantes
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              {participantCount}
            </span>
          </div>

          {participantCount === 0 ? (
            <p className="text-gray-700 text-center py-6">
              Sé la primera familia en apuntarte
            </p>
          ) : (
            <ul className="space-y-2">
              {gift.participants?.map((p: {
                id: string
                family_name: string
                joined_at: string
              }) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{p.family_name}</span>
                  <span className="text-sm text-gray-700">
                    {new Date(p.joined_at).toLocaleDateString('es-ES')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coordinator Actions */}
        <CoordinatorActions
          giftId={gift.id}
          shareCode={shareCode}
          giftName={gift.proposal?.name || 'Regalo'}
          celebrantNames={celebrantNames}
          coordinatorId={gift.party?.coordinator_id || null}
          participationOpen={gift.participation_open}
          isPurchased={isPurchased}
          participantCount={participantCount}
          participantNames={gift.participants?.map((p: { family_name: string }) => p.family_name) || []}
          totalPrice={totalPrice}
        />

        {/* Participation Component */}
        <GiftParticipation
          giftId={gift.id}
          shareCode={shareCode}
          participationOpen={gift.participation_open}
          isPurchased={isPurchased}
        />
      </div>
    </div>
  )
}
