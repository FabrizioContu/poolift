import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyParticipantsFinalized } from '@/lib/email'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { finalPrice, organizerComment, receiptImageUrl } = await request.json()

    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json(
        { error: 'Precio final requerido' },
        { status: 400 }
      )
    }

    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    // Get direct gift
    const { data: gift, error: fetchError } = await serverClient
      .from('direct_gifts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    // Validate organizer ownership when organizer_user_id is set
    if (gift.organizer_user_id) {
      if (!user || user.id !== gift.organizer_user_id) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        )
      }
    }

    if (gift.status === 'open') {
      return NextResponse.json(
        { error: 'Primero debes cerrar la participación' },
        { status: 400 }
      )
    }

    if (gift.status === 'purchased') {
      return NextResponse.json(
        { error: 'El regalo ya fue comprado' },
        { status: 400 }
      )
    }

    // Get joined participants (with emails for notifications)
    const { data: participants } = await serverClient
      .from('direct_gift_participants')
      .select('email')
      .eq('direct_gift_id', id)
      .eq('status', 'joined')

    const participantCount = participants?.length || 0
    const pricePerParticipant = participantCount > 0 ? finalPrice / participantCount : 0

    // Finalize the gift
    const { data: updatedGift, error: updateError } = await serverClient
      .from('direct_gifts')
      .update({
        status: 'purchased',
        estimated_price: finalPrice, // Update with final price
        organizer_comment: organizerComment || null,
        receipt_image_url: receiptImageUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    const emails = participants?.map((p) => p.email).filter(Boolean) as string[] ?? []
    if (emails.length > 0) {
      void notifyParticipantsFinalized({
        emails,
        recipientName: gift.recipient_name,
        giftIdea: gift.gift_idea,
        finalPrice,
        pricePerParticipant,
        organizerComment: organizerComment || null,
        shareCode: gift.share_code,
      })
    }

    return NextResponse.json({
      gift: updatedGift,
      pricePerParticipant,
      participantCount
    })
  } catch (error) {
    console.error('Error finalizing gift:', error)
    return NextResponse.json(
      { error: 'Error al finalizar compra' },
      { status: 500 }
    )
  }
}
