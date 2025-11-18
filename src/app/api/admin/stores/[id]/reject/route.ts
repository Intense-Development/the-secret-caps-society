import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type RejectRequest = {
  reason?: string;
};

/**
 * POST /api/admin/stores/[id]/reject
 * Reject a store application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Store ID is required",
        },
        { status: 400 }
      );
    }

    const body: RejectRequest = await request.json().catch(() => ({}));
    const reason = body.reason || "Application rejected";

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    // Update store verification status
    const { data: store, error } = await supabase
      .from("stores")
      .update({
        verification_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", storeId)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting store:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reject store",
        },
        { status: 500 }
      );
    }

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: "Store not found",
        },
        { status: 404 }
      );
    }

    // TODO: Send rejection email to store owner with reason
    // This would be implemented in a separate service/function

    return NextResponse.json(
      {
        success: true,
        store,
        reason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject store API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

