import { describe, it, expect } from '@jest/globals'
import {
  buyerRegistrationSchema,
  sellerAccountSchema,
  storeInfoSchema,
  locationDetailsSchema,
  verificationSchema,
  passwordSchema,
  emailSchema,
  calculatePasswordStrength,
} from '@/lib/validations/auth'

describe('Auth Validations', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name+tag@example.co.uk').success).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(emailSchema.safeParse('').success).toBe(false)
      expect(emailSchema.safeParse('invalid').success).toBe(false)
      expect(emailSchema.safeParse('invalid@').success).toBe(false)
      expect(emailSchema.safeParse('@example.com').success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      expect(passwordSchema.safeParse('SecurePass123!').success).toBe(true)
      expect(passwordSchema.safeParse('Tr0ng@P4ssw0rd').success).toBe(true)
    })

    it('should reject passwords without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD123!')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without uppercase', () => {
      const result = passwordSchema.safeParse('password123!')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without numbers', () => {
      const result = passwordSchema.safeParse('SecurePassword!')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without special characters', () => {
      const result = passwordSchema.safeParse('SecurePass123')
      expect(result.success).toBe(false)
    })

    it('should reject passwords shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Sec1!')
      expect(result.success).toBe(false)
    })
  })

  describe('buyerRegistrationSchema', () => {
    const validBuyerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      agreeToTerms: true,
    }

    it('should validate correct buyer registration data', () => {
      const result = buyerRegistrationSchema.safeParse(validBuyerData)
      expect(result.success).toBe(true)
    })

    it('should reject when passwords do not match', () => {
      const result = buyerRegistrationSchema.safeParse({
        ...validBuyerData,
        confirmPassword: 'DifferentPassword123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword')
      }
    })

    it('should reject when name is too short', () => {
      const result = buyerRegistrationSchema.safeParse({
        ...validBuyerData,
        name: 'J',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when terms are not agreed', () => {
      const result = buyerRegistrationSchema.safeParse({
        ...validBuyerData,
        agreeToTerms: false,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('sellerAccountSchema', () => {
    const validSellerAccount = {
      name: 'Jane Seller',
      email: 'jane@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
    }

    it('should validate correct seller account data', () => {
      const result = sellerAccountSchema.safeParse(validSellerAccount)
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = sellerAccountSchema.safeParse({
        ...validSellerAccount,
        confirmPassword: 'Different123!',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('storeInfoSchema', () => {
    const validStoreInfo = {
      storeName: 'Amazing Cap Store',
      storeDescription: 'We sell the best caps in town',
      storeWebsite: 'https://amazingcaps.com',
    }

    it('should validate correct store info', () => {
      const result = storeInfoSchema.safeParse(validStoreInfo)
      expect(result.success).toBe(true)
    })

    it('should accept empty website', () => {
      const result = storeInfoSchema.safeParse({
        ...validStoreInfo,
        storeWebsite: '',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid website URL', () => {
      const result = storeInfoSchema.safeParse({
        ...validStoreInfo,
        storeWebsite: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('should reject store name shorter than 3 characters', () => {
      const result = storeInfoSchema.safeParse({
        ...validStoreInfo,
        storeName: 'AB',
      })
      expect(result.success).toBe(false)
    })

    it('should reject description shorter than 10 characters', () => {
      const result = storeInfoSchema.safeParse({
        ...validStoreInfo,
        storeDescription: 'Too short',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('locationDetailsSchema', () => {
    const validLocationDetails = {
      businessType: 'llc' as const,
      taxId: '12-3456789',
      businessAddress: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    }

    it('should validate correct location details', () => {
      const result = locationDetailsSchema.safeParse(validLocationDetails)
      expect(result.success).toBe(true)
    })

    it('should accept all business types', () => {
      const types = ['sole-proprietor', 'llc', 'corporation', 'partnership']
      types.forEach((type) => {
        const result = locationDetailsSchema.safeParse({
          ...validLocationDetails,
          businessType: type,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid business type', () => {
      const result = locationDetailsSchema.safeParse({
        ...validLocationDetails,
        businessType: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should accept optional tax ID', () => {
      const result = locationDetailsSchema.safeParse({
        ...validLocationDetails,
        taxId: undefined,
      })
      expect(result.success).toBe(true)
    })

    it('should reject short address', () => {
      const result = locationDetailsSchema.safeParse({
        ...validLocationDetails,
        businessAddress: '123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('calculatePasswordStrength', () => {
    it('should classify weak passwords correctly', () => {
      const result = calculatePasswordStrength('abc')
      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(3)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should classify medium passwords correctly', () => {
      const result = calculatePasswordStrength('Password1')
      expect(result.strength).toBe('medium')
      expect(result.score).toBeGreaterThanOrEqual(3)
    })

    it('should classify strong passwords correctly', () => {
      const result = calculatePasswordStrength('Password123!')
      expect(['strong', 'very-strong']).toContain(result.strength)
      expect(result.score).toBeGreaterThanOrEqual(5)
    })

    it('should classify very strong passwords correctly', () => {
      const result = calculatePasswordStrength('VeryStr0ng@Pass123')
      expect(result.strength).toBe('very-strong')
      expect(result.score).toBe(6)
      expect(result.feedback.length).toBe(0)
    })

    it('should provide feedback for weak passwords', () => {
      const result = calculatePasswordStrength('weak')
      expect(result.feedback).toContain('Use at least 8 characters')
      expect(result.feedback).toContain('Add uppercase letters')
      expect(result.feedback).toContain('Add numbers')
      expect(result.feedback).toContain('Add special characters')
    })

    it('should not provide feedback for strong passwords', () => {
      const result = calculatePasswordStrength('VeryStr0ng@Pass123')
      expect(result.feedback.length).toBe(0)
    })
  })

  describe('verificationSchema', () => {
    it('should accept file upload', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = verificationSchema.safeParse({
        documentFile: mockFile,
      })
      expect(result.success).toBe(true)
    })

    it('should accept document URL', () => {
      const result = verificationSchema.safeParse({
        documentUrl: 'https://example.com/document.pdf',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when neither file nor URL is provided', () => {
      const result = verificationSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})

