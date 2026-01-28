import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
        participation_open,
        purchased_at,
        proposal:proposals(total_price),
        participants(id)
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

    const participantCount = gift.participants?.length || 0

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