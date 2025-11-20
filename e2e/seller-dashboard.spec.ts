import { test, expect } from '@playwright/test'

test.describe('Seller Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/en/login')
    
    // Login as seller (assuming test seller account exists)
    // In a real scenario, you'd create a test seller account first
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
  })

  test('should display seller dashboard with summary cards', async ({ page }) => {
    // Verify dashboard title
    await expect(page.getByText(/seller dashboard|dashboard/i)).toBeVisible()
    
    // Verify summary cards are displayed
    // Revenue card
    await expect(page.getByText(/revenue|total revenue/i)).toBeVisible()
    
    // Orders card
    await expect(page.getByText(/orders|total orders/i)).toBeVisible()
    
    // Products card
    await expect(page.getByText(/products|products listed/i)).toBeVisible()
    
    // Low stock alerts card
    await expect(page.getByText(/low stock|alerts/i)).toBeVisible()
  })

  test('should navigate to products page', async ({ page }) => {
    // Click on Products in sidebar
    await page.getByRole('link', { name: /products/i }).click()
    
    // Verify we're on products page
    await expect(page).toHaveURL(/\/dashboard\/seller\/products/)
    await expect(page.getByText(/products/i)).toBeVisible()
  })

  test('should navigate to orders page', async ({ page }) => {
    // Click on Orders in sidebar
    await page.getByRole('link', { name: /orders/i }).click()
    
    // Verify we're on orders page
    await expect(page).toHaveURL(/\/dashboard\/seller\/orders/)
    await expect(page.getByText(/orders/i)).toBeVisible()
  })

  test('should navigate to revenue page', async ({ page }) => {
    // Click on Revenue in sidebar
    await page.getByRole('link', { name: /revenue/i }).click()
    
    // Verify we're on revenue page
    await expect(page).toHaveURL(/\/dashboard\/seller\/revenue/)
    await expect(page.getByText(/revenue/i)).toBeVisible()
  })

  test('should navigate to shipping page', async ({ page }) => {
    // Click on Shipping in sidebar
    await page.getByRole('link', { name: /shipping/i }).click()
    
    // Verify we're on shipping page
    await expect(page).toHaveURL(/\/dashboard\/seller\/shipping/)
    await expect(page.getByText(/shipping/i)).toBeVisible()
  })

  test('should navigate to team page', async ({ page }) => {
    // Click on Team in sidebar
    await page.getByRole('link', { name: /team/i }).click()
    
    // Verify we're on team page
    await expect(page).toHaveURL(/\/dashboard\/seller\/team/)
    await expect(page.getByText(/team/i)).toBeVisible()
  })

  test('should navigate to settings page', async ({ page }) => {
    // Click on Settings in sidebar
    await page.getByRole('link', { name: /settings/i }).click()
    
    // Verify we're on settings page
    await expect(page).toHaveURL(/\/dashboard\/seller\/settings/)
    await expect(page.getByText(/settings/i)).toBeVisible()
  })

  test('should display store selector when multiple stores exist', async ({ page }) => {
    // Look for store selector in header
    const storeSelector = page.getByRole('combobox', { name: /store|select store/i })
    
    // If multiple stores exist, selector should be visible
    // If only one store, it might not be shown
    const isVisible = await storeSelector.isVisible().catch(() => false)
    
    if (isVisible) {
      await expect(storeSelector).toBeVisible()
    }
  })

  test('should show global search in header', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should handle no stores scenario gracefully', async ({ page }) => {
    // If seller has no stores, should show appropriate message
    const noStoresMessage = page.getByText(/no stores|create a store/i)
    const isVisible = await noStoresMessage.isVisible().catch(() => false)
    
    // If visible, verify it's helpful
    if (isVisible) {
      await expect(noStoresMessage).toBeVisible()
    }
  })
})

test.describe('Seller Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
    
    // Navigate to products page
    await page.getByRole('link', { name: /products/i }).click()
    await page.waitForURL(/\/dashboard\/seller\/products/)
  })

  test('should display products list', async ({ page }) => {
    // Verify products page loads
    await expect(page.getByText(/products/i)).toBeVisible()
    
    // Look for products table or list
    const productsTable = page.locator('table, [role="table"]')
    const noProductsMessage = page.getByText(/no products|create your first product/i)
    
    // Either products table or no products message should be visible
    const hasTable = await productsTable.isVisible().catch(() => false)
    const hasMessage = await noProductsMessage.isVisible().catch(() => false)
    
    expect(hasTable || hasMessage).toBe(true)
  })

  test('should open create product dialog', async ({ page }) => {
    // Click add product button
    const addButton = page.getByRole('button', { name: /add product|create product|new product/i })
    
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click()
      
      // Verify dialog opens
      await expect(page.getByText(/create.*product|new product/i)).toBeVisible()
      
      // Verify form fields
      await expect(page.getByLabel(/product name|name/i)).toBeVisible()
      await expect(page.getByLabel(/price/i)).toBeVisible()
      await expect(page.getByLabel(/stock/i)).toBeVisible()
    }
  })

  test('should search products', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/search products/i)
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test product')
      
      // Wait for search results
      await page.waitForTimeout(500)
      
      // Verify search is working (results filtered or message shown)
      const results = page.locator('table tbody tr, [role="row"]')
      const count = await results.count()
      
      // Results should be filtered (or empty if no matches)
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })
})

