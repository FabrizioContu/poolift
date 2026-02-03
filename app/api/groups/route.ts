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
    const { name, description, familyName, type } = await request.json()

    if (!name || !familyName) {
      return NextResponse.json(
        { error: 'Nombre de grupo y familia son requeridos' },
        { status: 400 }
      )
    }

    // Validate group type if provided
    const validTypes = ['class', 'friends', 'family', 'work', 'other']
    const groupType = type && validTypes.includes(type) ? type : 'other'

    const inviteCode = generateUniqueCode(12)

    // Crear grupo
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        type: groupType,
        invite_code: inviteCode,
      })
      .select()
      .single()
    
    if (groupError) throw groupError
    
    // Crear familia creadora
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        group_id: group.id,
        name: familyName,
        is_creator: true,
      })
      .select()
      .single()
    
    if (familyError) throw familyError
    
    // Actualizar grupo con created_by
    await supabase
      .from('groups')
      .update({ created_by: family.id })
      .eq('id', group.id)
    
    return NextResponse.json({
      group: { ...group, created_by: family.id },
      family,
    })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Error al crear grupo' },
      { status: 500 }
    )
  }
}