import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const {
      partyId,
      name,
      totalPrice,
      votingDeadline,
      items, // Array de { item_name, item_price, product_link }
    } = await request.json()
    
    if (!partyId || !name || !totalPrice || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Crear propuesta
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        party_id: partyId,
        name,
        total_price: totalPrice,
        voting_deadline: votingDeadline,
      })
      .select()
      .single()
    
    if (proposalError) throw proposalError
    
    // Crear items de la propuesta
    const proposalItems = items.map((item: { itemName: string; itemPrice: number; productLink?: string }) => ({
      proposal_id: proposal.id,
      item_name: item.itemName,
      item_price: item.itemPrice,
      product_link: item.productLink,
    }))
    
    const { error: itemsError } = await supabase
      .from('proposal_items')
      .insert(proposalItems)
    
    if (itemsError) throw itemsError
    
    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Error al crear propuesta' },
      { status: 500 }
    )
  }
}

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
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        *,
        proposal_items(*),
        votes(id, voter_name)
      `)
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Error al obtener propuestas' },
      { status: 500 }
    )
  }
}