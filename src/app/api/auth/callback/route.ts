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

    // Password recovery codes from Supabase are tricky - they're not PKCE codes
    // Server-side exchangeCodeForSession SHOULD work for recovery codes
    // If it doesn't, we'll redirect with the code and let the client handle it differently
    
    console.log('[AUTH_CALLBACK_PROCESSING_CODE]', { 
      type, 
      hasCode: !!code, 
      codePrefix: code?.substring(0, 15) + '...',
      allParams: Object.fromEntries(requestUrl.searchParams.entries())
    })
    
    if (code) {
      // Try exchangeCodeForSession server-side - this should work for recovery codes
      console.log('[AUTH_CALLBACK_ATTEMPTING_EXCHANGE]', 'Server-side exchangeCodeForSession for recovery code')
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
          code: exchangeErr?.code,
          fullError: exchangeErr
        })
        exchangeError = exchangeErr
        
        // If exchangeCodeForSession fails, Supabase might have sent tokens in hash
        // OR the redirect URL configuration is wrong
        // Let's redirect back to reset-password with the code - client will handle hash if present
        if (type === 'recovery') {
          console.log('[AUTH_CALLBACK_REDIRECTING_WITH_CODE]', 'Will let client handle code or hash')
          const redirectPath = `/${routing.defaultLocale}/reset-password`
          const redirectUrl = new URL(redirectPath, request.url)
          redirectUrl.searchParams.set('code', code)
          if (type) redirectUrl.searchParams.set('type', type)
          return NextResponse.redirect(redirectUrl)
        }
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

