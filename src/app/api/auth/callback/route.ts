import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing-config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || `/${routing.defaultLocale}`
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('[AUTH_CALLBACK]', {
    hasCode: !!code,
    next,
    error,
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // If Supabase sent an error, redirect with error in hash
  if (error) {
    console.error('[AUTH_CALLBACK_SUPABASE_ERROR]', { error, errorDescription })
    const redirectUrl = new URL(next, request.url)
    redirectUrl.hash = `error=${error}&error_description=${errorDescription || ''}`
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

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[CODE_EXCHANGE]', {
      success: !exchangeError,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: exchangeError?.message
    })

    if (!exchangeError && data?.session) {
      // Create response with redirect
      const response = NextResponse.redirect(new URL(next, request.url))
      
      // Set auth cookies
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      console.log('[AUTH_CALLBACK_SUCCESS]', {
        redirectTo: next,
        userId: data.user?.id
      })

      return response
    }

    console.error('[AUTH_CALLBACK_EXCHANGE_ERROR]', exchangeError)
    
    // Redirect with error
    const errorUrl = new URL(next, request.url)
    errorUrl.hash = `error=exchange_failed&error_description=${exchangeError?.message || 'Failed to exchange code'}`
    return NextResponse.redirect(errorUrl)
  }

  // If no code, redirect to home
  console.warn('[AUTH_CALLBACK_NO_CODE]', 'No code parameter received')
  return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url))
}

