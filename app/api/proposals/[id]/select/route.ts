import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Marcar esta propuesta como seleccionada
    const { data: proposal, error: updateError } = await supabase
      .from('proposals')
      .update({ is_selected: true })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Desmarcar las demás propuestas de la misma fiesta
    await supabase
      .from('proposals')
      .update({ is_selected: false })
      .eq('party_id', proposal.party_id)
      .neq('id', id)
    
    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Error selecting proposal:', error)
    return NextResponse.json(
      { error: 'Error al seleccionar propuesta' },
      { status: 500 }
    )
  }
}