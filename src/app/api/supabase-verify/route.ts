import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    // A lightweight call that should work with anon key even without a user session
    const { data, error } = await supabase.auth.getSession();

    const urlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const anonPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Supabase reachable but auth call returned an error",
          error: { name: error.name, message: error.message },
          env: { urlPresent, anonPresent },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase connectivity OK",
      session: data.session ? { userId: data.session.user.id } : null,
      env: { urlPresent, anonPresent },
    });
  } catch (err: unknown) {
    const error =
      err instanceof Error
        ? { name: err.name, message: err.message }
        : { name: "Unknown error", message: String(err) };

    return NextResponse.json(
      {
        ok: false,
        message: "Supabase connectivity failed",
        error,
        env: {
          urlPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          anonPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        },
      },
      { status: 500 }
    );
  }
}
