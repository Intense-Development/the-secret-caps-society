import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should navigate to forgot password page from login', async ({ page }) => {
    // Look for "Forgot password?" link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeVisible();
    
    await forgotPasswordLink.click();
    
    // Should be on forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole('heading', { name: /forgot your password/i })).toBeVisible();
  });

  test('should display forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.getByRole('heading', { name: /forgot your password/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Email').blur();
    
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should show success message after form submission', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Mock the API response
    await page.route('/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'If an account exists with that email, you will receive a password reset link.',
        }),
      });
    });

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Should show success message
    await expect(page.getByText(/if an account exists with that email/i)).toBeVisible();
    
    // Button should be disabled during cooldown
    const submitButton = page.getByRole('button', { name: /resend in/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should enable cooldown after submission', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.route('/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'If an account exists with that email, you will receive a password reset link.',
        }),
      });
    });

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Wait for cooldown message
    await expect(page.getByText(/resend in \d+s/i)).toBeVisible();
    await expect(page.getByText(/didn't receive the email/i)).toBeVisible();
  });

  test('should show error message on API failure', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Mock API error
    await page.route('/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'An unexpected error occurred.',
        }),
      });
    });

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Should show error toast/alert
    await expect(page.getByText(/unable to send reset email/i)).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.getByRole('link', { name: /back to login/i }).click();
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to login from footer link', async ({ page }) => {
    await page.goto('/forgot-password');
    
    const loginLink = page.getByRole('link', { name: /log in/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    
    await expect(page).toHaveURL(/\/login/);
  });
});

