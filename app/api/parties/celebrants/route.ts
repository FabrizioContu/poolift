import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const partyId = searchParams.get('partyId')

  if (!partyId) {
    return NextResponse.json(
      { error: 'partyId requerido' },
      { status: 400 }
    )
  }

  try {
    const { data: celebrants, error } = await supabase
      .from('party_celebrants')
      .select(`
        birthday_id,
        birthdays(id, child_name)
      `)
      .eq('party_id', partyId)

    if (error) throw error

    return NextResponse.json({ celebrants })
  } catch (error) {
    console.error('Error fetching celebrants:', error)
    return NextResponse.json(
      { error: 'Error al obtener celebrantes' },
      { status: 500 }
    )
  }
}
