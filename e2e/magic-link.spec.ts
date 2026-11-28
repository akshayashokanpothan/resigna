import { expect, test } from '@playwright/test';
import { createConfirmedUser, generateMagicLink } from './support/users';

test.describe('magic link sign-in', () => {
  test('a user asks for a link and signs in with the code from the email', async ({ page }) => {
    const user = await createConfirmedUser('magic-code');

    await page.goto('/login');
    await page.getByRole('button', { name: 'Email me a sign-in link instead' }).click();
    await page.getByLabel('Email').fill(user.email);
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click();

    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Resend in \d+s/ })).toBeDisabled();

    // The newest code replaces the one in the email, so read it after the request.
    const { code } = await generateMagicLink(user.email);
    await page.getByLabel('Code').fill(code);
    await page.getByRole('button', { name: 'Sign in with code' }).click();

    await expect(page).toHaveURL(/\/projects$/);
  });

  test('a wrong code shows an error and keeps the user on the code step', async ({ page }) => {
    const user = await createConfirmedUser('magic-badcode');

    await page.goto('/login');
    await page.getByRole('button', { name: 'Email me a sign-in link instead' }).click();
    await page.getByLabel('Email').fill(user.email);
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();

    await page.getByLabel('Code').fill('000000');
    await page.getByRole('button', { name: 'Sign in with code' }).click();

    await expect(
      page.locator('[data-sonner-toast]').getByText(/wrong or has expired/i),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('the email link signs in from a browser that never asked for it', async ({ page }) => {
    const user = await createConfirmedUser('magic-link');
    const { tokenHash } = await generateMagicLink(user.email);

    await page.goto(`/api/auth/confirm?next=%2Fsettings&token_hash=${tokenHash}&type=email`);
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('a used link sends the user to login with a way to get a new one', async ({
    page,
    browser,
  }) => {
    const user = await createConfirmedUser('magic-used');
    const { tokenHash } = await generateMagicLink(user.email);
    const link = `/api/auth/confirm?next=%2Fprojects&token_hash=${tokenHash}&type=email`;

    await page.goto(link);
    await expect(page).toHaveURL(/\/projects$/);

    const other = await browser.newPage();
    await other.goto(link);
    await expect(other).toHaveURL(/\/login\?error=link_expired$/);
    await expect(other.getByRole('button', { name: 'Email me a sign-in link' })).toBeVisible();
    await other.close();
  });
});
