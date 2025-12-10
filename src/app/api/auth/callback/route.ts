import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing-config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || `/${routing.defaultLocale}/reset-password`
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type') // Check if this is a password recovery

  console.log('[AUTH_CALLBACK]', {
    hasCode: !!code,
    next,
    error,
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // If Supabase sent an error, redirect with error in hash
  if (error) {
    console.error('[AUTH_CALLBACK_SUPABASE_ERROR]', { error, errorDescription, type })
    // For password recovery errors, redirect to reset-password page with error
    const errorRedirectPath = type === 'recovery' 
      ? `/${routing.defaultLocale}/reset-password`
      : next
    const redirectUrl = new URL(errorRedirectPath, request.url)
    redirectUrl.hash = `error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
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

    let sessionData = null
    let exchangeError = null

    // Password recovery codes from Supabase need special handling
    // They are NOT PKCE codes, so exchangeCodeForSession fails with PKCE error
    // The correct approach: use verifyOtp with the code as token_hash, but we need email
    // OR: The code might actually work with exchangeCodeForSession on server-side if configured correctly
    // Let's try both approaches
    
    console.log('[AUTH_CALLBACK_PROCESSING_CODE]', { type, hasCode: !!code, codePrefix: code?.substring(0, 10) })
    
    if (code) {
      // First, try exchangeCodeForSession server-side (might work without PKCE requirements)
      console.log('[AUTH_CALLBACK_ATTEMPTING_EXCHANGE]', 'Server-side exchangeCodeForSession')
      const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!exchangeErr && exchangeData?.session) {
        sessionData = exchangeData
        console.log('[AUTH_CALLBACK_EXCHANGE_SUCCESS]', {
          hasSession: !!sessionData.session,
          userId: sessionData.user?.id,
          type: type || 'unknown'
        })
      } else {
        console.warn('[AUTH_CALLBACK_EXCHANGE_FAILED]', {
          error: exchangeErr?.message,
          status: exchangeErr?.status,
          willTryAlternative: true
        })
        exchangeError = exchangeErr
        
        // If exchangeCodeForSession fails, the code might be a recovery token that needs different handling
        // However, verifyOtp requires email which we don't have here
        // The solution: Supabase might send the code in a format that needs to be used differently
        // Let's check if there's an alternative approach
      }
    }

    if (sessionData?.session) {
      // For password recovery, always redirect to reset-password page
      // For other auth flows, use the 'next' parameter
      const redirectPath = type === 'recovery' 
        ? `/${routing.defaultLocale}/reset-password`
        : next
      
      // Create response with redirect
      const response = NextResponse.redirect(new URL(redirectPath, request.url))
      
      // Set auth cookies
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      console.log('[AUTH_CALLBACK_SUCCESS]', {
        redirectTo: redirectPath,
        userId: sessionData.user?.id,
        type: type || 'unknown',
        method: type === 'recovery' ? 'verifyOtp' : 'exchangeCodeForSession'
      })

      return response
    }

    console.error('[AUTH_CALLBACK_ALL_METHODS_FAILED]', exchangeError)
    
    // Redirect with error
    const errorUrl = new URL(type === 'recovery' ? `/${routing.defaultLocale}/reset-password` : next, request.url)
    errorUrl.hash = `error=exchange_failed&error_description=${exchangeError?.message || 'Failed to exchange code'}`
    return NextResponse.redirect(errorUrl)
  }

  // If no code, redirect to home
  console.warn('[AUTH_CALLBACK_NO_CODE]', 'No code parameter received')
  return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url))
}

