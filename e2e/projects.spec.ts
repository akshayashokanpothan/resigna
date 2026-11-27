import { expect, test } from '@playwright/test';
import { signIn } from './support/auth';
import { createConfirmedUser } from './support/users';

test.describe('projects', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, await createConfirmedUser('projects'));
  });

  test('create a project, then find it in the list', async ({ page }) => {
    await expect(page.getByText('No projects yet')).toBeVisible();
    await page.getByRole('button', { name: 'New project' }).first().click();

    const dialog = page.getByRole('dialog', { name: 'New project' });
    await dialog.getByRole('button', { name: 'Create project' }).click();
    await expect(dialog.getByText(/at least 2 characters/)).toBeVisible();

    await dialog.getByLabel('Name').fill('Checkout redesign interviews');
    await dialog.getByLabel(/Description/).fill('Five interviews with returning shoppers');
    await dialog.getByRole('button', { name: 'Create project' }).click();

    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { name: 'Checkout redesign interviews' })).toBeVisible();

    await page.goto('/projects');
    await expect(
      page.getByRole('list', { name: 'Projects' }).getByText('Checkout redesign interviews'),
    ).toBeVisible();
  });

  test('rename and archive a project', async ({ page }) => {
    await page.getByRole('button', { name: 'New project' }).first().click();
    await page.getByLabel('Name').fill('Onboarding study');
    await page.getByRole('button', { name: 'Create project' }).click();
    await expect(page.getByRole('heading', { name: 'Onboarding study' })).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Name').fill('Onboarding diary study');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'Onboarding diary study' })).toBeVisible();

    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('This project is archived')).toBeVisible();

    await page.goto('/projects');
    await expect(
      page.getByRole('list', { name: 'Archived projects' }).getByText('Onboarding diary study'),
    ).toBeVisible();
  });
});
