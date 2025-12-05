import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { routing } from '@/i18n/routing-config'

// Helper for consistent error responses
function buildErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  )
}

// Helper for success responses
function buildSuccessResponse(message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status: 200 }
  )
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(rawBody)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // 2. Initialize Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // No cookies to set for this endpoint
        },
      }
    )

    // 3. Generate redirect URL (environment-based with locale)
    const redirectUrl = 
      process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/${routing.defaultLocale}/reset-password`
        : `${request.nextUrl.origin}/${routing.defaultLocale}/reset-password`

    // 4. Request password reset email from Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    // 5. IMPORTANT: Always return success to prevent email enumeration
    // Even if the email doesn't exist, we return the same message
    if (error) {
      console.error('[FORGOT_PASSWORD_ERROR]', {
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      })
    }

    // Generic success message (security best practice)
    return buildSuccessResponse(
      'If an account exists with that email, you will receive a password reset link.'
    )

  } catch (error) {
    console.error('[FORGOT_PASSWORD_EXCEPTION]', error)
    
    return buildErrorResponse(
      'An unexpected error occurred. Please try again.',
      500
    )
  }
}

