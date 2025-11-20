import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreTeamMember,
  verifyStoreOwner,
} from "@/application/team/seller/getStoreTeam";

/**
 * PATCH /api/seller/team/[id]
 * Update a team member's role or permissions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { storeId, ...updates } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Verify the store belongs to the user
    const isOwner = await verifyStoreOwner(storeId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only store owners can update team members" },
        { status: 403 }
      );
    }

    // Get team member
    const teamMember = await getStoreTeamMember(id, storeId);
    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Prevent changing owner role
    if (updates.role && teamMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change owner role" },
        { status: 400 }
      );
    }

    // Update team member
    const { data: updatedMember, error: updateError } = await supabase
      .from("store_team_members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ teamMember: updatedMember });
  } catch (error) {
    console.error("Error updating team member:", error);
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
 * DELETE /api/seller/team/[id]
 * Remove a team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const storeId = request.nextUrl.searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Verify the store belongs to the user
    const isOwner = await verifyStoreOwner(storeId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only store owners can remove team members" },
        { status: 403 }
      );
    }

    // Get team member
    const teamMember = await getStoreTeamMember(id, storeId);
    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Prevent removing owner
    if (teamMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove store owner" },
        { status: 400 }
      );
    }

    // Delete team member
    const { error: deleteError } = await supabase
      .from("store_team_members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

