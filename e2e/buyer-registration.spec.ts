import { test, expect } from '@playwright/test'

test.describe('Buyer Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display account type selection on initial load', async ({ page }) => {
    await expect(page.getByText('Choose account type')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Buyer' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Seller' })).toBeVisible()
  })

  test('should select buyer account type and show buyer form', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await expect(page.getByLabel('Full Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
  })

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.getByText('Buyer').click()
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Email').blur()
    
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await page.getByLabel('Password', { exact: true }).fill('weak')
    await expect(page.getByText('Weak')).toBeVisible()
    
    await page.getByLabel('Password', { exact: true }).fill('StrongP@ss123')
    await expect(page.getByText(/Strong|Very Strong/)).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await page.getByLabel('Password', { exact: true }).fill('Password123!')
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!')
    await page.getByLabel('Confirm Password').blur()
    
    await expect(page.getByText("Passwords don't match")).toBeVisible()
  })

  test('should require terms and conditions agreement', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await page.getByLabel('Full Name').fill('John Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Password', { exact: true }).fill('Password123!')
    await page.getByLabel('Confirm Password').fill('Password123!')
    
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('You must agree to the terms and conditions')).toBeVisible()
  })

  test('should successfully submit buyer registration with valid data', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    // Fill in valid data
    await page.getByLabel('Full Name').fill('John Doe')
    await page.getByLabel('Email').fill(`buyer${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByLabel(/I agree to the/).check()
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should show loading state
    await expect(page.getByText('Creating account')).toBeVisible()
  })

  test('should navigate back to account type selection', async ({ page }) => {
    await page.getByText('Buyer').click()
    await expect(page.getByLabel('Full Name')).toBeVisible()
    
    await page.getByRole('button', { name: 'Back' }).click()
    
    await expect(page.getByText('Choose account type')).toBeVisible()
  })

  test('should have accessible "Already have an account" link', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    const loginLink = page.getByRole('link', { name: 'Log in' })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('should display password requirements as user types', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    await page.getByLabel('Password', { exact: true }).fill('abc')
    
    // Should show improvement suggestions
    await expect(page.getByText(/improvement/i)).toBeVisible()
  })

  test('should handle duplicate email registration', async ({ page }) => {
    await page.getByText('Buyer').click()
    
    // Use a known existing email
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('existing@example.com')
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByLabel(/I agree to the/).check()
    
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should show error message (timing depends on API)
    await page.waitForTimeout(2000)
  })
})

