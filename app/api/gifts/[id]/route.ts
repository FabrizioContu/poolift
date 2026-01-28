import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: gift, error } = await supabase
      .from('gifts')
      .select(`
        *,
        party:parties(
          id,
          party_date,
          coordinator_id,
          party_celebrants(
            birthdays(child_name)
          )
        ),
        proposal:proposals(
          id,
          name,
          total_price,
          proposal_items(
            id,
            item_name,
            item_price,
            product_link
          )
        ),
        participants(
          id,
          family_name,
          joined_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ gift })
  } catch (error) {
    console.error('Error fetching gift:', error)
    return NextResponse.json(
      { error: 'Error al obtener regalo' },
      { status: 500 }
    )
  }
}
