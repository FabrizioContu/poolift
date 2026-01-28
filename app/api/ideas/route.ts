import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const {
      birthdayId,
      productName,
      productLink,
      price,
      comment,
      suggestedBy,
    } = await request.json()
    
    if (!birthdayId || !productName || !suggestedBy) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        birthday_id: birthdayId,
        product_name: productName,
        product_link: productLink,
        price,
        comment,
        suggested_by: suggestedBy,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ idea })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Error al crear idea' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const birthdayId = searchParams.get('birthdayId')
  const partyId = searchParams.get('partyId')
  
  try {
    let query = supabase.from('ideas').select('*')
    
    if (birthdayId) {
      // Ideas para un cumpleaños específico
      query = query.eq('birthday_id', birthdayId)
    } else if (partyId) {
      // Ideas para todos los celebrantes de una fiesta
      const { data: celebrants } = await supabase
        .from('party_celebrants')
        .select('birthday_id')
        .eq('party_id', partyId)
      
      if (celebrants && celebrants.length > 0) {
        const birthdayIds = celebrants.map(c => c.birthday_id)
        query = query.in('birthday_id', birthdayIds)
      }
    } else {
      return NextResponse.json(
        { error: 'birthdayId o partyId requerido' },
        { status: 400 }
      )
    }
    
    const { data: ideas, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ideas' },
      { status: 500 }
    )
  }
}