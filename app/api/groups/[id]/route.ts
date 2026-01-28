import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateGroupDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate before delete
    const validation = await validateGroupDelete(id);

    // Delete in order: birthdays, families, then group
    await supabase.from("birthdays").delete().eq("group_id", id);
    await supabase.from("families").delete().eq("group_id", id);

    // Delete group
    const { error } = await supabase.from("groups").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    // Verify deletion
    const { data: verifyGroup } = await supabase
      .from("groups")
      .select("id")
      .eq("id", id)
      .single();

    if (verifyGroup) {
      throw new Error(
        "No se pudo eliminar el grupo. Verifica los permisos en Supabase."
      );
    }

    return NextResponse.json({
      success: true,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar grupo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: group, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        families!families_group_id_fkey(id, name),
        birthdays(id, child_name),
        parties(id)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Error al obtener grupo" },
      { status: 500 }
    );
  }
}