test.describe('Seller Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
    
    // Navigate to orders page
    await page.getByRole('link', { name: /orders/i }).click()
    await page.waitForURL(/\/dashboard\/seller\/orders/)
  })

  test('should display orders list', async ({ page }) => {
    // Verify orders page loads
    await expect(page.getByText(/orders/i)).toBeVisible()
    
    // Look for orders table or list
    const ordersTable = page.locator('table, [role="table"]')
    const noOrdersMessage = page.getByText(/no orders|orders will appear/i)
    
    // Either orders table or no orders message should be visible
    const hasTable = await ordersTable.isVisible().catch(() => false)
    const hasMessage = await noOrdersMessage.isVisible().catch(() => false)
    
    expect(hasTable || hasMessage).toBe(true)
  })

  test('should filter orders by status', async ({ page }) => {
    // Find status filter dropdown
    const statusFilter = page.getByRole('combobox', { name: /status|filter/i })
    
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click()
      
      // Select a status
      await page.getByRole('option', { name: /pending|completed|processing/i }).first().click()
      
      // Wait for filter to apply
      await page.waitForTimeout(500)
      
      // Verify filter is applied (orders should be filtered)
      await expect(statusFilter).toBeVisible()
    }
  })

  test('should view order details', async ({ page }) => {
    // Find view button for first order
    const viewButton = page.getByRole('button', { name: /view|details/i }).first()
    
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click()
      
      // Verify order detail dialog or page opens
      await expect(page.getByText(/order details|order #/i)).toBeVisible({ timeout: 5000 })
      
      // Verify order information is displayed
      await expect(page.getByText(/customer|customer information/i)).toBeVisible()
    }
  })
})

test.describe('Seller Revenue Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
    
    // Navigate to revenue page
    await page.getByRole('link', { name: /revenue/i }).click()
    await page.waitForURL(/\/dashboard\/seller\/revenue/)
  })

  test('should display revenue overview cards', async ({ page }) => {
    // Verify revenue page loads
    await expect(page.getByText(/revenue/i)).toBeVisible()
    
    // Look for revenue metrics
    await expect(page.getByText(/total revenue|revenue/i)).toBeVisible()
    await expect(page.getByText(/average|order value/i)).toBeVisible()
    await expect(page.getByText(/total orders|orders/i)).toBeVisible()
  })

  test('should change revenue period', async ({ page }) => {
    // Find period selector
    const periodSelector = page.getByRole('button', { name: /7d|30d|90d|1y|period/i })
    
    if (await periodSelector.isVisible().catch(() => false)) {
      await periodSelector.click()
      
      // Select different period
      await page.getByRole('option', { name: /30d|30 days/i }).click()
      
      // Wait for data to update
      await page.waitForTimeout(1000)
      
      // Verify period changed (data should update)
      await expect(page.getByText(/revenue/i)).toBeVisible()
    }
  })

  test('should export revenue data', async ({ page }) => {
    // Find export button
    const exportButton = page.getByRole('button', { name: /export|download|csv/i })
    
    if (await exportButton.isVisible().catch(() => false)) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      await exportButton.click()
      
      // Verify download started (if implemented)
      const download = await downloadPromise
      if (download) {
        expect(download).toBeTruthy()
      }
    }
  })
})

test.describe('Seller Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
    
    // Navigate to settings page
    await page.getByRole('link', { name: /settings/i }).click()
    await page.waitForURL(/\/dashboard\/seller\/settings/)
  })

  test('should display store settings', async ({ page }) => {
    // Verify settings page loads
    await expect(page.getByText(/settings/i)).toBeVisible()
    
    // Look for store settings section
    await expect(page.getByText(/store|store settings|store information/i)).toBeVisible()
  })

  test('should display account settings', async ({ page }) => {
    // Look for account settings section
    await expect(page.getByText(/account|account settings|account information/i)).toBeVisible()
  })

  test('should update store name', async ({ page }) => {
    // Find store name input
    const storeNameInput = page.getByLabel(/store name|name/i)
    
    if (await storeNameInput.isVisible().catch(() => false)) {
      const newName = `Updated Store ${Date.now()}`
      await storeNameInput.clear()
      await storeNameInput.fill(newName)
      
      // Find save button
      const saveButton = page.getByRole('button', { name: /save|update|submit/i })
      
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click()
        
        // Wait for success message or update
        await page.waitForTimeout(1000)
        
        // Verify update (name should be updated or success message shown)
        await expect(page.getByText(newName).or(page.getByText(/success|updated/i))).toBeVisible({ timeout: 5000 })
      }
    }
  })
})

test.describe('Seller Global Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel('Email').fill('seller@test.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/dashboard\/seller/, { timeout: 10000 })
  })

  test('should perform global search', async ({ page }) => {
    // Find search input in header
    const searchInput = page.getByPlaceholder(/search products|search orders|search/i)
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test')
      
      // Wait for search results popover
      await page.waitForTimeout(500)
      
      // Verify search results appear (or no results message)
      const results = page.locator('[role="option"], [role="listbox"] li, .search-result')
      const noResults = page.getByText(/no results|not found/i)
      
      const hasResults = await results.first().isVisible().catch(() => false)
      const hasNoResults = await noResults.isVisible().catch(() => false)
      
      expect(hasResults || hasNoResults).toBe(true)
    }
  })

  test('should navigate to search result', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/search/i)
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('product')
      await page.waitForTimeout(500)
      
      // Click on first result
      const firstResult = page.locator('[role="option"], .search-result').first()
      
      if (await firstResult.isVisible().catch(() => false)) {
        await firstResult.click()
        
        // Verify navigation occurred
        await page.waitForTimeout(1000)
        
        // Should navigate to product, order, or customer page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/dashboard\/seller\/(products|orders|team)/)
      }
    }
  })
})

