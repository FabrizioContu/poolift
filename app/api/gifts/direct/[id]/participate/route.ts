import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyOrganizerJoined, notifyOrganizerDeclined } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { participantName, declined, email } = await request.json()

    if (!participantName) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    if (participantName.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      )
    }

    // Check if direct gift exists and is open
    const { data: gift, error: giftError } = await supabase
      .from('direct_gifts')
      .select('status, organizer_email, recipient_name, gift_idea, share_code')
      .eq('id', id)
      .single()

    if (giftError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    if (gift.status !== 'open') {
      return NextResponse.json(
        { error: 'La participación está cerrada' },
        { status: 400 }
      )
    }

    const status = declined ? 'declined' : 'joined'

    const { data: participant, error } = await supabase
      .from('direct_gift_participants')
      .upsert(
        {
          direct_gift_id: id,
          participant_name: participantName.trim(),
          status,
          ...(email?.trim() ? { email: email.trim().toLowerCase() } : {}),
        },
        { onConflict: 'direct_gift_id,participant_name' }
      )
      .select()
      .single()

    if (error) throw error

    if (gift.organizer_email) {
      if (status === 'joined') {
        void notifyOrganizerJoined({
          organizerEmail: gift.organizer_email,
          participantName: participantName.trim(),
          recipientName: gift.recipient_name,
          shareCode: gift.share_code,
        })
      } else {
        void notifyOrganizerDeclined({
          organizerEmail: gift.organizer_email,
          participantName: participantName.trim(),
          recipientName: gift.recipient_name,
          shareCode: gift.share_code,
        })
      }
    }

    return NextResponse.json({ participant })
  } catch (error) {
    console.error('Error participating:', error)
    return NextResponse.json(
      { error: 'Error al participar' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json().catch(() => null)) ?? {}
    const { participantName, shareCode } = body as Record<string, string | undefined>

    if (!participantName) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    // Check if direct gift exists and is open
    const { data: gift, error: giftError } = await supabase
      .from('direct_gifts')
      .select('status, share_code, organizer_user_id')
      .eq('id', id)
      .single()

    if (giftError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    // Verify caller has access to this gift via share_code
    if (!shareCode || shareCode !== gift.share_code) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (gift.status !== 'open') {
      return NextResponse.json(
        { error: 'No puedes salirte, la participación está cerrada' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('direct_gift_participants')
      .delete()
      .eq('direct_gift_id', id)
      .eq('participant_name', participantName)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving gift:', error)
    return NextResponse.json(
      { error: 'Error al salir del regalo' },
      { status: 500 }
    )
  }
}
