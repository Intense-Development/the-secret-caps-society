import { test, expect } from '@playwright/test';

test.describe('Reset Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password');
  });

  test('should display reset password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.getByLabel(/^password$/i).fill('weak');
    
    // Should show strength indicator
    await expect(page.getByText(/weak|medium|strong/i)).toBeVisible();
    
    await page.getByLabel(/^password$/i).fill('StrongP@ss123');
    await expect(page.getByText(/strong|very strong/i)).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    
    await passwordInput.fill('TestPassword123!');
    
    // Find and click the visibility toggle button
    const passwordToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await passwordToggle.isVisible()) {
      await passwordToggle.click();
      
      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      await passwordToggle.click();
      // Password should be hidden again
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.getByLabel(/^password$/i).fill('weak');
    await page.getByLabel(/^password$/i).blur();
    
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
    await page.getByLabel(/confirm password/i).blur();
    
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /reset password/i }).click();
    
    await expect(page.getByText(/password is required|at least 8 characters/i)).toBeVisible();
  });

  test('should show error when user is not authenticated', async ({ page }) => {
    // Mock API to return 401 (no valid session)
    await page.route('/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid or expired password reset link.',
        }),
      });
    });

    await page.getByLabel(/^password$/i).fill('NewSecure123!');
    await page.getByLabel(/confirm password/i).fill('NewSecure123!');
    await page.getByRole('button', { name: /reset password/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid or expired/i)).toBeVisible();
  });

  test('should successfully reset password', async ({ page }) => {
    // Mock authenticated session and successful password reset
    await page.route('/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password updated successfully. Please log in with your new password.',
        }),
      });
    });

    // Mock Supabase auth check to simulate valid session
    await page.addInitScript(() => {
      // Mock Supabase client for session check
      (window as any).__MOCK_SUPABASE_SESSION__ = true;
    });

    await page.getByLabel(/^password$/i).fill('NewSecure123!');
    await page.getByLabel(/confirm password/i).fill('NewSecure123!');
    await page.getByRole('button', { name: /reset password/i }).click();
    
    // Should show success message and redirect or show login prompt
    await expect(page.getByText(/password updated successfully/i)).toBeVisible();
  });

  test('should show error for expired token', async ({ page }) => {
    await page.route('/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'This password reset link has expired or is invalid. Please request a new one.',
        }),
      });
    });

    await page.getByLabel(/^password$/i).fill('NewSecure123!');
    await page.getByLabel(/confirm password/i).fill('NewSecure123!');
    await page.getByRole('button', { name: /reset password/i }).click();
    
    await expect(page.getByText(/expired or is invalid/i)).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back to login/i });
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should validate all password requirements', async ({ page }) => {
    const passwordInput = page.getByLabel(/^password$/i);
    
    // Test missing uppercase
    await passwordInput.fill('lowercase123!');
    await passwordInput.blur();
    await expect(page.getByText(/uppercase/i)).toBeVisible();
    
    // Test missing lowercase
    await passwordInput.fill('UPPERCASE123!');
    await passwordInput.blur();
    await expect(page.getByText(/lowercase/i)).toBeVisible();
    
    // Test missing number
    await passwordInput.fill('NoNumber!');
    await passwordInput.blur();
    await expect(page.getByText(/number/i)).toBeVisible();
    
    // Test missing special character
    await passwordInput.fill('NoSpecial123');
    await passwordInput.blur();
    await expect(page.getByText(/special/i)).toBeVisible();
  });
});

