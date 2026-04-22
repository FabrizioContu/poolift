import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { familyName, declined, email } = await request.json()

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

    const status = declined ? 'declined' : 'joined'

    const { data: participant, error } = await supabase
      .from('participants')
      .upsert(
        {
          gift_id: id,
          family_name: familyName.trim(),
          status,
          ...(email?.trim() ? { email: email.trim().toLowerCase() } : {}),
        },
        { onConflict: 'gift_id,family_name' }
      )
      .select()
      .single()

    if (error) throw error

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
    const { familyName, familyId } = body as Record<string, string | undefined>

    if (!familyName) {
      return NextResponse.json(
        { error: 'Nombre de familia requerido' },
        { status: 400 }
      )
    }

    // Verify the caller is the participant being removed
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (user) {
      const { data: family } = await serverClient
        .from('families')
        .select('name')
        .eq('user_id', user.id)
        .single()
      if (!family || family.name !== familyName) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    } else {
      if (!familyId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
      const { data: family } = await serverClient
        .from('families')
        .select('name')
        .eq('id', familyId)
        .single()
      if (!family || family.name !== familyName) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
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