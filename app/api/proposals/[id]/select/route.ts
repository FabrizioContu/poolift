import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json().catch(() => null)) ?? {}
    const familyId = (body as Record<string, unknown>).familyId as string | undefined

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()

    // Get proposal → party to verify coordinator ownership
    const { data: proposalCheck } = await serverClient
      .from('proposals')
      .select('party_id')
      .eq('id', id)
      .single()

    if (proposalCheck) {
      const { data: party } = await serverClient
        .from('parties')
        .select('coordinator_id')
        .eq('id', proposalCheck.party_id)
        .single()

      if (party?.coordinator_id) {
        if (user) {
          const { data: coordFamily } = await serverClient
            .from('families')
            .select('user_id')
            .eq('id', party.coordinator_id)
            .single()
          if (!coordFamily || coordFamily.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
          }
        } else {
          if (!familyId || familyId !== party.coordinator_id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
          }
        }
      }
    }

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