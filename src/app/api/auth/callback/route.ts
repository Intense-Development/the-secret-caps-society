import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing-config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token') // Recovery token from email link
  const next = requestUrl.searchParams.get('next') || `/${routing.defaultLocale}/reset-password`
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type') // Check if this is a password recovery

  console.log('[AUTH_CALLBACK]', {
    hasCode: !!code,
    hasToken: !!token,
    next,
    error,
    errorDescription,
    type,
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

    // Password recovery can come as either:
    // 1. A 'code' parameter (PKCE flow) - needs exchangeCodeForSession
    // 2. A 'token' parameter (recovery token from email) - needs verifyOtp
    // Try both approaches
    
    console.log('[AUTH_CALLBACK_PROCESSING]', { 
      type, 
      hasCode: !!code,
      hasToken: !!token,
      codePrefix: code?.substring(0, 20),
      tokenPrefix: token?.substring(0, 20),
      allParams: Object.fromEntries(requestUrl.searchParams.entries())
    })
    
    // First, try verifyOtp if we have a token (this is what Supabase sends in email links)
    if (token && type === 'recovery') {
      console.log('[AUTH_CALLBACK_VERIFYING_TOKEN]', 'Using verifyOtp for recovery token')
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })
      
      if (!verifyErr && verifyData?.session) {
        sessionData = verifyData
        console.log('[AUTH_CALLBACK_VERIFY_SUCCESS]', {
          hasSession: !!sessionData.session,
          userId: sessionData.user?.id
        })
      } else {
        console.warn('[AUTH_CALLBACK_VERIFY_FAILED]', {
          error: verifyErr?.message,
          status: verifyErr?.status,
          willTryExchange: !!code
        })
        // Will try exchangeCodeForSession as fallback if code exists
      }
    }
    
    // If verifyOtp didn't work or we have a code, try exchangeCodeForSession
    if (!sessionData && code) {
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
        console.error('[AUTH_CALLBACK_EXCHANGE_FAILED]', {
          error: exchangeErr?.message,
          status: exchangeErr?.status,
          code: exchangeErr?.code
        })
        exchangeError = exchangeErr
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

