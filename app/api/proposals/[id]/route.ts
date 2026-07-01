import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { validateProposalDelete } from "@/lib/validators";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = (await request.json().catch(() => null)) ?? {};
    const familyId = (body as Record<string, unknown>).familyId as string | undefined;

    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    const { data: proposal } = await serverClient
      .from('proposals').select('party_id').eq('id', id).single();

    if (proposal) {
      const { data: party } = await serverClient
        .from('parties').select('coordinator_id').eq('id', proposal.party_id).single();

      if (party?.coordinator_id) {
        if (user) {
          const { data: coordFamily } = await serverClient
            .from('families').select('user_id').eq('id', party.coordinator_id).single();
          if (!coordFamily || coordFamily.user_id !== user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
          }
        } else if (!familyId || familyId !== party.coordinator_id) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }
      }
    }

    // Validate before delete
    await validateProposalDelete(id);

    // Delete proposal items first
    await supabase.from("proposal_items").delete().eq("proposal_id", id);

    // Delete proposal
    const { error } = await supabase.from("proposals").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar propuesta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { name, totalPrice, items, familyId } = await request.json();

    if (!name || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    const { data: existing } = await serverClient
      .from("proposals")
      .select("party_id, is_selected")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      );
    }

    // No se puede editar una propuesta ya activada como regalo
    if (existing.is_selected) {
      return NextResponse.json(
        { error: "No se puede editar un regalo ya activo" },
        { status: 409 }
      );
    }

    // Verificar propiedad del coordinador (mismo patrón que DELETE)
    const { data: party } = await serverClient
      .from("parties")
      .select("coordinator_id")
      .eq("id", existing.party_id)
      .single();

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
      } else if (!familyId || familyId !== party.coordinator_id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    // Actualizar propuesta
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ name, total_price: totalPrice })
      .eq("id", id);

    if (updateError) throw updateError;

    // Reemplazar items
    await supabase.from("proposal_items").delete().eq("proposal_id", id);

    const proposalItems = items.map(
      (item: { itemName: string; itemPrice: number | null; productLink: string | null }) => ({
        proposal_id: id,
        item_name: item.itemName,
        item_price: item.itemPrice,
        product_link: item.productLink,
      })
    );

    const { error: itemsError } = await supabase
      .from("proposal_items")
      .insert(proposalItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating proposal:", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar propuesta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        proposal_items(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error al obtener propuesta" },
      { status: 500 }
    );
  }
}
