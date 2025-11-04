import { NextRequest, NextResponse } from "next/server";
import { checkEmailAvailability } from "@/lib/services/authService";

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

    const isAvailable = await checkEmailAvailability(email);

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
