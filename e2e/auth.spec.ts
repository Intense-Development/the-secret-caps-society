import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders Supabase login form with password and magic-link options', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /log in to your account/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /email me a magic link/i })).toBeVisible();
  });
});
