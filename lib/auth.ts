// Pseudo-auth for family-based system (no real authentication)
// Stores group memberships in localStorage

export interface GroupSession {
  groupId: string;
  groupName: string;
  familyId: string;
  familyName: string;
  isCreator: boolean;
  inviteCode: string;
  joinedAt: string;
}

const STORAGE_KEY = "poolift_groups";

export function getGroupSessions(): GroupSession[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addGroupToSession(session: Omit<GroupSession, "joinedAt">): void {
  if (typeof window === "undefined") return;

  const sessions = getGroupSessions();

  // Check if already exists
  const exists = sessions.some((s) => s.groupId === session.groupId);
  if (exists) {
    // Update existing
    const updated = sessions.map((s) =>
      s.groupId === session.groupId
        ? { ...session, joinedAt: s.joinedAt }
        : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return;
  }

  // Add new
  sessions.push({
    ...session,
    joinedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function removeGroupSession(groupId: string): void {
  if (typeof window === "undefined") return;

  const sessions = getGroupSessions();
  const filtered = sessions.filter((s) => s.groupId !== groupId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getGroupSession(groupId: string): GroupSession | null {
  const sessions = getGroupSessions();
  return sessions.find((s) => s.groupId === groupId) || null;
}

export function clearAllSessions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
