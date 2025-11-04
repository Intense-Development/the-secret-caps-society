import { NextRequest, NextResponse } from 'next/server'
import { buyerRegistrationSchema } from '@/lib/validations/auth'
import { registerBuyer } from '@/lib/services/authService'

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
          errors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    // Register buyer
    const result = await registerBuyer(validationResult.data)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
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

