import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { participantName } = await request.json()

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
      .select('status')
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

    const { data: participant, error } = await supabase
      .from('direct_gift_participants')
      .insert({
        direct_gift_id: id,
        participant_name: participantName.trim(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya estás participando en este regalo' },
          { status: 409 }
        )
      }
      throw error
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
    const { participantName } = await request.json()

    if (!participantName) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    // Check if direct gift exists and is open
    const { data: gift, error: giftError } = await supabase
      .from('direct_gifts')
      .select('status')
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
