import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing-config'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Code is required' },
        { status: 400 }
      )
    }

    const cookiesToSet: Array<{
      name: string
      value: string
      options: Record<string, unknown>
    }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookiesToSet.push(cookie))
          },
        },
      }
    )

    // Try verifyOtp for password recovery (doesn't require PKCE)
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'recovery',
    })

    if (error || !data?.session) {
      console.error('[VERIFY_RESET_CODE_ERROR]', error)
      return NextResponse.json(
        {
          success: false,
          message: error?.message || 'Invalid or expired reset code',
        },
        { status: 400 }
      )
    }

    // Session established - set cookies
    const response = NextResponse.json({
      success: true,
      message: 'Reset code verified successfully',
      userId: data.user?.id,
    })

    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (error) {
    console.error('[VERIFY_RESET_CODE_EXCEPTION]', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

