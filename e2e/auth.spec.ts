import { test, expect } from '@playwright/test';

test.describe('Auth page', () => {
  test('shows login form when logged out', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /authentication/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });
});
