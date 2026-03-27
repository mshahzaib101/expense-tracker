import { expect, test } from '@playwright/test';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerUser(
  page: import('@playwright/test').Page,
  input: { name: string; email: string; password: string },
) {
  await page.goto('/register');
  await page.getByLabel('Full Name').fill(input.name);
  await page.getByLabel('Email').fill(input.email);
  await page.getByLabel(/^Password$/).fill(input.password);
  await page.getByLabel(/^Confirm Password$/).fill(input.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/overview');
}

test('user can register, create an expense, edit it, and delete it', async ({ page }) => {
  const email = uniqueEmail('expense-user');
  const password = 'password123';

  await registerUser(page, {
    name: 'Expense User',
    email,
    password,
  });

  await expect(page.getByRole('heading', { name: /hello/i })).toBeVisible();

  await page.getByRole('button', { name: 'Add Expense' }).first().click();
  await expect(page.getByRole('heading', { name: 'Add Expense' })).toBeVisible();

  await page.getByPlaceholder('0.00').fill('42.50');
  await page.getByRole('button', { name: 'Food' }).click();
  await page.getByPlaceholder('Lunch, groceries, subscription...').fill('Groceries run');
  await page.getByRole('button', { name: 'Add Expense' }).last().click();

  await expect(page.getByText('Expense added')).toBeVisible();

  await page.goto('/expenses');
  const row = page.locator('tr').filter({ hasText: 'Groceries run' });
  await expect(row).toBeVisible();
  await expect(row).toContainText('$42.50');
  await row.hover();
  await page.getByLabel('Edit expense Groceries run').click();

  await page.getByPlaceholder('0.00').fill('48.75');
  await page.getByPlaceholder('Lunch, groceries, subscription...').fill('Updated grocery trip');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Expense updated')).toBeVisible();
  const updatedRow = page.locator('tr').filter({ hasText: 'Updated grocery trip' });
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow).toContainText('$48.75');
  await updatedRow.hover();
  await page.getByLabel('Delete expense Updated grocery trip').click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Expense deleted')).toBeVisible();
  await expect(page.getByText('No expenses found')).toBeVisible();
});

test('user can change password and sign in with the new credentials', async ({ page }) => {
  const email = uniqueEmail('settings-user');
  const oldPassword = 'password123';
  const newPassword = 'password456';

  await registerUser(page, {
    name: 'Settings User',
    email,
    password: oldPassword,
  });

  await page.goto('/settings');
  await page.getByLabel(/^Current Password$/).fill(oldPassword);
  await page.getByLabel(/^New Password$/).fill(newPassword);
  await page.getByLabel(/^Confirm New Password$/).fill(newPassword);
  await page.getByRole('button', { name: 'Change Password' }).click();

  await expect(page.getByText('Password changed. Please log in again.')).toBeVisible();
  await page.waitForURL('**/login');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password$/).fill(newPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL('**/overview');
  await expect(page.getByRole('heading', { name: /hello/i })).toBeVisible();
});
