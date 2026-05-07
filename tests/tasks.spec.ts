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
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).toContainText('3D pass SH_09');
  await page.screenshot({ path: 'test-results/relay-table-only.png', fullPage: true });
});

test('user filter is first, defaults to current user, and seeded work is visible', async ({ page }) => {
  const filterLabels = await page.locator('.filters label').evaluateAll((labels) =>
    labels.map((label) => label.childNodes[0]?.textContent?.trim()),
  );
  expect(filterLabels[0]).toBe('User');
  await expect(page.getByLabel('User')).toHaveValue('James Green');
  await expect(page.getByTestId('task-row-task-novartis-ai')).toBeVisible();
  await expect(page.getByTestId('task-row-task-bexsero-retouch')).toBeVisible();
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).not.toBeVisible();

  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).toBeVisible();
});

test('filters narrow visible rows', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByLabel('Status').selectOption('review');
  await expect(page.getByTestId('task-row-task-novartis-comp-sh-09')).toBeVisible();
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).not.toBeVisible();

  await page.getByLabel('Search').fill('comp script');
  await expect(page.getByTestId('task-row-task-novartis-comp-sh-09')).toBeVisible();

  await page.getByLabel('Search').fill('Photoshop');
  await expect(page.getByTestId('task-row-task-novartis-comp-sh-09')).not.toBeVisible();
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

  expect(styles.background).toBe('rgb(34, 33, 32)');
  expect(styles.color).toBe('rgb(232, 230, 226)');
  expect(styles.tokenBackground).toBe('#222120');
  expect(styles.tokenColor).toBe('#E8E6E2');
});

test('native concrete themes apply and quick light dark toggle works', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  const quickToggle = page.getByTestId('theme-quick-toggle');
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-dim');

  await quickToggle.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-dark');

  await page.getByLabel('Theme').selectOption('concrete-dim');
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-dim');

  await quickToggle.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'concrete-light');
});

test('community theme quick toggle stays within the selected family', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  const quickToggle = page.getByTestId('theme-quick-toggle');

  await page.getByLabel('Theme').selectOption('gruvbox-dark-medium');
  await quickToggle.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'gruvbox-light');

  await quickToggle.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('.relay-shell')).toHaveAttribute('data-theme', 'gruvbox-dark-hard');

  await page.getByLabel('Theme').selectOption('dracula');
  await expect(quickToggle.getByRole('button', { name: 'Light' })).toBeDisabled();
  await quickToggle.getByRole('button', { name: 'Dark' }).click();
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

test('main accent offers six theme-scoped colors and persists the selected slot', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await expect(page.locator('.accent-swatch-grid button')).toHaveCount(6);
  await page.getByRole('button', { name: 'Use Warm accent', exact: true }).click();

  const activeColor = await page.locator('.relay-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-active').trim());
  expect(activeColor).toBe('#E84020');

  await page.getByLabel('Theme').selectOption('dracula');
  const draculaWarmColor = await page.locator('.relay-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-active').trim());
  expect(draculaWarmColor).toBe('#ff5555');

  await page.reload();
  const persistedColor = await page.locator('.relay-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-active').trim());
  expect(persistedColor).toBe('#ff5555');
});

test('Alongside logo appears in the header with RELAY accessibility fallback', async ({ page }) => {
  const logo = page.getByRole('img', { name: 'Alongside Global' });
  await expect(logo).toBeVisible();
  await expect(page.getByRole('button', { name: /Alongside Global RELAY/ })).toBeVisible();
  await expect(logo.locator('svg')).toBeVisible();
  const logoBox = await logo.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { height: box.height, width: box.width };
  });
  expect(logoBox.width).toBeGreaterThan(0);
  expect(logoBox.height).toBeGreaterThan(0);
});

