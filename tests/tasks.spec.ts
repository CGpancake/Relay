import { expect, test } from '@playwright/test';
import { themes } from '../src/themes';

test.beforeEach(async ({ page }) => {
  await page.goto('/tasks');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('task groups and seed rows render', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'To do' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WIP' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Blocked' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();
  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-002')).toContainText('block camera path for opening flythrough');
  await page.screenshot({ path: 'test-results/relay-table-only.png', fullPage: true });
});

test('user filter is first, defaults to current user, and seeded work is visible', async ({ page }) => {
  const filterLabels = await page.locator('.filters label').evaluateAll((labels) =>
    labels.map((label) => label.childNodes[0]?.textContent?.trim()),
  );
  expect(filterLabels[0]).toBe('User');
  await expect(page.getByLabel('User')).toHaveValue('James Green');
  await expect(page.getByTestId('task-row-task-001')).toBeVisible();
  await expect(page.getByTestId('task-row-task-007')).toBeVisible();
  await expect(page.getByTestId('task-row-task-002')).not.toBeVisible();

  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-002')).toBeVisible();
});

test('filters narrow visible rows', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByLabel('Status').selectOption('blocked');
  await expect(page.getByTestId('task-row-task-005')).toBeVisible();
  await expect(page.getByTestId('task-row-task-002')).not.toBeVisible();

  await page.getByLabel('Search').fill('glass shader');
  await expect(page.getByTestId('task-row-task-005')).toBeVisible();

  await page.getByLabel('Search').fill('departure');
  await expect(page.getByTestId('task-row-task-005')).not.toBeVisible();
});

test('selects use theme tokens for background and text', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  const themeSelect = page.getByLabel('Theme');
  const styles = await themeSelect.evaluate((element) => {
    const shell = document.querySelector('.relay-shell')!;
    const selectStyles = getComputedStyle(element);
    const shellStyles = getComputedStyle(shell);
    return {
      background: selectStyles.backgroundColor,
      color: selectStyles.color,
      tokenBackground: shellStyles.getPropertyValue('--bg').trim(),
      tokenColor: shellStyles.getPropertyValue('--ink').trim(),
    };
  });

  expect(styles.background).toBe('rgb(222, 218, 213)');
  expect(styles.color).toBe('rgb(14, 13, 12)');
  expect(styles.tokenBackground).toBe('#DEDAD5');
  expect(styles.tokenColor).toBe('#0E0D0C');
});

test('native concrete themes apply and quick light dark toggle works', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-light');

  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-dark');

  await page.getByLabel('Theme').selectOption('concrete-dim');
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-dim');

  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-light');
});

test('community theme quick toggle stays within the selected family', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();

  await page.getByLabel('Theme').selectOption('gruvbox-dark-medium');
  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'gruvbox-light');

  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'gruvbox-dark-hard');

  await page.getByLabel('Theme').selectOption('dracula');
  await expect(page.getByRole('button', { name: 'Light' })).toBeDisabled();
  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'dracula');
});

test('every documented community theme can be selected and persists', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();

  for (const theme of themes.filter((theme) => theme.group === 'Community')) {
    await page.getByLabel('Theme').selectOption(theme.id);
    await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', theme.id);
  }

  const lastCommunityTheme = themes.filter((theme) => theme.group === 'Community').at(-1);
  await page.reload();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', lastCommunityTheme?.id ?? '');
});

test('tasks layout remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 820 });
  await expect(page.getByRole('heading', { name: 'task board' })).toBeVisible();
  await expect(page.getByLabel('Task filters')).toBeVisible();
  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-002')).toBeVisible();

  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('button', { name: /Settings/ })).toBeVisible();
});

test('clicking a row opens task pane', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('heading', { name: 'block camera path for opening flythrough' })).toBeVisible();
  await page.screenshot({ path: 'test-results/relay-pane-open.png', fullPage: true });
});

test('subtask toggles update progress', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-002').click();
  await expect(page.getByTestId('pane-progress')).toHaveText('1/3');
  await page.getByTestId('subtask-task-002-b').check();
  await expect(page.getByTestId('pane-progress')).toHaveText('2/3');
  await expect(page.getByTestId('progress-task-002')).toContainText('2/3');
});

