import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/seller/settings/account
 * Get user account settings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error fetching account settings:", error);
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
 * PATCH /api/seller/settings/account
 * Update user account settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update user in users table
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Also update auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { name },
    });

    if (authError) {
      console.error("Error updating auth metadata:", authError);
      // Don't fail the request if metadata update fails
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating account settings:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

