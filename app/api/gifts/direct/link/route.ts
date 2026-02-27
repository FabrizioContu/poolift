import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  shareCodes: z.array(z.string().min(1)).min(1).max(50),
});

/**
 * PUT /api/gifts/direct/link
 * Links a list of direct gift share codes to the authenticated user's user_id.
 * Only links gifts that currently have no organizer_user_id (prevents hijacking).
 */
export async function PUT(request: Request) {
  try {
    const serverClient = await createClient();

    const {
      data: { user },
      error: authError,
    } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { shareCodes } = schema.parse(body);

    const { data, error } = await supabase
      .from("direct_gifts")
      .update({ organizer_user_id: user.id })
      .in("share_code", shareCodes)
      .is("organizer_user_id", null)
      .select("id");

    if (error) throw error;

    return NextResponse.json({ linked: data.length });
  } catch (error) {
    console.error("Error linking direct gifts:", error);
    return NextResponse.json(
      { error: "Error al vincular regalos directos" },
      { status: 500 }
    );
  }
}
