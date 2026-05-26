import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  const { shareCode } = await params;

  const { data: family, error } = await supabase
    .from("families")
    .select("id, name, group_id, share_code, is_creator")
    .eq("share_code", shareCode)
    .single();

  if (error || !family) {
    return NextResponse.json(
      { error: "Código de familia no válido" },
      { status: 404 },
    );
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, invite_code")
    .eq("id", family.group_id)
    .single();

  if (groupError || !group) {
    return NextResponse.json(
      { error: "Grupo no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ family, group });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  const { shareCode } = await params;

  const serverClient = await createClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: family, error } = await supabase
    .from("families")
    .select("id, user_id")
    .eq("share_code", shareCode)
    .single();

  if (error || !family) {
    return NextResponse.json({ error: "Código no válido" }, { status: 404 });
  }

  // Only link if not already linked — prevents hijacking
  if (family.user_id === null) {
    await supabase
      .from("families")
      .update({ user_id: user.id })
      .eq("id", family.id)
      .is("user_id", null);
  }

  return NextResponse.json({ success: true });
}
