import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

/**
 * Direct Gifts API
 *
 * Creates standalone gifts without requiring a group/party.
 * Uses a separate table to avoid breaking existing gift flow.
 *
 * SQL Migration needed:
 * CREATE TABLE direct_gifts (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   recipient_name TEXT NOT NULL,
 *   occasion TEXT NOT NULL,
 *   gift_idea TEXT,
 *   estimated_price DECIMAL(10,2),
 *   organizer_name TEXT NOT NULL,
 *   share_code TEXT UNIQUE NOT NULL,
 *   status TEXT DEFAULT 'open',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_direct_gifts_share_code ON direct_gifts(share_code);
 */

function generateUniqueCode(length: number = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    const { recipientName, occasion, giftIdea, estimatedPrice, organizerName } =
      await request.json();

    // Validate required fields
    if (!recipientName || !occasion || !organizerName) {
      return NextResponse.json(
        { error: "Campos requeridos: recipientName, occasion, organizerName" },
        { status: 400 }
      );
    }

    // Validate occasion type
    const validOccasions = [
      "birthday",
      "farewell",
      "wedding",
      "birth",
      "graduation",
      "other",
    ];
    if (!validOccasions.includes(occasion)) {
      return NextResponse.json(
        { error: "Tipo de ocasion invalido" },
        { status: 400 }
      );
    }

    const shareCode = generateUniqueCode(12);

    // Try to insert into direct_gifts table
    // If table doesn't exist yet, this will fail gracefully
    const { data, error } = await supabase
      .from("direct_gifts")
      .insert({
        recipient_name: recipientName.trim(),
        occasion,
        gift_idea: giftIdea?.trim() || null,
        estimated_price: estimatedPrice || null,
        organizer_name: organizerName.trim(),
        share_code: shareCode,
        status: "open",
        ...(user ? { organizer_user_id: user.id } : {}),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating direct gift:", error);

      // If table doesn't exist, provide helpful error
      if (error.code === "42P01") {
        return NextResponse.json(
          {
            error:
              "La tabla direct_gifts no existe. Ejecuta la migracion SQL primero.",
            migration: `
CREATE TABLE direct_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  gift_idea TEXT,
  estimated_price DECIMAL(10,2),
  organizer_name TEXT NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_direct_gifts_share_code ON direct_gifts(share_code);
            `.trim(),
          },
          { status: 500 }
        );
      }

      throw error;
    }

    // Auto-add organizer as first participant
    const { error: participantError } = await supabase
      .from("direct_gift_participants")
      .insert({
        direct_gift_id: data.id,
        participant_name: organizerName.trim(),
      });

    if (participantError) {
      console.error("Error adding organizer as participant:", participantError);
      // Don't fail the whole request - gift was created successfully
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating direct gift:", error);
    return NextResponse.json(
      { error: "Error al crear regalo directo" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shareCode = searchParams.get("shareCode");

  if (!shareCode) {
    return NextResponse.json(
      { error: "shareCode requerido" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("direct_gifts")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Regalo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching direct gift:", error);
    return NextResponse.json(
      { error: "Error al obtener regalo" },
      { status: 500 }
    );
  }
}
