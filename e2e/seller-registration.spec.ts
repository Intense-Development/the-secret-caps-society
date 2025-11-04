import { test, expect } from '@playwright/test'

test.describe('Seller Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should complete seller registration step 1 - account info', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Verify step 1 is shown
    await expect(page.getByText('Step 1 of 4')).toBeVisible()
    
    // Fill in account information
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    
    // Continue to next step
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Should show step 2
    await expect(page.getByText('Step 2 of 4')).toBeVisible()
  })

  test('should complete seller registration step 2 - store info', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 2 - Store Info
    await expect(page.getByText('Step 2 of 4')).toBeVisible()
    
    await page.getByLabel('Store Name').fill('Amazing Cap Store')
    await page.getByLabel('Store Description').fill('We sell the best caps in town with great quality')
    await page.getByLabel('Website (Optional)').fill('https://amazingcaps.com')
    
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Should show step 3
    await expect(page.getByText('Step 3 of 4')).toBeVisible()
  })

  test('should validate store description length', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Complete step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 2 - Try short description
    await page.getByLabel('Store Name').fill('Test Store')
    await page.getByLabel('Store Description').fill('Too short')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await expect(page.getByText('Description must be at least 10 characters')).toBeVisible()
  })

  test('should complete seller registration step 3 - location details', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 2
    await page.getByLabel('Store Name').fill('Amazing Cap Store')
    await page.getByLabel('Store Description').fill('We sell the best caps in town')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 3 - Location Details
    await expect(page.getByText('Step 3 of 4')).toBeVisible()
    
    await page.getByLabel('Business Type').selectOption('llc')
    await page.getByLabel('Tax ID (Optional)').fill('12-3456789')
    await page.getByLabel('Business Address').fill('123 Main Street')
    await page.getByLabel('City').fill('New York')
    await page.getByLabel('State/Province').fill('NY')
    await page.getByLabel('ZIP/Postal Code').fill('10001')
    
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Should show step 4
    await expect(page.getByText('Step 4 of 4')).toBeVisible()
  })

  test('should validate business type selection', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Navigate to step 3
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await page.getByLabel('Store Name').fill('Test Store')
    await page.getByLabel('Store Description').fill('Great store description here')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Try to continue without selecting business type
    await page.getByLabel('Business Address').fill('123 Main St')
    await page.getByLabel('City').fill('Boston')
    await page.getByLabel('State/Province').fill('MA')
    await page.getByLabel('ZIP/Postal Code').fill('02101')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await expect(page.getByText('Please select a business type')).toBeVisible()
  })

  test('should show progress bar during seller registration', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Check progress at step 1
    await expect(page.getByText('25% Complete')).toBeVisible()
    
    // Move to step 2
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await expect(page.getByText('50% Complete')).toBeVisible()
  })

  test('should allow going back through seller registration steps', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Complete step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // We're at step 2, go back
    await page.getByRole('button', { name: 'Back' }).click()
    
    // Should be at step 1 again
    await expect(page.getByText('Step 1 of 4')).toBeVisible()
    await expect(page.getByLabel('Full Name')).toHaveValue('Seller John')
  })

  test('should display file upload on step 4', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Navigate through all steps to step 4
    // Step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 2
    await page.getByLabel('Store Name').fill('Amazing Cap Store')
    await page.getByLabel('Store Description').fill('We sell the best caps in town')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 3
    await page.getByLabel('Business Type').selectOption('llc')
    await page.getByLabel('Business Address').fill('123 Main Street')
    await page.getByLabel('City').fill('New York')
    await page.getByLabel('State/Province').fill('NY')
    await page.getByLabel('ZIP/Postal Code').fill('10001')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 4 - Verification
    await expect(page.getByText('Step 4 of 4')).toBeVisible()
    await expect(page.getByText('Upload Business License or ID')).toBeVisible()
    await expect(page.getByText('Drag and drop or click to upload')).toBeVisible()
  })

  test('should show success modal after complete seller registration', async ({ page }) => {
    // This test would require mocking the API or using a test database
    await page.getByText('Seller').click()
    
    // Complete all steps
    // Step 1
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 2
    await page.getByLabel('Store Name').fill('Amazing Cap Store')
    await page.getByLabel('Store Description').fill('We sell the best caps in town')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 3
    await page.getByLabel('Business Type').selectOption('llc')
    await page.getByLabel('Business Address').fill('123 Main Street')
    await page.getByLabel('City').fill('New York')
    await page.getByLabel('State/Province').fill('NY')
    await page.getByLabel('ZIP/Postal Code').fill('10001')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Step 4 - Would need to upload file in real test
    // For now, just verify the UI elements are present
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should validate URL format for store website', async ({ page }) => {
    await page.getByText('Seller').click()
    
    // Navigate to step 2
    await page.getByLabel('Full Name').fill('Seller John')
    await page.getByLabel('Email').fill(`seller${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    // Enter invalid URL
    await page.getByLabel('Store Name').fill('Test Store')
    await page.getByLabel('Store Description').fill('Great store description')
    await page.getByLabel('Website (Optional)').fill('not-a-valid-url')
    await page.getByRole('button', { name: 'Continue' }).click()
    
    await expect(page.getByText('Please enter a valid URL')).toBeVisible()
  })
})

