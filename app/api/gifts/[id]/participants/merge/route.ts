import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { keep, remove } = await request.json()

    if (!keep || !remove) {
      return NextResponse.json(
        { error: 'Se requieren los campos keep y remove' },
        { status: 400 }
      )
    }

    if (keep.trim() === remove.trim()) {
      return NextResponse.json(
        { error: 'Los participantes deben ser distintos' },
        { status: 400 }
      )
    }

    const serverClient = await createClient()

    // Fetch the gift
    const { data: gift, error: fetchError } = await serverClient
      .from('gifts')
      .select('participation_open, purchased_at')
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
        { error: 'Solo se pueden fusionar participantes con participación abierta' },
        { status: 400 }
      )
    }

    if (gift.purchased_at) {
      return NextResponse.json(
        { error: 'El regalo ya fue comprado' },
        { status: 400 }
      )
    }

    // Verify both participants exist
    const { data: keepParticipant } = await serverClient
      .from('participants')
      .select('id')
      .eq('gift_id', id)
      .ilike('family_name', keep.trim())
      .single()

    if (!keepParticipant) {
      return NextResponse.json(
        { error: `Participante "${keep}" no encontrado` },
        { status: 404 }
      )
    }

    const { data: removeParticipant } = await serverClient
      .from('participants')
      .select('id')
      .eq('gift_id', id)
      .ilike('family_name', remove.trim())
      .single()

    if (!removeParticipant) {
      return NextResponse.json(
        { error: `Participante "${remove}" no encontrado` },
        { status: 404 }
      )
    }

    // Delete the duplicate participant
    const { error: deleteError } = await serverClient
      .from('participants')
      .delete()
      .eq('id', removeParticipant.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, removed: remove.trim(), kept: keep.trim() })
  } catch (error) {
    console.error('Error merging participants:', error)
    return NextResponse.json(
      { error: 'Error al fusionar participantes' },
      { status: 500 }
    )
  }
}
