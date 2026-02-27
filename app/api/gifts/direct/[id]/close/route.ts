import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    // Get direct gift with participant count
    const { data: gift, error: fetchError } = await supabase
      .from('direct_gifts')
      .select('id, status, estimated_price, organizer_user_id')
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

    if (gift.status !== 'open') {
      return NextResponse.json(
        { error: 'La participación ya está cerrada' },
        { status: 400 }
      )
    }

    // Get participant count
    const { data: participants } = await supabase
      .from('direct_gift_participants')
      .select('id')
      .eq('direct_gift_id', id)

    const participantCount = participants?.length || 0

    if (participantCount === 0) {
      return NextResponse.json(
        { error: 'No hay participantes todavía' },
        { status: 400 }
      )
    }

    // Calculate price per participant
    const totalPrice = gift.estimated_price || 0
    const pricePerParticipant = totalPrice / participantCount

    // Close participation
    const { data: updatedGift, error: updateError } = await supabase
      .from('direct_gifts')
      .update({
        status: 'closed'
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      gift: updatedGift,
      pricePerParticipant,
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
