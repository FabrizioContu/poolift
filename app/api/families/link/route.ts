import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  familyIds: z.array(z.string().uuid()).min(1).max(100),
})

/**
 * PUT /api/families/link
 * Links a list of family IDs to the authenticated user's user_id.
 * Only links families that currently have no user_id (prevents hijacking).
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { familyIds } = schema.parse(body)

    const { data, error } = await supabase
      .from('families')
      .update({ user_id: user.id })
      .in('id', familyIds)
      .is('user_id', null) // Only link unlinked families
      .select('id')

    if (error) throw error

    return NextResponse.json({ linked: data.length })
  } catch (error) {
    console.error('Error linking families:', error)
    return NextResponse.json(
      { error: 'Error al vincular familias' },
      { status: 500 }
    )
  }
}
