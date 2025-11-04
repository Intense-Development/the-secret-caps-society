import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if email exists in users table
    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    const isAvailable = !data; // Available if not found

    return NextResponse.json({
      success: true,
      available: isAvailable,
    });
  } catch (error) {
    console.error("Email check API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
