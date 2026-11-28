import { expect, test } from '@playwright/test';
import { signIn } from './support/auth';
import { createConfirmedUser, newTestUser } from './support/users';

test.describe('authentication', () => {
  test('a new user signs up and lands in their own workspace', async ({ page }) => {
    const user = newTestUser('signup');

    await page.goto('/signup');
    await page.getByLabel('Name').fill(user.name);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill(user.password);
    await page.getByLabel('Confirm password').fill(user.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByText('No projects yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'User menu' })).toContainText(user.name);
  });

  test('an existing user signs in and out', async ({ page }) => {
    const user = await createConfirmedUser('signin');

    await signIn(page, user);
    await expect(page.getByRole('heading', { name: 'Projects', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'User menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('a wrong password shows an error and stays on the login page', async ({ page }) => {
    const user = await createConfirmedUser('badpw');

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(`${user.password}-wrong`);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.locator('[data-sonner-toast]').getByText(/incorrect|invalid/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('protected routes', () => {
  test('a signed-out visitor is sent to login and back to the page they asked for', async ({
    page,
  }) => {
    const user = await createConfirmedUser('redirect');

    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login\?redirectedFrom=%2Fsettings$/);

    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('a signed-in user is sent away from the login page', async ({ page }) => {
    const user = await createConfirmedUser('authonly');
    await signIn(page, user);

    await page.goto('/login');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
