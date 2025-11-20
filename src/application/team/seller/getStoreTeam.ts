import { createClient } from "@/lib/supabase/server";

export type TeamMemberRole = "owner" | "manager" | "staff";

export type TeamMember = {
  id: string;
  store_id: string;
  user_id: string;
  role: TeamMemberRole;
  permissions: Record<string, unknown>;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

/**
 * Get all team members for a store
 */
export async function getStoreTeam(
  storeId: string | null
): Promise<TeamMember[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  const { data: teamMembers, error } = await supabase
    .from("store_team_members")
    .select("*, users(id, name, email)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!teamMembers) {
    return [];
  }

  return teamMembers.map((member) => ({
    id: member.id,
    store_id: member.store_id,
    user_id: member.user_id,
    role: member.role as TeamMemberRole,
    permissions: (member.permissions as Record<string, unknown>) || {},
    invited_by: member.invited_by,
    invited_at: member.invited_at,
    joined_at: member.joined_at,
    created_at: member.created_at,
    updated_at: member.updated_at,
    user: member.users
      ? {
          id: member.users.id,
          name: member.users.name,
          email: member.users.email,
        }
      : undefined,
  }));
}

/**
 * Get a single team member
 */
export async function getStoreTeamMember(
  memberId: string,
  storeId: string | null
): Promise<TeamMember | null> {
  if (!storeId) {
    return null;
  }

  const team = await getStoreTeam(storeId);
  return team.find((m) => m.id === memberId) || null;
}

/**
 * Verify user is store owner
 */
export async function verifyStoreOwner(
  storeId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single();

  return store?.owner_id === userId;
}

