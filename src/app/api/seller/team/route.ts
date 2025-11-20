import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreTeam, verifyStoreOwner } from "@/application/team/seller/getStoreTeam";

/**
 * GET /api/seller/team
 * Get all team members for the seller's selected store
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = request.nextUrl.searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Verify the store belongs to the user
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, owner_id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found or access denied" },
        { status: 403 }
      );
    }

    // Get team members
    const team = await getStoreTeam(storeId);

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error fetching store team:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/team
 * Invite a team member
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, email, role, permissions } = body;

    if (!storeId || !email || !role) {
      return NextResponse.json(
        { error: "Store ID, email, and role are required" },
        { status: 400 }
      );
    }

    // Verify the store belongs to the user
    const isOwner = await verifyStoreOwner(storeId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only store owners can invite team members" },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: invitedUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !invitedUser) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from("store_team_members")
      .select("id")
      .eq("store_id", storeId)
      .eq("user_id", invitedUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 }
      );
    }

    // Create team member record
    const { data: teamMember, error: teamError } = await supabase
      .from("store_team_members")
      .insert({
        store_id: storeId,
        user_id: invitedUser.id,
        role: role,
        permissions: permissions || {},
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString(), // Auto-join for now
      })
      .select()
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: teamError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

