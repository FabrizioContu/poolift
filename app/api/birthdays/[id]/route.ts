import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateBirthdayDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate before delete
    const validation = await validateBirthdayDelete(id);

    // Delete associated ideas first (cascade)
    await supabase.from("ideas").delete().eq("birthday_id", id);

    // Delete birthday
    const { error } = await supabase.from("birthdays").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Error deleting birthday:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar cumpleaños";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: birthday, error } = await supabase
      .from("birthdays")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ birthday });
  } catch (error) {
    console.error("Error fetching birthday:", error);
    return NextResponse.json(
      { error: "Error al obtener cumpleaños" },
      { status: 500 }
    );
  }
}
