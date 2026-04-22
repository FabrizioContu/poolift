import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const giftId = formData.get('giftId') as string | null
    const shareCode = formData.get('shareCode') as string | null

    if (!file || !giftId) {
      return NextResponse.json({ error: 'file y giftId requeridos' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo no puede superar 5MB' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    // Verify caller has coordinator ownership of this gift
    const serverClient = await createServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    const { data: gift } = await serverClient
      .from('gifts')
      .select('share_code, party:parties(coordinator_id)')
      .eq('id', giftId)
      .single()

    if (gift) {
      const party = Array.isArray(gift.party) ? gift.party[0] : gift.party
      if (user && party?.coordinator_id) {
        const { data: coordFamily } = await serverClient
          .from('families')
          .select('user_id')
          .eq('id', party.coordinator_id)
          .single()
        if (!coordFamily || coordFamily.user_id !== user.id) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
      } else if (!user) {
        if (!shareCode || shareCode !== gift.share_code) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
      }
    }

    // Initialize at request time so env vars are available at runtime
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${giftId}/${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('receipts')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data } = adminClient.storage.from('receipts').getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
