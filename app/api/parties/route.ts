import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Asignar coordinador automáticamente (rotativo)
async function assignCoordinator(groupId: string): Promise<string | null> {
  const { data: families } = await supabase
    .from('families')
    .select('id')
    .eq('group_id', groupId)
  
  if (!families || families.length === 0) return null
  
  // Contar cuántas fiestas coordina cada familia
  const coordinatorCounts = await Promise.all(
    families.map(async (family) => {
      const { count } = await supabase
        .from('parties')
        .select('id', { count: 'exact', head: true })
        .eq('coordinator_id', family.id)
      
      return { familyId: family.id, count: count || 0 }
    })
  )
  
  // Ordenar por menor cantidad coordinada
  coordinatorCounts.sort((a, b) => a.count - b.count)
  
  return coordinatorCounts[0].familyId
}

export async function POST(request: NextRequest) {
  try {
    const { 
      groupId, 
      partyDate, 
      coordinatorId,
      celebrantIds // Array de birthday IDs
    } = await request.json()
    
    if (!groupId || !partyDate || !celebrantIds || celebrantIds.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Asignar coordinador si no se especificó
    const finalCoordinatorId = coordinatorId || await assignCoordinator(groupId)
    
    // Crear fiesta
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        group_id: groupId,
        party_date: partyDate,
        coordinator_id: finalCoordinatorId,
      })
      .select()
      .single()
    
    if (partyError) throw partyError
    
    // Crear relaciones party_celebrants
    const celebrants = celebrantIds.map((birthdayId: string) => ({
      party_id: party.id,
      birthday_id: birthdayId,
    }))
    
    const { error: celebrantsError } = await supabase
      .from('party_celebrants')
      .insert(celebrants)
    
    if (celebrantsError) throw celebrantsError
    
    return NextResponse.json({ party })
  } catch (error) {
    console.error('Error creating party:', error)
    return NextResponse.json(
      { error: 'Error al crear fiesta' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const groupId = searchParams.get('groupId')
  
  if (!groupId) {
    return NextResponse.json(
      { error: 'groupId requerido' },
      { status: 400 }
    )
  }
  
  try {
    // Obtener fiestas con sus celebrantes
    const { data: parties, error } = await supabase
      .from('parties')
      .select(`
        *,
        coordinator:families!parties_coordinator_id_fkey(id, name),
        party_celebrants(
          birthday_id,
          birthdays(id, child_name, birth_date)
        )
      `)
      .eq('group_id', groupId)
      .order('party_date', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ parties })
  } catch (error) {
    console.error('Error fetching parties:', error)
    return NextResponse.json(
      { error: 'Error al obtener fiestas' },
      { status: 500 }
    )
  }
}