test('projects are grouped under collapsible studio sections', async ({ page }) => {
  await page.getByRole('button', { name: 'Projects', exact: true }).click();

  for (const studioId of ['bonfire', 'saddington-baynes', 'sombra-labs', 'hero-next-door', 'organs']) {
    await expect(page.getByTestId(`studio-group-${studioId}`)).toBeVisible();
  }

  await expect(page.getByTestId('studio-group-bonfire')).toContainText('16 projects');
  await expect(page.getByTestId('studio-projects-bonfire')).not.toBeVisible();
  await page.getByTestId('studio-toggle-bonfire').click();
  await expect(page.getByTestId('project-row-novartis-novartis')).toBeVisible();
  await expect(page.getByTestId('project-row-novartis-novartis')).toContainText('Novartis Novartis');
  await expect(page.getByTestId('project-row-novartis-novartis')).not.toContainText('NOV45');
  await expect(page.getByTestId('studio-group-bonfire')).toContainText('Photoshop');
  await expect(page.getByTestId('studio-group-bonfire')).not.toContainText('Harbor Station Launch Film');
});

test('creating a project generates internal code and places the selected studio', async ({ page }) => {
  await page.getByRole('button', { name: 'Projects', exact: true }).click();

  await page.locator('.add-project').getByLabel('Name').fill('Signal Field Tests');
  await expect(page.locator('.add-project').getByLabel('Code')).toHaveCount(0);
  await page.locator('.add-project').getByLabel('Studio').selectOption('hero-next-door');
  await page.getByRole('button', { name: 'Add project' }).click();

  await expect(page.getByTestId('studio-group-hero-next-door')).toContainText('1 projects');
  await page.getByTestId('studio-toggle-hero-next-door').click();
  await expect(page.getByTestId('studio-group-hero-next-door')).toContainText('Signal Field Tests');
  await expect(page.getByTestId('studio-group-hero-next-door')).not.toContainText('SFT');
  await expect(page.getByTestId('project-row-signal-field-tests-17')).toBeVisible();
  await expect(page.getByLabel('Project metadata').getByLabel('Studio')).toHaveValue('hero-next-door');

  await page.getByRole('button', { name: /Tasks/ }).click();
  await expect(page.getByLabel('Project')).toContainText('Signal Field Tests');

  await page.getByRole('button', { name: /Allocation/ }).click();
  await expect(page.getByLabel('Project').last()).toContainText('Signal Field Tests');
});

test('studio SVG logos stay visible in light and dark themes', async ({ page }) => {
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.studio-logo')).toHaveCount(5);
  await page.getByTestId('studio-toggle-bonfire').click();

  const lightLogo = await page.locator('.studio-logo').first().evaluate((element) => {
    const box = element.getBoundingClientRect();
    const styles = getComputedStyle(element);
    const hiddenWhitePaths = [...element.querySelectorAll('.cls-1')].filter((child) => getComputedStyle(child).display === 'none').length;
    return { color: styles.color, height: box.height, hiddenWhitePaths, svgCount: element.querySelectorAll('svg').length, width: box.width };
  });
  expect(lightLogo.svgCount).toBe(1);
  expect(lightLogo.hiddenWhitePaths).toBeGreaterThan(0);
  expect(lightLogo.width).toBeGreaterThan(0);
  expect(lightLogo.height).toBeGreaterThan(0);

  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByTestId('theme-quick-toggle').getByRole('button', { name: 'Dark' }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  const darkLogo = await page.locator('.studio-logo').first().evaluate((element) => {
    const box = element.getBoundingClientRect();
    const styles = getComputedStyle(element);
    const hiddenWhitePaths = [...element.querySelectorAll('.cls-1')].filter((child) => getComputedStyle(child).display === 'none').length;
    return { color: styles.color, height: box.height, hiddenWhitePaths, svgCount: element.querySelectorAll('svg').length, width: box.width };
  });
  expect(darkLogo.svgCount).toBe(1);
  expect(darkLogo.hiddenWhitePaths).toBeGreaterThan(0);
  expect(darkLogo.color).not.toBe(lightLogo.color);
  expect(darkLogo.width).toBeGreaterThan(0);
  expect(darkLogo.height).toBeGreaterThan(0);

  const normalizedLogos = await page.locator('.studio-logo[data-logo="sombra-labs"], .studio-logo[data-logo="hero-next-door"]').evaluateAll((logos) =>
    logos.map((element) => {
      const box = element.getBoundingClientRect();
      const svg = element.querySelector('svg');
      return { height: box.height, logo: element.getAttribute('data-logo'), viewBox: svg?.getAttribute('viewBox') };
    }),
  );
  expect(normalizedLogos).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ height: 44, logo: 'sombra-labs', viewBox: '39 136 422 229' }),
      expect.objectContaining({ height: 44, logo: 'hero-next-door' }),
    ]),
  );
});

