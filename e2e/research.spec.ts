import { expect, test, type Page } from '@playwright/test';
import { signIn } from './support/auth';
import { createConfirmedUser } from './support/users';

const TRANSCRIPT = `Interviewer: How did you choose a payment method?
P01: I always look for the padlock first. If the page looks cheap I leave.
Interviewer: What would make you trust it more?
P01: Seeing the card brand logos next to the field.`;

async function createProject(page: Page, name: string) {
  await page.getByRole('button', { name: 'New project' }).first().click();
  await page.getByLabel('Name').fill(name);
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

async function createStudy(page: Page, title: string) {
  await page.getByRole('button', { name: 'New study' }).click();
  const dialog = page.getByRole('dialog', { name: 'New study' });
  await dialog.getByLabel('Title').fill(title);
  await dialog.getByLabel(/Research goal/).fill('Understand trust at the payment step');
  await dialog.getByLabel(/Research questions/).fill('What builds trust?\nWhen do shoppers leave?');
  await dialog.getByLabel('Interviews').check();
  await dialog.getByRole('button', { name: 'Create study' }).click();
  await expect(page).toHaveURL(/\/studies\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test.describe('research workspace', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, await createConfirmedUser('research'));
  });

  test('create a study, paste a transcript, upload a file and find it in search', async ({
    page,
  }) => {
    await createProject(page, 'Checkout research');
    await expect(page.getByText('Start with a study')).toBeVisible();
    await createStudy(page, 'Payment trust interviews');
    await expect(page.getByText('What builds trust?')).toBeVisible();

    // Paste a transcript.
    await page.getByRole('button', { name: 'Add source' }).click();
    let dialog = page.getByRole('dialog', { name: 'Add source' });
    await dialog.getByRole('button', { name: 'Add source' }).click();
    await expect(dialog.getByText('Paste the transcript or notes')).toBeVisible();
    await dialog.getByLabel('Transcript or notes').fill(TRANSCRIPT);
    await dialog.getByLabel('Title').fill('Interview with P01');
    await dialog.getByRole('button', { name: 'Add source' }).click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('list', { name: 'Sources' }).getByText('Interview with P01'),
    ).toBeVisible();

    // Upload a text file.
    await page.getByRole('button', { name: 'Add source' }).click();
    dialog = page.getByRole('dialog', { name: 'Add source' });
    await dialog.getByRole('tab', { name: 'Upload a file' }).click();
    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'field_notes-day-2.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# Day 2\nShoppers hesitated at the shipping estimate.'),
    });
    await expect(dialog.getByLabel('Title')).toHaveValue('field notes day 2');
    await dialog.getByRole('button', { name: 'Add source' }).click();
    await expect(dialog).toBeHidden();

    // Open the uploaded source and read its text.
    await page.getByRole('link', { name: /field notes day 2/ }).click();
    await expect(page.getByRole('heading', { name: 'field notes day 2' })).toBeVisible();
    await expect(page.getByText('Shoppers hesitated at the shipping estimate.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Original file' })).toBeVisible();

    // Search finds text inside the pasted transcript.
    await page.goto('/research?q=padlock');
    const sources = page.getByRole('region', { name: /Sources/ });
    await expect(sources.getByText('Interview with P01')).toBeVisible();
    await expect(sources.locator('mark', { hasText: 'padlock' })).toBeVisible();

    await page.getByLabel('Search research').fill('zzzz-nothing');
    await expect(page.getByText('No results for “zzzz-nothing”')).toBeVisible();
  });

  test('record consent, link a source, then delete the participant with their data', async ({
    page,
  }) => {
    await createProject(page, 'Clinic study');
    await createStudy(page, 'Nurse interviews');
    const studyUrl = page.url();

    // Add a participant from the project page.
    await page.getByRole('link', { name: 'Clinic study' }).first().click();
    await page.getByRole('tab', { name: /Participants/ }).click();
    await expect(page).toHaveURL(/tab=participants/);
    await page.getByRole('button', { name: 'Add participant' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add participant' });
    await expect(dialog.getByLabel('Label')).toHaveValue('P01');
    await dialog.getByLabel('Consent granted').check();
    await dialog.getByLabel(/Attributes/).fill('Role: Night nurse');
    await dialog.getByRole('button', { name: 'Add participant' }).click();
    const list = page.getByRole('list', { name: 'Participants' });
    await expect(list.getByText('Consent granted')).toBeVisible();
    await expect(list.getByText('Night nurse')).toBeVisible();

    // Link a pasted source to them.
    await page.goto(studyUrl);
    await page.getByRole('button', { name: 'Add source' }).click();
    const add = page.getByRole('dialog', { name: 'Add source' });
    await add
      .getByLabel('Transcript or notes')
      .fill('P01: The handover sheet is always out of date.');
    await add.getByLabel('Title').fill('Handover interview');
    await add.getByLabel(/Participant/).selectOption({ label: 'P01' });
    await add.getByRole('button', { name: 'Add source' }).click();
    await expect(add).toBeHidden();

    // Withdraw consent: the source shows a warning.
    await page.getByRole('link', { name: /Handover interview/ }).click();
    await expect(page.getByText('Consent granted')).toBeVisible();
    await page.goto(studyUrl.replace(/\/studies\/.*/, '?tab=participants'));
    await page.getByRole('button', { name: 'Actions for P01' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit P01' });
    await edit.getByLabel('Consent withdrawn').check();
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      page.getByRole('list', { name: 'Participants' }).getByText('Consent withdrawn'),
    ).toBeVisible();

    // Delete P01 with all their data: the linked source goes too.
    await page.getByRole('button', { name: 'Actions for P01' }).click();
    await page.getByRole('menuitem', { name: 'Delete with all data' }).click();
    const purge = page.getByRole('dialog', { name: 'Delete P01 and their data?' });
    await expect(purge.getByText(/1 linked source/)).toBeVisible();
    const confirm = purge.getByRole('button', { name: 'Delete participant' });
    await expect(confirm).toBeDisabled();
    await purge.getByLabel('Type P01 to confirm').fill('P01');
    await confirm.click();
    await expect(purge).toBeHidden();
    await expect(page.getByText('No participants yet')).toBeVisible();

    await page.getByRole('tab', { name: /Sources/ }).click();
    await expect(page.getByText('No sources yet')).toBeVisible();
  });
});
