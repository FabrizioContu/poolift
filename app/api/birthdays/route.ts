import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createClient()
    await serverClient.auth.getUser() // establishes session for future RLS

    const { groupId, childName, birthDate } = await request.json()
    
    if (!groupId || !childName || !birthDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    const { data: birthday, error } = await supabase
      .from('birthdays')
      .insert({
        group_id: groupId,
        child_name: childName,
        birth_date: birthDate,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ birthday })
  } catch (error) {
    console.error('Error creating birthday:', error)
    return NextResponse.json(
      { error: 'Error al crear cumpleaños' },
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
    const { data: birthdays, error } = await supabase
      .from('birthdays')
      .select('*')
      .eq('group_id', groupId)
      .order('birth_date', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ birthdays })
  } catch (error) {
    console.error('Error fetching birthdays:', error)
    return NextResponse.json(
      { error: 'Error al obtener cumpleaños' },
      { status: 500 }
    )
  }
}