test('tasks layout remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 820 });
  await expect(page.getByRole('heading', { name: 'task board' })).toBeVisible();
  await expect(page.getByLabel('Task filters')).toBeVisible();
  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).toBeVisible();

  await page.getByTestId('task-row-task-novartis-3d-sh-09').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('button', { name: /Settings/ })).toBeVisible();
});

test('clicking a row opens task pane', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-novartis-3d-sh-09').click();
  await expect(page.getByTestId('task-pane')).toHaveClass(/is-open/);
  await expect(page.getByRole('heading', { name: '3D pass SH_09' })).toBeVisible();
  await page.screenshot({ path: 'test-results/relay-pane-open.png', fullPage: true });
});

test('subtask toggles update progress', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-novartis-3d-sh-09').click();
  await expect(page.getByTestId('pane-progress')).toHaveText('1/3');
  await page.getByTestId('subtask-task-novartis-3d-sh-09-b').check();
  await expect(page.getByTestId('pane-progress')).toHaveText('2/3');
  await expect(page.getByTestId('progress-task-novartis-3d-sh-09')).toContainText('2/3');
});

test('completing all subtasks marks task done and undo returns to wip', async ({ page }) => {
  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-novartis-3d-sh-09').click();
  await page.getByTestId('subtask-task-novartis-3d-sh-09-b').check();
  await page.getByTestId('subtask-task-novartis-3d-sh-09-c').check();

  await expect(page.getByTestId('pane-progress')).toHaveText('3/3');
  await expect(page.getByTestId('task-pane')).toContainText('Done');
  await expect(page.getByTestId('group-done')).toContainText('3D pass SH_09');

  await page.getByRole('button', { name: 'Undo to WIP' }).click();
  await expect(page.getByTestId('task-pane')).toContainText('WIP');
  await expect(page.getByTestId('group-wip')).toContainText('3D pass SH_09');
});

test('checkboxes use Relay line and fill styling', async ({ page }) => {
  const checkbox = page.getByLabel('Complete AI exploration');
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
  await expect(page.getByRole('button', { name: /Documentation/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Allocation/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Bidding/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /People/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Settings/ })).toBeDisabled();
  await page.getByRole('button', { name: /Tasks/ }).click();
  await page.getByLabel('User').selectOption('all');
  await expect(page.getByTestId('task-row-task-novartis-3d-sh-09')).not.toBeVisible();
  await expect(page.getByTestId('task-row-task-novartis-comp-sh-09')).toBeVisible();
  await expect(page.locator('.sidebar')).not.toContainText('Permission level');
});

test('bidding appears in nav and renders placeholder view', async ({ page }) => {
  await page.getByRole('button', { name: /Bidding/ }).click();
  await expect(page).toHaveURL(/\/bidding$/);
  await expect(page.getByRole('heading', { name: 'bidding' })).toBeVisible();
});

