import { supabase } from "@/lib/supabase";
import { CreatePartyButton } from "@/components/CreatePartyButton";
import { AddBirthdayButton } from "@/components/AddBirthdayButton";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";

interface Party {
  id: string;
  group_id: string;
  party_date: string;
  coordinator: { name: string } | null;
  party_celebrants: Array<{
    birthdays: { child_name: string };
  }>;
}

interface GroupInfo {
  id: string;
  name: string;
  invite_code: string;
  familyCount: number;
}

async function getGroupInfo(groupId: string): Promise<GroupInfo | null> {
  const { data: group, error } = await supabase
    .from("groups")
    .select(
      `
      id,
      name,
      invite_code,
      families!families_group_id_fkey(id)
    `,
    )
    .eq("id", groupId)
    .single();

  if (error) {
    console.error("Error fetching group:", error);
    return null;
  }

  return {
    id: group.id,
    name: group.name,
    invite_code: group.invite_code,
    familyCount: group.families?.length ?? 0,
  };
}

async function getParties(groupId: string): Promise<Party[]> {
  const { data, error } = await supabase
    .from("parties")
    .select(
      `
      *,
      coordinator:families!parties_coordinator_id_fkey(id, name),
      party_celebrants(
        birthday_id,
        birthdays(id, child_name, birth_date)
      )
    `,
    )
    .eq("group_id", groupId)
    .order("party_date", { ascending: true });

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }

  return data as Party[];
}

async function getBirthdays(groupId: string) {
  const { data, error } = await supabase
    .from("birthdays")
    .select(
      `
      id,
      child_name,
      birth_date,
      party_celebrants(
        parties(id, party_date)
      )
    `,
    )
    .eq("group_id", groupId)
    .order("birth_date", { ascending: true });

  if (error) {
    console.error("Error fetching birthdays:", error);
    return [];
  }

  if (!data) return [];

  // Transform data to include next party date
  const today = new Date();
  return data.map((b) => {
    // Extract all parties from party_celebrants (Supabase join returns nested structure)
    const allParties = b.party_celebrants
      ?.flatMap((pc: { parties: { id: string; party_date: string } | { id: string; party_date: string }[] | null }) => {
        if (!pc.parties) return [];
        return Array.isArray(pc.parties) ? pc.parties : [pc.parties];
      })
      .filter((p: { party_date: string }) => p && new Date(p.party_date) >= today)
      .sort((a: { party_date: string }, b: { party_date: string }) =>
        new Date(a.party_date).getTime() - new Date(b.party_date).getTime()
      ) || [];

    return {
      id: b.id,
      child_name: b.child_name,
      birth_date: b.birth_date,
      nextPartyDate: allParties[0]?.party_date || null,
    };
  });
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const [group, parties, birthdays] = await Promise.all([
    getGroupInfo(groupId),
    getParties(groupId),
    getBirthdays(groupId),
  ]);

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 text-center">
          No se encontró el grupo. Verifica que el enlace sea correcto.
        </p>
      </div>
    );
  }

  const needsOnboarding = birthdays.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <GroupHeader
        groupName={group.name}
        inviteCode={group.invite_code}
        familyCount={group.familyCount}
      />

      {needsOnboarding ? (
        <OnboardingGuide
          groupId={groupId}
          birthdayCount={birthdays.length}
          partyCount={parties.length}
        />
      ) : (
        <>
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Calendario de Fiestas</h1>
            </div>
            <div className="flex gap-3 py-3">
              <AddBirthdayButton groupId={groupId} />
              <CreatePartyButton groupId={groupId} />
            </div>
          </header>

          <DashboardTabs
            parties={parties}
            birthdays={birthdays}
            groupId={groupId}
          />
        </>
      )}
    </div>
  );
}
