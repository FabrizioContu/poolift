import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { participantName, paid } = await request.json();

  if (!participantName || typeof paid !== "boolean") {
    return NextResponse.json(
      { error: "participantName y paid son requeridos" },
      { status: 400 },
    );
  }

  const { data: gift, error: giftError } = await supabase
    .from("direct_gifts")
    .select("status")
    .eq("id", id)
    .single();

  if (giftError || !gift) {
    return NextResponse.json({ error: "Regalo no encontrado" }, { status: 404 });
  }

  if (gift.status !== "purchased") {
    return NextResponse.json(
      { error: "El regalo aún no ha sido comprado" },
      { status: 409 },
    );
  }

  const { data: participant, error } = await supabase
    .from("direct_gift_participants")
    .update({ paid })
    .eq("direct_gift_id", id)
    .eq("participant_name", participantName)
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
