import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tasks');
});

test('task groups and seed rows render', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'To do' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WIP' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Blocked' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();
  await expect(page.getByTestId('task-row-task-002')).toContainText('Block camera path for opening flythrough');
  await page.screenshot({ path: 'test-results/relay-table-only.png', fullPage: true });
});

test('filters narrow visible rows', async ({ page }) => {
  await page.getByLabel('Status').selectOption('blocked');
  await expect(page.getByTestId('task-row-task-005')).toBeVisible();
  await expect(page.getByTestId('task-row-task-002')).not.toBeVisible();

  await page.getByLabel('Search').fill('glass shader');
  await expect(page.getByTestId('task-row-task-005')).toBeVisible();

  await page.getByLabel('Search').fill('departure');
  await expect(page.getByTestId('task-row-task-005')).not.toBeVisible();
});

test('theme setting applies immediately for every option and persists', async ({ page }) => {
  const themeIds = [
    'theme-relay-brutalist',
    'theme-nord',
    'theme-dracula',
    'theme-gruvbox-dark',
    'theme-solarized-dark',
    'theme-tokyo-night',
    'theme-catppuccin-mocha',
  ];

  await expect(page.locator('.relay-shell')).toHaveClass(/theme-relay-brutalist/);

  await page.getByRole('button', { name: 'Open settings' }).click();
  for (const themeId of themeIds) {
    await page.getByLabel('Theme').selectOption(themeId);
    await expect(page.locator('.relay-shell')).toHaveClass(new RegExp(themeId));
  }

  await page.reload();
  await expect(page.locator('.relay-shell')).toHaveClass(/theme-catppuccin-mocha/);
});

test('tasks layout remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 820 });
  await expect(page.getByRole('heading', { name: 'Relay Task Board' })).toBeVisible();
  await expect(page.getByLabel('Task filters')).toBeVisible();
  await expect(page.getByTestId('task-row-task-002')).toBeVisible();

  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('button', { name: 'Open settings' })).toBeVisible();
});

test('clicking a row opens task pane', async ({ page }) => {
  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('heading', { name: 'Block camera path for opening flythrough' })).toBeVisible();
  await page.screenshot({ path: 'test-results/relay-pane-open.png', fullPage: true });
});

test('subtask toggles update progress', async ({ page }) => {
  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('pane-progress')).toHaveText('1/3');
  await page.getByTestId('subtask-task-002-b').check();
  await expect(page.getByTestId('pane-progress')).toHaveText('2/3');
  await expect(page.getByTestId('progress-task-002')).toContainText('2/3');
});

test('completing all subtasks marks task done and undo returns to wip', async ({ page }) => {
  await page.getByTestId('task-row-task-002').click();
  await page.getByTestId('subtask-task-002-b').check();
  await page.getByTestId('subtask-task-002-c').check();

  await expect(page.getByTestId('pane-progress')).toHaveText('3/3');
  await expect(page.getByTestId('task-pane')).toContainText('Done');
  await expect(page.getByTestId('group-done')).toContainText('Block camera path for opening flythrough');

  await page.getByRole('button', { name: 'Undo to WIP' }).click();
  await expect(page.getByTestId('task-pane')).toContainText('WIP');
  await expect(page.getByTestId('group-wip')).toContainText('Block camera path for opening flythrough');
});
