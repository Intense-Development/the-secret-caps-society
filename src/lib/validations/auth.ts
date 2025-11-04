import { z } from 'zod'

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Base user registration schema (for buyers)
export const buyerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Seller registration - Step 1: Account Info
export const sellerAccountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Seller registration - Step 2: Store Info
export const storeInfoSchema = z.object({
  storeName: z.string().min(3, 'Store name must be at least 3 characters'),
  storeDescription: z.string().min(10, 'Description must be at least 10 characters'),
  storeWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

// Seller registration - Step 3: Location and Details
export const locationDetailsSchema = z.object({
  businessType: z.enum(['sole-proprietor', 'llc', 'corporation', 'partnership'], {
    message: 'Please select a business type',
  }),
  taxId: z.string().optional(),
  businessAddress: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State/Province must be at least 2 characters'),
  zip: z.string().min(3, 'ZIP/Postal code must be at least 3 characters'),
})

// Custom file validator that works in both SSR and browser environments
const fileSchema = z.custom<File>((val) => {
  // Skip validation on server-side (File API not available in Node.js)
  if (typeof File === 'undefined') return true
  // Validate on client-side
  return val instanceof File
}, {
  message: 'Invalid file format',
})

// Seller registration - Step 4: Verification
export const verificationSchema = z.object({
  documentFile: fileSchema.optional(),
  documentUrl: z.string().optional(),
}).refine((data) => data.documentFile || data.documentUrl, {
  message: 'Please upload a verification document',
})

// Complete seller registration schema
export const sellerRegistrationSchema = sellerAccountSchema
  .merge(storeInfoSchema)
  .merge(locationDetailsSchema)
  .merge(verificationSchema)
  .extend({
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (password.length < 8) feedback.push('Use at least 8 characters')
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters')
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters')
  if (!/[0-9]/.test(password)) feedback.push('Add numbers')
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters')

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak'
  if (score >= 6) strength = 'very-strong'
  else if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  return { strength, score, feedback }
}

// Types
export type BuyerRegistrationInput = z.infer<typeof buyerRegistrationSchema>
export type SellerRegistrationInput = z.infer<typeof sellerRegistrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SellerAccountInput = z.infer<typeof sellerAccountSchema>
export type StoreInfoInput = z.infer<typeof storeInfoSchema>
export type LocationDetailsInput = z.infer<typeof locationDetailsSchema>
export type VerificationInput = z.infer<typeof verificationSchema>

