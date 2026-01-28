import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateProposalDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate before delete
    await validateProposalDelete(id);

    // Delete proposal items first
    await supabase.from("proposal_items").delete().eq("proposal_id", id);

    // Delete proposal
    const { error } = await supabase.from("proposals").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar propuesta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        proposal_items(*),
        votes(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error al obtener propuesta" },
      { status: 500 }
    );
  }
}
