import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { resetPasswordSchema } from '@/lib/validations/auth'

function buildErrorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details && { details }),
    },
    { status }
  )
}

function buildSuccessResponse(message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status: 200 }
  )
}

// Map Supabase errors to user-friendly messages
function mapResetPasswordError(error: string): string {
  if (error.includes('expired') || error.includes('token')) {
    return 'This password reset link has expired or is invalid. Please request a new one.'
  }
  if (error.includes('same password')) {
    return 'New password must be different from your current password.'
  }
  return 'Failed to reset password. Please try again.'
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json()
    const validationResult = resetPasswordSchema.safeParse(rawBody)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password validation failed',
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { password } = validationResult.data

    // 2. Initialize Supabase client with cookie handling
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

    // 3. Verify user is authenticated (token in session from email link)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return buildErrorResponse(
        'Invalid or expired password reset link.',
        401
      )
    }

    // 4. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error('[RESET_PASSWORD_ERROR]', {
        userId: user.id,
        error: updateError.message,
        timestamp: new Date().toISOString(),
      })

      return buildErrorResponse(
        mapResetPasswordError(updateError.message),
        400
      )
    }

    // 5. Log successful password reset (security audit)
    console.info('[RESET_PASSWORD_SUCCESS]', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    })

    // 6. Supabase automatically invalidates other sessions when password changes
    // The current session from the reset token will also be invalidated

    // 7. Return success response with new cookies
    const response = buildSuccessResponse(
      'Password updated successfully. Please log in with your new password.'
    )

    // Set cookies for the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response

  } catch (error) {
    console.error('[RESET_PASSWORD_EXCEPTION]', error)
    
    return buildErrorResponse(
      'An unexpected error occurred. Please try again.',
      500
    )
  }
}

