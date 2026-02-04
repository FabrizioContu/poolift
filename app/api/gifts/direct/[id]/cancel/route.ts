import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Cancel a direct gift
 * PUT /api/gifts/direct/[id]/cancel
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current gift status
    const { data: gift, error: fetchError } = await supabase
      .from("direct_gifts")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !gift) {
      return NextResponse.json(
        { error: "Regalo no encontrado" },
        { status: 404 }
      );
    }

    // Can only cancel if not already purchased
    if (gift.status === "purchased") {
      return NextResponse.json(
        { error: "No se puede cancelar un regalo ya comprado" },
        { status: 400 }
      );
    }

    if (gift.status === "cancelled") {
      return NextResponse.json(
        { error: "El regalo ya está cancelado" },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from("direct_gifts")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Regalo cancelado correctamente"
    });
  } catch (error) {
    console.error("Error cancelling direct gift:", error);
    return NextResponse.json(
      { error: "Error al cancelar el regalo" },
      { status: 500 }
    );
  }
}
