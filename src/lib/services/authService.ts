import { createClient } from '@/lib/supabase/client'
import type { BuyerRegistrationInput, SellerRegistrationInput, LoginInput } from '@/lib/validations/auth'

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    userId: string
    email: string
    role: 'buyer' | 'seller'
  }
  error?: string
}

/**
 * Register a new buyer account
 */
export async function registerBuyer(data: BuyerRegistrationInput): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
        error: 'EMAIL_EXISTS',
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'buyer',
        },
      },
    })

    if (authError) {
      return {
        success: false,
        message: authError.message,
        error: 'AUTH_ERROR',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Failed to create account',
        error: 'USER_CREATION_FAILED',
      }
    }

    // Create user record in database
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: 'buyer',
      })

    if (dbError) {
      // Rollback auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        message: 'Failed to create user profile',
        error: 'DATABASE_ERROR',
      }
    }

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        userId: authData.user.id,
        email: data.email,
        role: 'buyer',
      },
    }
  } catch (error) {
    console.error('Buyer registration error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Register a new seller account with store
 */
export async function registerSeller(data: SellerRegistrationInput): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
        error: 'EMAIL_EXISTS',
      }
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
      return {
        success: false,
        message: authError.message,
        error: 'AUTH_ERROR',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Failed to create account',
        error: 'USER_CREATION_FAILED',
      }
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
      await supabase.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        message: 'Failed to create user profile',
        error: 'DATABASE_ERROR',
      }
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
      // Rollback user creation
      await supabase.from('users').delete().eq('id', authData.user.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        message: 'Failed to create store profile',
        error: 'STORE_CREATION_ERROR',
      }
    }

    return {
      success: true,
      message: 'Seller account created successfully! Your store is pending verification.',
      data: {
        userId: authData.user.id,
        email: data.email,
        role: 'seller',
      },
    }
  } catch (error) {
    console.error('Seller registration error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Login user
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Login failed',
        error: 'LOGIN_FAILED',
      }
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'Failed to retrieve user information',
        error: 'USER_FETCH_ERROR',
      }
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: authData.user.id,
        email: authData.user.email!,
        role: userData.role as 'buyer' | 'seller',
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Check if email is available
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    return !data // Returns true if email is available (not found)
  } catch (error) {
    console.error('Email check error:', error)
    return true // Assume available on error to not block registration
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

