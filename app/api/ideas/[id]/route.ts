import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateIdeaDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Validate before delete
    await validateIdeaDelete(id);

    // Delete idea
    const { error } = await supabase.from("ideas").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting idea:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar idea";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: idea, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ idea });
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      { error: "Error al obtener idea" },
      { status: 500 }
    );
  }
}
