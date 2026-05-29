import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { familyName, paid } = await request.json();

  if (!familyName || typeof paid !== "boolean") {
    return NextResponse.json(
      { error: "familyName y paid son requeridos" },
      { status: 400 },
    );
  }

  const { data: gift, error: giftError } = await supabase
    .from("gifts")
    .select("purchased_at")
    .eq("id", id)
    .single();

  if (giftError || !gift) {
    return NextResponse.json({ error: "Regalo no encontrado" }, { status: 404 });
  }

  if (!gift.purchased_at) {
    return NextResponse.json(
      { error: "El regalo aún no ha sido comprado" },
      { status: 409 },
    );
  }

  const { data: participant, error } = await supabase
    .from("participants")
    .update({ paid })
    .eq("gift_id", id)
    .eq("family_name", familyName)
    .eq("status", "joined")
    .select()
    .single();

  if (error || !participant) {
    return NextResponse.json(
      { error: "Participante no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ participant });
}
