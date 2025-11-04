import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buyerRegistrationSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = buyerRegistrationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already registered',
          error: 'EMAIL_EXISTS',
        },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'buyer',
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          message: authError.message,
          error: 'AUTH_ERROR',
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create account',
          error: 'USER_CREATION_FAILED',
        },
        { status: 400 }
      )
    }

    // Create user record in database
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role: 'buyer',
      })

    if (dbError) {
      // Rollback: delete auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create user profile',
          error: 'DATABASE_ERROR',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        data: {
          userId: authData.user.id,
          email,
          role: 'buyer',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Buyer registration API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

