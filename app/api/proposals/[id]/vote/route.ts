import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { voterName } = await request.json()

    if (!voterName) {
      return NextResponse.json(
        { error: 'Nombre de votante requerido' },
        { status: 400 }
      )
    }

    const { data: vote, error } = await supabase
      .from('votes')
      .insert({
        proposal_id: id,
        voter_name: voterName,
      })
      .select()
      .single()
    
    if (error) {
      // Error 23505 = unique constraint violation (ya votó)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya has votado por esta propuesta' },
          { status: 409 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ vote })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Error al votar' },
      { status: 500 }
    )
  }
}