import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const {
      finalPrice,
      receiptImageUrl,
      coordinatorComment
    } = await request.json()

    if (!finalPrice) {
      return NextResponse.json(
        { error: 'Precio final requerido' },
        { status: 400 }
      )
    }

    const { data: gift, error } = await supabase
      .from('gifts')
      .update({
        final_price: finalPrice,
        receipt_image_url: receiptImageUrl,
        coordinator_comment: coordinatorComment,
        purchased_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        participation_open: false,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ gift })
  } catch (error) {
    console.error('Error finalizing gift:', error)
    return NextResponse.json(
      { error: 'Error al finalizar regalo' },
      { status: 500 }
    )
  }
}

