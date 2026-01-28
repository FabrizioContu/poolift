import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validatePartyDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate before delete
    const validation = await validatePartyDelete(id);

    // Delete party celebrants first
    const { error: celebrantsError } = await supabase
      .from("party_celebrants")
      .delete()
      .eq("party_id", id);

    if (celebrantsError) {
      console.error("Error deleting celebrants:", celebrantsError);
    }

    // Hard delete party
    const { error, count } = await supabase
      .from("parties")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    // Verify deletion happened
    const { data: verifyParty } = await supabase
      .from("parties")
      .select("id")
      .eq("id", id)
      .single();

    if (verifyParty) {
      throw new Error("No se pudo eliminar la fiesta. Verifica los permisos en Supabase.");
    }

    return NextResponse.json({
      success: true,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Error deleting party:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar fiesta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: party, error } = await supabase
      .from("parties")
      .select(
        `
        *,
        coordinator:families!parties_coordinator_id_fkey(id, name),
        party_celebrants(
          birthday_id,
          birthdays(id, child_name, birth_date)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ party });
  } catch (error) {
    console.error("Error fetching party:", error);
    return NextResponse.json(
      { error: "Error al obtener fiesta" },
      { status: 500 }
    );
  }
}
