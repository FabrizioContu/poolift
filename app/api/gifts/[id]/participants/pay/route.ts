import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { familyName, paid, familyId } = await request.json();

  if (!familyName || typeof paid !== "boolean") {
    return NextResponse.json(
      { error: "familyName y paid son requeridos" },
      { status: 400 },
    );
  }

  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();

  const { data: gift, error: giftError } = await supabase
    .from("gifts")
    .select("purchased_at, party:parties(coordinator_id)")
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

  // Coordinator authorization
  const party = Array.isArray(gift.party) ? gift.party[0] : gift.party;
  if (party?.coordinator_id) {
    if (user) {
      const { data: coordFamily } = await serverClient
        .from("families")
        .select("user_id")
        .eq("id", party.coordinator_id)
        .single();
      if (!coordFamily || coordFamily.user_id !== user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    } else {
      if (!familyId || familyId !== party.coordinator_id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }
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