test('completing all subtasks marks task done and undo returns to wip', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-002').click();
  await page.getByTestId('subtask-task-002-b').check();
  await page.getByTestId('subtask-task-002-c').check();

  await expect(page.getByTestId('pane-progress')).toHaveText('3/3');
  await expect(page.getByTestId('task-pane')).toContainText('Done');
  await expect(page.getByTestId('group-done')).toContainText('block camera path for opening flythrough');

  await page.getByRole('button', { name: 'Undo to WIP' }).click();
  await expect(page.getByTestId('task-pane')).toContainText('WIP');
  await expect(page.getByTestId('group-wip')).toContainText('block camera path for opening flythrough');
});

test('checkboxes use Relay line and fill styling', async ({ page }) => {
  const checkbox = page.getByLabel('Complete assemble editorial review packet');
  await expect(checkbox).not.toBeChecked();
  const uncheckedStyles = await checkbox.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      appearance: styles.appearance,
      background: styles.backgroundColor,
      border: styles.borderTopColor,
    };
  });
  expect(uncheckedStyles.appearance).toBe('none');
  expect(uncheckedStyles.background).toBe('rgba(0, 0, 0, 0)');

  await checkbox.check();
  await expect(checkbox).toBeChecked();
  const checkedStyles = await checkbox.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      border: styles.borderTopColor,
    };
  });
  expect(checkedStyles.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(checkedStyles.border).toBe(checkedStyles.background);
});

test('seed people separate company role from permission level and remain editable by admin', async ({ page }) => {
  await page.getByRole('button', { name: /People/ }).click();
  await expect(page.getByTestId('people-permissions')).toBeVisible();
  await expect(page.getByTestId('people-permissions')).toContainText('James Green');
  await expect(page.getByTestId('people-permissions')).toContainText('Ben Hall');
  await expect(page.getByTestId('people-permissions')).toContainText('Harry Hughes');
  await expect(page.getByTestId('people-permissions')).toContainText('Tom Amrose');
  await expect(page.getByTestId('people-permissions')).toContainText('Aryaan Arora');
  await expect(page.getByTestId('people-permissions')).toContainText('Billy Towsend');
  await expect(page.getByLabel('Role for James Green')).toHaveValue('Admin');
  await expect(page.getByLabel('Permission level for James Green')).toHaveValue('Admin');
  await expect(page.getByLabel('Role for Ben Hall')).toHaveValue('Manager');
  await expect(page.getByLabel('Permission level for Ben Hall')).toHaveValue('Manager');
  await expect(page.getByLabel('Role for Harry Hughes')).toHaveValue('Manager');
  await expect(page.getByLabel('Role for Tom Amrose')).toHaveValue('Artist');
  await expect(page.getByLabel('Role for Aryaan Arora')).toHaveValue('Artist');
  await expect(page.getByLabel('Role for Billy Towsend')).toHaveValue('Artist');

  await page.getByLabel('Role for Billy Towsend').fill('Lead Artist');
  await page.getByLabel('Permission level for Billy Towsend').selectOption('Manager');
  await expect(page.getByLabel('Role for Billy Towsend')).toHaveValue('Lead Artist');
  await expect(page.getByLabel('Permission level for Billy Towsend')).toHaveValue('Manager');
  await expect(page.getByRole('button', { name: 'Add person' })).toBeEnabled();

  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Current user').selectOption('person-manager');
  await expect(page.getByRole('button', { name: /Settings/ })).toBeDisabled();
  await page.getByRole('button', { name: /People/ }).click();
  await expect(page.getByRole('button', { name: 'Add person' })).toBeDisabled();
  await expect(page.getByLabel('Role for James Green')).toBeDisabled();
  await expect(page.getByLabel('Permission level for James Green')).toBeDisabled();
});

test('client role cannot access restricted views', async ({ page }) => {
  await page.getByRole('button', { name: /People/ }).click();
  await page.getByLabel('Role for Billy Towsend').fill('Client Reviewer');
  await page.getByLabel('Permission level for Billy Towsend').selectOption('Client');
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Current user').selectOption('person-artist-c');

  await expect(page.getByRole('button', { name: /Tasks/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Allocation/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /People/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Settings/ })).toBeDisabled();
  await page.getByRole('button', { name: /Tasks/ }).click();
  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-002')).not.toBeVisible();
  await expect(page.getByTestId('task-row-task-004')).toBeVisible();
  await expect(page.locator('.sidebar')).not.toContainText('Permission level');
});

