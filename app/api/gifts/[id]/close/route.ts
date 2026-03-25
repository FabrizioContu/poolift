import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyParticipantsClosed } from '@/lib/email'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get gift with participant count and proposal price
    const { data: gift, error: fetchError } = await supabase
      .from('gifts')
      .select(`
        id,
        share_code,
        participation_open,
        purchased_at,
        proposal:proposals(total_price, name),
        participants(id, email, status),
        party:parties(
          party_date,
          party_celebrants(birthday:birthdays(child_name))
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    if (!gift.participation_open) {
      return NextResponse.json(
        { error: 'La participación ya está cerrada' },
        { status: 400 }
      )
    }

    if (gift.purchased_at) {
      return NextResponse.json(
        { error: 'El regalo ya fue comprado' },
        { status: 400 }
      )
    }

    const joinedParticipants = gift.participants?.filter((p: { status: string }) => p.status === 'joined') ?? []
    const participantCount = joinedParticipants.length

    if (participantCount === 0) {
      return NextResponse.json(
        { error: 'No hay participantes todavía' },
        { status: 400 }
      )
    }

    // Calculate price per family
    // Handle proposal as either object or array (Supabase join can return either)
    const proposal = Array.isArray(gift.proposal) ? gift.proposal[0] : gift.proposal
    const totalPrice = proposal?.total_price || 0
    const pricePerFamily = totalPrice / participantCount

    // Close participation
    const { data: updatedGift, error: updateError } = await supabase
      .from('gifts')
      .update({
        participation_open: false,
        closed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    const emails = joinedParticipants.map((p: { email: string | null }) => p.email).filter(Boolean) as string[]
    if (emails.length > 0) {
      const proposal = Array.isArray(gift.proposal) ? gift.proposal[0] : gift.proposal
      const party = Array.isArray(gift.party) ? gift.party[0] : gift.party
      const celebrants = party?.party_celebrants?.map(
        (pc: { birthday: { child_name: string }[] }) =>
          Array.isArray(pc.birthday) ? pc.birthday[0]?.child_name : (pc.birthday as unknown as { child_name: string } | null)?.child_name
      ).filter(Boolean) as string[] ?? []
      void notifyParticipantsClosed({
        emails,
        recipientName: celebrants.length > 0 ? celebrants.join(' y ') : 'los celebrantes',
        giftIdea: proposal?.name ?? null,
        pricePerParticipant: pricePerFamily,
        participantCount,
        shareCode: gift.share_code,
      })
    }

    return NextResponse.json({
      gift: updatedGift,
      pricePerFamily,
      participantCount
    })
  } catch (error) {
    console.error('Error closing participation:', error)
    return NextResponse.json(
      { error: 'Error al cerrar participación' },
      { status: 500 }
    )
  }
}