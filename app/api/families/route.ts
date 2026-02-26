import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
  }

  try {
    const { data: families, error } = await supabase
      .from("families")
      .select("id, name")
      .eq("group_id", groupId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Error fetching families:", error);
    return NextResponse.json(
      { error: "Error al obtener familias" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { groupId, familyName } = await request.json();

    if (!groupId || !familyName) {
      return NextResponse.json(
        { error: "groupId y familyName son requeridos" },
        { status: 400 }
      );
    }

    const trimmedName = familyName.trim();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: "El nombre no puede tener más de 50 caracteres" },
        { status: 400 }
      );
    }

    // Verify group exists
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Check if family name already exists in this group
    const { data: existingFamily } = await supabase
      .from("families")
      .select("id")
      .eq("group_id", groupId)
      .eq("name", trimmedName)
      .single();

    if (existingFamily) {
      return NextResponse.json(
        { error: "Ya existe una familia con ese nombre en el grupo" },
        { status: 409 }
      );
    }

    // Try to get authenticated user to link family immediately
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    // Create family
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        group_id: groupId,
        name: trimmedName,
        is_creator: false,
        ...(user ? { user_id: user.id } : {}),
      })
      .select()
      .single();

    if (familyError) throw familyError;

    return NextResponse.json({ family });
  } catch (error) {
    console.error("Error creating family:", error);
    return NextResponse.json(
      { error: "Error al crear familia" },
      { status: 500 }
    );
  }
}
