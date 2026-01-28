import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateUniqueCode(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { partyId, proposalId } = await request.json()
    
    if (!partyId) {
      return NextResponse.json(
        { error: 'partyId requerido' },
        { status: 400 }
      )
    }
    
    const shareCode = generateUniqueCode(12)
    
    const { data: gift, error } = await supabase
      .from('gifts')
      .insert({
        party_id: partyId,
        proposal_id: proposalId,
        share_code: shareCode,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ gift })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json(
      { error: 'Error al crear regalo' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shareCode = searchParams.get('shareCode')
  
  if (!shareCode) {
    return NextResponse.json(
      { error: 'shareCode requerido' },
      { status: 400 }
    )
  }
  
  try {
    const { data: gift, error } = await supabase
      .from('gifts')
      .select(`
        *,
        party:parties(
          *,
          party_celebrants(
            birthdays(child_name, birth_date)
          )
        ),
        proposal:proposals(*),
        participants(*)
      `)
      .eq('share_code', shareCode)
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