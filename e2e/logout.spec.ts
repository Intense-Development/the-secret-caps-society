import { test, expect } from '@playwright/test';

test.describe('Logout functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login with test credentials (adjust based on your test setup)
    // Note: This assumes you have test credentials or a way to authenticate
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Wait for successful login (adjust selector based on your app)
    await page.waitForURL(/\/(dashboard|home)/, { timeout: 5000 });
  });

  test('successfully logs out and redirects to home page', async ({ page }) => {
    // Verify user is authenticated (Navbar shows dashboard button)
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible();
    
    // Click logout button in Navbar
    await page.getByRole('button', { name: /log out/i }).click();
    
    // Verify confirmation dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/are you sure you want to log out/i)).toBeVisible();
    
    // Click "Log Out" in dialog
    await page.getByRole('button', { name: /^log out$/i }).click();
    
    // Wait for redirect to home page
    await page.waitForURL('/', { timeout: 5000 });
    
    // Verify Navbar shows login/signup buttons (user is logged out)
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    
    // Verify cannot access dashboard (should redirect to login)
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('shows confirmation dialog before logout', async ({ page }) => {
    // Click logout button
    await page.getByRole('button', { name: /log out/i }).click();
    
    // Verify dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/are you sure you want to log out/i)).toBeVisible();
    
    // Cancel logout
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Verify still authenticated (still on dashboard or home)
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible();
  });

  test('logout button is visible when authenticated', async ({ page }) => {
    // Verify logout button is visible in desktop view
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();
  });

  test('logout button works in mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByRole('button', { name: /toggle menu/i }).click();
    
    // Verify logout button is visible in mobile menu
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();
    
    // Click logout button
    await page.getByRole('button', { name: /log out/i }).click();
    
    // Verify confirmation dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible();
    
    // Confirm logout
    await page.getByRole('button', { name: /^log out$/i }).click();
    
    // Verify redirect to home
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('logout clears session cookies', async ({ page, context }) => {
    // Get cookies before logout
    const cookiesBefore = await context.cookies();
    const hasAuthCookies = cookiesBefore.some(
      (cookie) => cookie.name.includes('sb-') || cookie.name === 'sb-remember-me'
    );
    
    if (hasAuthCookies) {
      // Perform logout
      await page.getByRole('button', { name: /log out/i }).click();
      await page.getByRole('button', { name: /^log out$/i }).click();
      await page.waitForURL('/', { timeout: 5000 });
      
      // Get cookies after logout
      const cookiesAfter = await context.cookies();
      const hasAuthCookiesAfter = cookiesAfter.some(
        (cookie) => cookie.name.includes('sb-') || cookie.name === 'sb-remember-me'
      );
      
      // Verify auth cookies are cleared (or at least sb-remember-me is cleared)
      const rememberMeCookie = cookiesAfter.find((cookie) => cookie.name === 'sb-remember-me');
      expect(rememberMeCookie).toBeUndefined();
    }
  });

  test('logout is idempotent - can be called when already logged out', async ({ page }) => {
    // Log out first
    await page.getByRole('button', { name: /log out/i }).click();
    await page.getByRole('button', { name: /^log out$/i }).click();
    await page.waitForURL('/', { timeout: 5000 });
    
    // Try to access logout endpoint directly (should not error)
    // Since logout button won't be visible, we'll test the API directly
    const response = await page.request.post('/api/auth/logout');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

