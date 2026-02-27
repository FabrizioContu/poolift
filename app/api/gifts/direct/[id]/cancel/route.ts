import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

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

    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    // Get current gift status
    const { data: gift, error: fetchError } = await supabase
      .from("direct_gifts")
      .select("status, organizer_user_id")
      .eq("id", id)
      .single();

    if (fetchError || !gift) {
      return NextResponse.json(
        { error: "Regalo no encontrado" },
        { status: 404 }
      );
    }

    // Validate organizer ownership when organizer_user_id is set
    if (gift.organizer_user_id) {
      if (!user || user.id !== gift.organizer_user_id) {
        return NextResponse.json(
          { error: "No autorizado" },
          { status: 403 }
        );
      }
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