test('documentation view browses bundled markdown and resolves wiki links', async ({ page }) => {
  await page.goto('/documentation');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole('heading', { name: 'documentation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to Relay' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Projects and Tasks/ })).toBeVisible();
  await expect(page.locator('.documentation-browser').getByRole('button', { name: 'Task Board' })).not.toBeVisible();
  await page.getByRole('button', { name: /Projects and Tasks/ }).click();
  await expect(page.locator('.documentation-browser').getByRole('button', { name: 'Task Board' })).toBeVisible();

  await page.getByTestId('documentation-reader').getByRole('button', { name: 'Task Board' }).click();
  await expect(page.getByRole('heading', { name: 'Task Board' })).toBeVisible();
  await expect(page.getByTestId('documentation-reader')).toContainText('The task board is the main place to inspect and update work.');

  await page.getByTestId('documentation-reader').getByRole('button', { name: 'Archive and Restore' }).click();
  await expect(page.getByRole('heading', { name: 'Archive and Restore' })).toBeVisible();
});

test('archive project rows use full project names without visible codes', async ({ page }) => {
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByTestId('studio-toggle-bonfire').click();
  await page.getByTestId('project-row-novartis-novartis').click();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Archive project' }).click();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toContainText('Novartis Novartis');
  await expect(page.getByTestId('archive-project-novartis-novartis')).not.toContainText('NOV45');
});

test('calendar starts collapsed and expands person rows on demand', async ({ page }) => {
  await page.getByRole('button', { name: /Allocation/ }).click();
  await expect(page.getByTestId('calendar-timeline')).toBeVisible();
  await expect(page.getByLabel('Team list')).not.toBeVisible();
  await expect(page.getByTestId('calendar-summary-row-person-manager')).toContainText('Ben Hall');
  await expect(page.getByTestId('calendar-project-row-person-manager-novartis-novartis')).not.toBeVisible();

  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-row-person-manager-novartis-novartis')).toBeVisible();
  await expect(page.getByTestId('calendar-project-row-person-manager-novartis-novartis')).toContainText('Novartis Novartis');
  await expect(page.getByTestId('calendar-project-row-person-manager-novartis-novartis')).not.toContainText('NOV45');
  await page.getByRole('button', { name: 'Collapse Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-row-person-manager-novartis-novartis')).not.toBeVisible();
});

test('calendar uses readable summary hours, faint separators, accent lines, and stacked utilization', async ({ page }) => {
  await page.getByRole('button', { name: /Allocation/ }).click();
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();

  const novartisBand = page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04').locator('.allocation-band');
  const area23Band = page.getByTestId('calendar-project-cell-person-manager-area23-projectj-toleb-2026-05-05').locator('.allocation-band');
  await expect(novartisBand).toBeVisible();
  await expect(area23Band).toBeVisible();

  const colors = await Promise.all([
    novartisBand.evaluate((element) => getComputedStyle(element).borderTopColor),
    area23Band.evaluate((element) => getComputedStyle(element).borderTopColor),
  ]);
  expect(colors[0]).not.toBe(colors[1]);
  await expect(novartisBand).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

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

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
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

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByLabel('Hours').fill('5');
  await page.getByLabel('Status').last().selectOption('active');
  await page.getByRole('textbox', { name: 'Notes' }).fill('bulk allocation smoke test');
  await page.getByLabel('Photoshop retouch working files').check();
  await expect(page.getByTestId('attached-task-count')).toHaveText('1 attached');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-total-person-manager-2026-05-04')).toHaveText('9h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04')).toContainText('Novartis Novartis 4h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).toContainText('Bexsero Retouch Project 5h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('Bexsero Retouch Project 5h');
  await expect(page.getByTestId('calendar-project-cell-person-artist-a-bexsero-retouch-project-2026-05-05')).toContainText('Bexsero Retouch Project 5h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).not.toContainText('BEXRET');
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveClass(/is-over/);
  await expect(page.getByTestId('calendar-task-due-task-bexsero-retouch')).toHaveText('2026-05-06');

  await page.getByRole('button', { name: /Tasks/ }).click();
  await expect(page.getByTestId('task-row-task-bexsero-retouch')).toContainText('2026-05-06');
});
