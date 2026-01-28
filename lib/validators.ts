import { supabase } from "@/lib/supabase";

export interface ValidationResult {
  canDelete: boolean;
  warnings: string[];
}

export async function validateBirthdayDelete(
  birthdayId: string
): Promise<ValidationResult> {
  // Check if birthday is part of any party
  const { data: parties, error: partiesError } = await supabase
    .from("party_celebrants")
    .select("party_id")
    .eq("birthday_id", birthdayId);

  if (partiesError) {
    throw new Error("Error al verificar fiestas asociadas");
  }

  if (parties && parties.length > 0) {
    throw new Error(
      `No se puede eliminar. Este niño está en ${parties.length} fiesta(s) activa(s).`
    );
  }

  // Check ideas (warning, not blocker)
  const { data: ideas, error: ideasError } = await supabase
    .from("ideas")
    .select("id")
    .eq("birthday_id", birthdayId);

  if (ideasError) {
    throw new Error("Error al verificar ideas asociadas");
  }

  const warnings: string[] = [];
  if (ideas && ideas.length > 0) {
    warnings.push(`Se eliminarán ${ideas.length} idea(s) asociada(s).`);
  }

  return { canDelete: true, warnings };
}

export async function validatePartyDelete(
  partyId: string
): Promise<ValidationResult> {
  // Check if party has proposals
  const { data: proposals, error: proposalsError } = await supabase
    .from("proposals")
    .select("id")
    .eq("party_id", partyId);

  if (proposalsError) {
    throw new Error("Error al verificar propuestas");
  }

  if (proposals && proposals.length > 0) {
    // Check if any proposal has votes
    const proposalIds = proposals.map((p) => p.id);
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("id")
      .in("proposal_id", proposalIds);

    if (votesError) {
      throw new Error("Error al verificar votos");
    }

    if (votes && votes.length > 0) {
      throw new Error(
        `No se puede eliminar. Esta fiesta tiene ${votes.length} voto(s) registrado(s).`
      );
    }

    throw new Error(
      `No se puede eliminar. Esta fiesta tiene ${proposals.length} propuesta(s).`
    );
  }

  // Check if party has a gift
  const { data: gifts, error: giftsError } = await supabase
    .from("gifts")
    .select("id")
    .eq("party_id", partyId);

  if (giftsError) {
    throw new Error("Error al verificar regalos");
  }

  if (gifts && gifts.length > 0) {
    throw new Error("No se puede eliminar. Ya hay un regalo creado para esta fiesta.");
  }

  const warnings: string[] = [];

  // Check party celebrants (will be cascade deleted)
  const { data: celebrants } = await supabase
    .from("party_celebrants")
    .select("id")
    .eq("party_id", partyId);

  if (celebrants && celebrants.length > 0) {
    warnings.push(
      `Se desvinculará a ${celebrants.length} niño(s) de esta fiesta.`
    );
  }

  return { canDelete: true, warnings };
}

export async function validateProposalDelete(
  proposalId: string
): Promise<ValidationResult> {
  // Check if proposal has votes
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("id")
    .eq("proposal_id", proposalId);

  if (votesError) {
    throw new Error("Error al verificar votos");
  }

  if (votes && votes.length > 0) {
    throw new Error(
      `No se puede eliminar. Esta propuesta tiene ${votes.length} voto(s).`
    );
  }

  // Check if proposal is selected
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("is_selected")
    .eq("id", proposalId)
    .single();

  if (proposalError) {
    throw new Error("Error al verificar propuesta");
  }

  if (proposal?.is_selected) {
    throw new Error(
      "No se puede eliminar. Esta es la propuesta seleccionada para el regalo."
    );
  }

  return { canDelete: true, warnings: [] };
}

export async function validateIdeaDelete(
  ideaId: string
): Promise<ValidationResult> {
  // Ideas can be deleted freely - they're not linked to proposal_items
  // Just verify the idea exists
  const { error } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", ideaId)
    .single();

  if (error) {
    throw new Error("Idea no encontrada");
  }

  return { canDelete: true, warnings: [] };
}

export async function validateGroupDelete(
  groupId: string
): Promise<ValidationResult> {
  // Check if group has active parties
  const { data: parties, error: partiesError } = await supabase
    .from("parties")
    .select("id")
    .eq("group_id", groupId);

  if (partiesError) {
    throw new Error("Error al verificar fiestas");
  }

  if (parties && parties.length > 0) {
    throw new Error(
      `No se puede eliminar. Este grupo tiene ${parties.length} fiesta(s) activa(s).`
    );
  }

  // Check families count (warning, not blocker if no parties)
  const { data: families } = await supabase
    .from("families")
    .select("id")
    .eq("group_id", groupId);

  const warnings: string[] = [];
  if (families && families.length > 1) {
    warnings.push(`Se eliminarán ${families.length} familias del grupo.`);
  }

  // Check birthdays
  const { data: birthdays } = await supabase
    .from("birthdays")
    .select("id")
    .eq("group_id", groupId);

  if (birthdays && birthdays.length > 0) {
    warnings.push(`Se eliminarán ${birthdays.length} cumpleaños registrados.`);
  }

  return { canDelete: true, warnings };
}
