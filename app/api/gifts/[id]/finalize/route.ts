import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyParticipantsFinalized } from '@/lib/email'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const {
      finalPrice,
      receiptImageUrl,
      coordinatorComment
    } = await request.json()

    if (!finalPrice) {
      return NextResponse.json(
        { error: 'Precio final requerido' },
        { status: 400 }
      )
    }

    // Pre-fetch gift context and participant emails for notifications
    const { data: giftContext } = await supabase
      .from('gifts')
      .select(`
        share_code,
        proposal:proposals(name),
        participants(email, status),
        party:parties(
          party_date,
          party_celebrants(birthday:birthdays(child_name))
        )
      `)
      .eq('id', id)
      .single()

    const { data: gift, error } = await supabase
      .from('gifts')
      .update({
        final_price: finalPrice,
        receipt_image_url: receiptImageUrl,
        coordinator_comment: coordinatorComment,
        purchased_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        participation_open: false,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (giftContext) {
      const joinedParticipants = giftContext.participants?.filter(
        (p: { status: string }) => p.status === 'joined'
      ) ?? []
      const emails = joinedParticipants
        .map((p: { email: string | null }) => p.email)
        .filter(Boolean) as string[]
      if (emails.length > 0) {
        const proposal = Array.isArray(giftContext.proposal) ? giftContext.proposal[0] : giftContext.proposal
        const party = Array.isArray(giftContext.party) ? giftContext.party[0] : giftContext.party
        const celebrants = party?.party_celebrants?.map(
          (pc: { birthday: { child_name: string }[] }) =>
            Array.isArray(pc.birthday) ? pc.birthday[0]?.child_name : (pc.birthday as unknown as { child_name: string } | null)?.child_name
        ).filter(Boolean) as string[] ?? []
        const participantCount = joinedParticipants.length
        void notifyParticipantsFinalized({
          emails,
          recipientName: celebrants.length > 0 ? celebrants.join(' y ') : 'los celebrantes',
          giftIdea: proposal?.name ?? null,
          finalPrice,
          pricePerParticipant: participantCount > 0 ? finalPrice / participantCount : 0,
          organizerComment: coordinatorComment || null,
          shareCode: giftContext.share_code,
        })
      }
    }

    return NextResponse.json({ gift })
  } catch (error) {
    console.error('Error finalizing gift:', error)
    return NextResponse.json(
      { error: 'Error al finalizar regalo' },
      { status: 500 }
    )
  }
}