test('calendar starts collapsed and expands person rows on demand', async ({ page }) => {
  await page.getByRole('button', { name: /Allocation/ }).click();
  await expect(page.getByTestId('calendar-timeline')).toBeVisible();
  await expect(page.getByLabel('Team list')).not.toBeVisible();
  await expect(page.getByTestId('calendar-summary-row-person-manager')).toContainText('Ben Hall');
  await expect(page.getByTestId('calendar-project-row-person-manager-harbor-station')).not.toBeVisible();

  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-row-person-manager-harbor-station')).toBeVisible();
  await page.getByRole('button', { name: 'Collapse Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-row-person-manager-harbor-station')).not.toBeVisible();
});

test('calendar uses readable summary hours, faint separators, accent lines, and stacked utilization', async ({ page }) => {
  await page.getByRole('button', { name: /Allocation/ }).click();
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();

  const harborBand = page.getByTestId('calendar-project-cell-person-manager-harbor-station-2026-05-04').locator('.allocation-band');
  const northstarBand = page.getByTestId('calendar-project-cell-person-manager-northstar-ai-2026-05-05').locator('.allocation-band');
  await expect(harborBand).toBeVisible();
  await expect(northstarBand).toBeVisible();

  const colors = await Promise.all([
    harborBand.evaluate((element) => getComputedStyle(element).borderTopColor),
    northstarBand.evaluate((element) => getComputedStyle(element).borderTopColor),
  ]);
  expect(colors[0]).not.toBe(colors[1]);
  await expect(harborBand).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  const summaryStyles = await page.getByTestId('calendar-total-person-manager-2026-05-04').evaluate((element) => {
    const styles = getComputedStyle(element);
    const cellStyles = getComputedStyle(element.closest('.calendar-cell')!);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      borderRight: cellStyles.borderRightColor,
    };
  });
  expect(Number.parseFloat(summaryStyles.fontSize)).toBeGreaterThanOrEqual(10);
  expect(Number.parseInt(summaryStyles.fontWeight, 10)).toBeGreaterThanOrEqual(700);

  await page.getByLabel('Project').last().selectOption('atlas-print');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Hours').fill('4');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-utilization-person-manager-2026-05-05').locator('.utilization-segment')).toHaveCount(2);
});

test('calendar keeps person date selection, adds allocations per project, and attaches tasks', async ({ page }) => {
  await page.getByRole('button', { name: /Allocation/ }).click();
  await expect(page.getByTestId('calendar-timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await page.getByRole('button', { name: 'Expand Tom Amrose' }).click();

  await page.getByTestId('calendar-cell-person-manager-2026-05-04').click();
  await page.getByTestId('calendar-cell-person-manager-2026-05-06').click({ modifiers: ['Shift'] });
  await expect(page.getByTestId('selection-count')).toHaveText('3 selected');

  await page.getByTestId('calendar-cell-person-artist-a-2026-05-05').click({ modifiers: ['Control'] });
  await expect(page.getByTestId('selection-count')).toHaveText('4 selected');

  await page.getByLabel('Project').last().selectOption('atlas-print');
  await page.getByLabel('Hours').fill('5');
  await page.getByLabel('Status').last().selectOption('active');
  await page.getByRole('textbox', { name: 'Notes' }).fill('bulk allocation smoke test');
  await page.getByLabel('assemble editorial review packet').check();
  await expect(page.getByTestId('attached-task-count')).toHaveText('1 attached');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-total-person-manager-2026-05-04')).toHaveText('9h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-harbor-station-2026-05-04')).toContainText('HSF 4h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-atlas-print-2026-05-04')).toContainText('ATP 5h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-atlas-print-2026-05-06')).toContainText('ATP 5h');
  await expect(page.getByTestId('calendar-project-cell-person-artist-a-atlas-print-2026-05-05')).toContainText('ATP 5h');
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveClass(/is-over/);
  await expect(page.getByTestId('calendar-task-due-task-007')).toHaveText('2026-05-06');

  await page.getByRole('button', { name: /Tasks/ }).click();
  await expect(page.getByTestId('task-row-task-007')).toContainText('2026-05-06');
});
