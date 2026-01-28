import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { familyName } = await request.json()

    if (!familyName) {
      return NextResponse.json(
        { error: 'Nombre de familia requerido' },
        { status: 400 }
      )
    }

    if (familyName.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      )
    }

    // Check if gift exists and participation is open
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('participation_open, purchased_at')
      .eq('id', id)
      .single()

    if (giftError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    if (!gift.participation_open || gift.purchased_at) {
      return NextResponse.json(
        { error: 'La participación está cerrada' },
        { status: 400 }
      )
    }

    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        gift_id: id,
        family_name: familyName.trim(),
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
    const { familyName } = await request.json()

    if (!familyName) {
      return NextResponse.json(
        { error: 'Nombre de familia requerido' },
        { status: 400 }
      )
    }

    // Check if gift exists and participation is open
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('participation_open, purchased_at')
      .eq('id', id)
      .single()

    if (giftError || !gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    if (!gift.participation_open || gift.purchased_at) {
      return NextResponse.json(
        { error: 'No puedes salirte, la participación está cerrada' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('gift_id', id)
      .eq('family_name', familyName)
    
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