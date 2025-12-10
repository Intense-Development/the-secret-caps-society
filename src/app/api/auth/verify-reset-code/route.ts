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

    // Password reset codes from email links can be handled in different ways:
    // 1. If it's a PKCE code (requires code verifier), use exchangeCodeForSession
    // 2. If it's a recovery token, use verifyOtp
    // 3. Some codes need to be processed client-side
    
    console.log('[VERIFY_RESET_CODE_ATTEMPT]', { codeLength: code.length, codePrefix: code.substring(0, 10) })
    
    // Try verifyOtp first for recovery tokens (no PKCE needed)
    // Note: verifyOtp expects 'token' not 'token_hash' for password recovery
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token: code, // Use 'token' instead of 'token_hash'
      type: 'recovery',
    })

    if (!verifyError && verifyData?.session) {
      console.log('[VERIFY_RESET_CODE_VERIFY_SUCCESS]', { userId: verifyData.user?.id })
      const response = NextResponse.json({
        success: true,
        message: 'Reset code verified successfully',
        userId: verifyData.user?.id,
      })

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }

    console.warn('[VERIFY_RESET_CODE_VERIFY_FAILED]', {
      error: verifyError?.message,
      status: verifyError?.status,
      tryingExchange: true,
    })

    // If verifyOtp fails, try exchangeCodeForSession (might be a PKCE code)
    // This will fail for recovery codes without PKCE, but worth trying
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && exchangeData?.session) {
      console.log('[VERIFY_RESET_CODE_EXCHANGE_SUCCESS]', { userId: exchangeData.user?.id })
      const response = NextResponse.json({
        success: true,
        message: 'Reset code verified successfully',
        userId: exchangeData.user?.id,
      })

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }

    console.error('[VERIFY_RESET_CODE_ALL_METHODS_FAILED]', {
      verifyError: verifyError?.message,
      exchangeError: exchangeError?.message,
    })

    return NextResponse.json(
      {
        success: false,
        message: verifyError?.message || exchangeError?.message || 'Invalid or expired reset code',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('[VERIFY_RESET_CODE_EXCEPTION]', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

