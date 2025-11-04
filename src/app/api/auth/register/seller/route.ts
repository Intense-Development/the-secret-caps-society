import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sellerRegistrationSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = sellerRegistrationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
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
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'seller',
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
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: 'seller',
      })

    if (userError) {
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

    // Create store record
    const { error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: authData.user.id,
        name: data.storeName,
        description: data.storeDescription,
        website: data.storeWebsite || null,
        business_type: data.businessType,
        tax_id: data.taxId || null,
        address: data.businessAddress,
        city: data.city,
        state: data.state,
        zip: data.zip,
        verification_status: 'pending',
        verification_document_url: data.documentUrl || null,
      })

    if (storeError) {
      // Rollback: delete user and auth user if store creation fails
      await supabase.from('users').delete().eq('id', authData.user.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create store profile',
          error: 'STORE_CREATION_ERROR',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Seller account created successfully! Your store is pending verification.',
        data: {
          userId: authData.user.id,
          email: data.email,
          role: 'seller',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seller registration API error:', error)
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

