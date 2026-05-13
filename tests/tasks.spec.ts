import { expect, test, type Page } from '@playwright/test';
import { themes } from '../src/themes';

test.beforeEach(async ({ page }) => {
  await page.goto('/tasks');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function openCalendar(page: Page, mode: 'Allocation' | 'Time Off' | 'Milestones' = 'Allocation') {
  await page.getByRole('button', { name: /Calendar/ }).click();
  await page.getByRole('button', { name: mode, exact: true }).click();
}

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

  await openCalendar(page, 'Allocation');
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
  await expect(page.getByRole('button', { name: /Calendar/ })).toBeDisabled();
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

test('primary navigation order exposes one calendar entry', async ({ page }) => {
  const labels = await page.locator('.sidebar section').first().getByRole('button').evaluateAll((buttons) =>
    buttons.map((button) => button.querySelector('span')?.textContent?.trim()),
  );

  expect(labels).toEqual([
    'Projects',
    'Calendar',
    'Tasks',
    'Bidding',
    'Archive',
    'Documentation',
    'People',
    'Settings',
  ]);
});

test('collapsed sidebar icons switch views without expanding and arrow remains visible', async ({ page }) => {
  await page.getByRole('button', { name: 'Collapse navigation' }).click();
  await expect(page.locator('.relay-shell')).toHaveClass(/is-sidebar-collapsed/);

  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await expect(page).toHaveURL(/\/calendar\?mode=allocation$/);
  await expect(page.locator('.relay-shell')).toHaveClass(/is-sidebar-collapsed/);

  const arrowBox = await page.getByRole('button', { name: 'Expand navigation' }).boundingBox();
  expect(arrowBox).not.toBeNull();
  expect(arrowBox!.x).toBeGreaterThanOrEqual(0);
  expect(arrowBox!.y).toBeGreaterThanOrEqual(0);

  await page.getByRole('button', { name: 'Expand navigation' }).click();
  await expect(page.locator('.relay-shell')).not.toHaveClass(/is-sidebar-collapsed/);
});

test('calendar route aliases select the matching mode', async ({ page }) => {
  await page.goto('/allocation');
  await expect(page).toHaveURL(/\/calendar\?mode=allocation$/);
  await expect(page.getByRole('button', { name: 'Allocation', exact: true })).toHaveClass(/is-active/);

  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/calendar\?mode=time-off$/);
  await expect(page.getByRole('button', { name: 'Time Off', exact: true })).toHaveClass(/is-active/);
  await expect(page.getByLabel('Time Off editor')).toBeVisible();

  await page.goto('/goals');
  await expect(page).toHaveURL(/\/calendar\?mode=milestones$/);
  await expect(page.getByRole('button', { name: 'Milestones', exact: true })).toHaveClass(/is-active/);
  await expect(page.getByLabel('Milestones editor')).toBeVisible();
});

test('time off creates pending holiday and sick leave marks and resets on reload', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByLabel('Time off type').selectOption('holiday');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();

  await page.getByLabel('Time off type').selectOption('sick-leave');
  await page.getByTestId('calendar-cell-person-manager-2026-05-06').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();

  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05').getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-06').getByTestId(/time-off-overlay-sick-leave-pending/)).toBeVisible();

  await page.reload();
  await page.getByLabel('Time off date').fill('2026-05-05');
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(0);
});

test('time off creates full-day marks and updates selected entries to hourly ranges', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();

  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Time off type').selectOption('sick-leave');
  await page.getByRole('button', { name: 'Hourly' }).click();
  await page.getByLabel('Time off start time').selectOption(String(10 * 60));
  await page.getByLabel('Time off end time').selectOption(String(12 * 60));
  await page.getByRole('button', { name: 'Update time off' }).click();

  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(0);
  await expect(page.getByTestId(/time-off-overlay-sick-leave-pending/)).toBeVisible();
});

test('artist time off starts pending and managers can confirm or revert time off', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('relay:current-person', 'person-artist-a'));
  await page.reload();
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-artist-a-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();
  const pendingStyles = await page.getByTestId(/time-off-overlay-holiday-pending/).evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return { backgroundImage: styles.backgroundImage, opacity: styles.opacity };
  });
  const pendingPattern = pendingStyles.backgroundImage;
  expect(pendingPattern).toContain('repeating-linear-gradient');
  expect(pendingPattern).toContain('-45deg');
  expect(Number(pendingStyles.opacity)).toBeLessThan(1);

  await page.evaluate(() => localStorage.setItem('relay:current-person', 'person-manager'));
  await page.reload();
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();
  await page.getByTestId(/time-off-overlay-holiday-pending/).click();
  await expect(page.getByTestId('time-off-selection-count')).toHaveText('1 selected');
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Revert to pending' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-confirmed/)).toBeVisible();
  const confirmedCompactStyles = await page.getByTestId(/time-off-overlay-holiday-confirmed/).evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    const box = element.getBoundingClientRect();
    const parent = element.parentElement!.getBoundingClientRect();
    return { backgroundImage: styles.backgroundImage, height: box.height, opacity: styles.opacity, parentHeight: parent.height };
  });
  const confirmedCompactPattern = confirmedCompactStyles.backgroundImage;
  expect(confirmedCompactPattern).toContain('repeating-linear-gradient');
  expect(confirmedCompactPattern).toContain('-45deg');
  expect(Number(confirmedCompactStyles.opacity)).toBe(1);
  expect(confirmedCompactStyles.height).toBeGreaterThan(confirmedCompactStyles.parentHeight * 0.9);
  expect(confirmedCompactPattern).not.toBe(pendingPattern);
  await page.getByTestId(/time-off-overlay-holiday-confirmed/).first().click();
  await page.getByRole('button', { name: 'Revert to pending' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Revert to pending' })).toHaveCount(0);
  await page.getByTestId(/time-off-overlay-holiday-pending/).first().click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-confirmed/)).toBeVisible();
});

test('time off blocks overlapping ranges and allows non-overlapping ranges', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByRole('button', { name: 'Hourly' }).click();
  await page.getByLabel('Time off start time').selectOption(String(9 * 60));
  await page.getByLabel('Time off end time').selectOption(String(12 * 60));
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();

  await page.getByLabel('Time off start time').selectOption(String(13 * 60));
  await page.getByLabel('Time off end time').selectOption(String(14 * 60));
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(2);

  await page.getByTestId(/time-off-overlay-holiday-pending/).nth(1).click();
  await page.getByLabel('Time off start time').selectOption(String(11 * 60));
  await page.getByLabel('Time off end time').selectOption(String(13 * 60));
  await page.getByRole('button', { name: 'Update time off' }).click();
  await expect(page.getByRole('alert')).toContainText('overlaps an existing time off');
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(2);
});

test('calendar date arrows move by active view unit', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-13');
  const navBoxes = await page.locator('.calendar-nav-row').evaluate((row) => {
    const [previous, input, next] = Array.from(row.children).map((child) => child.getBoundingClientRect());
    return {
      centers: [previous, input, next].map((box) => box.top + box.height / 2),
      heights: [previous.height, input.height, next.height],
    };
  });
  expect(new Set(navBoxes.heights.map((height) => Math.round(height))).size).toBe(1);
  expect(Math.max(...navBoxes.centers) - Math.min(...navBoxes.centers)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Previous week' }).click();
  await expect(page.getByLabel('Selected date')).toHaveValue('2026-05-06');
  await page.getByRole('button', { name: 'day' }).click();
  await page.getByRole('button', { name: 'Next day' }).click();
  await expect(page.getByLabel('Selected date')).toHaveValue('2026-05-07');

  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-13');
  await page.getByRole('button', { name: 'month' }).click();
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByLabel('Time off date')).toHaveValue('2026-06-13');
  await page.getByRole('button', { name: 'year' }).click();
  await page.getByRole('button', { name: 'Previous year' }).click();
  await expect(page.getByLabel('Time off date')).toHaveValue('2025-06-13');
});

test('calendar overlay defaults live in settings and active mode overlay is forced on', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.locator('.calendar-overlay-settings').getByLabel('Time Off').uncheck();
  await page.reload();
  await expect(page.locator('.calendar-overlay-settings').getByLabel('Time Off')).not.toBeChecked();

  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();

  await page.getByRole('button', { name: 'Allocation', exact: true }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(0);

  await page.getByRole('button', { name: /Settings/ }).click();
  await page.locator('.calendar-overlay-settings').getByLabel('Time Off').check();
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toBeVisible();
});

test('day view padding settings persist and drive the focused day scale', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await expect(page.getByLabel('Day past padding')).toHaveValue('2');
  await expect(page.getByLabel('Day upcoming padding')).toHaveValue('10');
  await page.getByLabel('Day past padding').fill('1');
  await page.getByLabel('Day upcoming padding').fill('8');
  await page.reload();
  await expect(page.getByLabel('Day past padding')).toHaveValue('1');
  await expect(page.getByLabel('Day upcoming padding')).toHaveValue('8');

  await openCalendar(page, 'Allocation');
  await page.getByRole('button', { name: 'day' }).click();
  await page.getByLabel('Selected date').fill('2026-05-14');
  await expect(page.locator('.day-scale')).toContainText('09:00');
  await expect(page.locator('.day-scale')).not.toContainText('22:00');
});

test('time off visibility follows permission level', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await expect(page.getByTestId('calendar-summary-row-person-manager')).toContainText('Ben Hall');
  await expect(page.getByTestId('calendar-summary-row-person-artist-a')).toContainText('Tom Amrose');

  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Current user').selectOption('person-artist-a');
  await openCalendar(page, 'Time Off');
  await expect(page.getByTestId('calendar-summary-row-person-artist-a')).toContainText('Tom Amrose');
  await expect(page.getByTestId('calendar-summary-row-person-manager')).toHaveCount(0);
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
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
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

test('allocation add button creates an empty selectable project row', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByRole('button', { name: 'Add project row for Ben Hall' }).click();
  await page.getByRole('button', { name: 'Pick project' }).click();
  await page.getByRole('button', { name: 'Bexsero Retouch Project' }).click();

  await expect(page.getByTestId('calendar-project-row-person-manager-bexsero-retouch-project')).toBeVisible();
  await page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').click();
  await expect(page.getByLabel('Project').last()).toHaveValue('bexsero-retouch-project');
  await page.getByLabel('Start time 1').fill('11:00');
  await page.getByLabel('End time 1').fill('13:00');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('2h');
});

test('calendar uses proportional summary fills without numeric hour totals', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();

  const novartisBand = page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04').locator('.allocation-band');
  const area23Band = page.getByTestId('calendar-project-cell-person-manager-area23-projectj-toleb-2026-05-05').locator('.allocation-band');
  await expect(novartisBand).toBeVisible();
  await expect(area23Band).toBeVisible();
  await expect(novartisBand).toContainText('4h');
  await expect(novartisBand).not.toContainText('Novartis Novartis');

  const colors = await Promise.all([
    novartisBand.evaluate((element) => getComputedStyle(element).borderTopColor),
    area23Band.evaluate((element) => getComputedStyle(element).borderTopColor),
  ]);
  expect(colors[0]).not.toBe(colors[1]);
  await expect(novartisBand).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  const summaryStyles = await page.getByTestId('calendar-cell-person-manager-2026-05-04').evaluate((element) => {
    const cellStyles = getComputedStyle(element);
    const utilization = element.querySelector('.utilization-stack')!;
    return {
      borderRight: cellStyles.borderRightColor,
      text: element.textContent?.trim(),
      utilizationWidth: getComputedStyle(utilization).width,
    };
  });
  expect(summaryStyles.text).toBe('');
  expect(Number.parseFloat(summaryStyles.utilizationWidth)).toBeGreaterThan(20);
  const timelineOverflow = await page.getByTestId('calendar-timeline').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(timelineOverflow.scrollWidth).toBeLessThanOrEqual(timelineOverflow.clientWidth + 1);

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Duration 1').fill('4');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-utilization-person-manager-2026-05-05').locator('.utilization-segment')).toHaveCount(2);
});

test('allocation layers neutral past, red overbooking, and time off overlays without changing totals', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByLabel('Time off type').selectOption('holiday');
  await page.getByRole('button', { name: 'Hourly' }).click();
  await page.getByLabel('Time off start time').selectOption('0');
  await page.getByLabel('Time off end time').selectOption(String(12 * 60));
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await page.getByLabel('Time off type').selectOption('sick-leave');
  await page.getByLabel('Time off start time').selectOption(String(13 * 60));
  await page.getByLabel('Time off end time').selectOption(String(14 * 60));
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await page.getByTestId(/time-off-overlay-holiday-pending/).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByTestId(/time-off-overlay-sick-leave-pending/).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05')).toHaveAttribute('aria-label', /5h allocated/);
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05')).not.toHaveClass(/is-over/);

  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Duration 1').fill('4');
  await page.getByRole('button', { name: 'Apply allocation' }).click();
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05')).toHaveAttribute('aria-label', /9h allocated/);
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05')).toHaveClass(/is-over/);

  await expect(page.getByTestId('time-off-overlay-holiday-confirmed-person-manager-2026-05-05')).toBeVisible();
  await expect(page.getByTestId('time-off-overlay-sick-leave-confirmed-person-manager-2026-05-05')).toBeVisible();

  const styles = await page.getByTestId('calendar-cell-person-manager-2026-05-05').evaluate((element) => {
    const over = getComputedStyle(element, '::after').backgroundImage;
    const overZ = getComputedStyle(element, '::after').zIndex;
    const holiday = getComputedStyle(element.querySelector('.booking-holiday')!, '::before').backgroundImage;
    const sickLeave = getComputedStyle(element.querySelector('.booking-sick-leave')!, '::before').backgroundImage;
    const selection = getComputedStyle(element, '::before');
    const utilizationZ = getComputedStyle(element.querySelector('.utilization-stack')!).zIndex;
    const timeOffZ = getComputedStyle(element.querySelector('.time-off-overlay')!).zIndex;
    return { holiday, over, overZ, selectionBackground: selection.backgroundColor, selectionPattern: selection.backgroundImage, sickLeave, timeOffZ, utilizationZ };
  });
  expect(styles.over).toContain('-45deg');
  expect(styles.holiday).toContain('repeating-linear-gradient');
  expect(styles.holiday).toContain('-45deg');
  expect(styles.sickLeave).toContain('repeating-linear-gradient');
  expect(styles.sickLeave).toContain('-45deg');
  expect(styles.selectionPattern).toBe('none');
  expect(styles.selectionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(Number(styles.utilizationZ)).toBeGreaterThanOrEqual(1);
  expect(Number(styles.overZ)).toBeLessThan(Number(styles.utilizationZ));
  expect(Number(styles.timeOffZ)).toBeGreaterThan(Number(styles.utilizationZ));

  await page.getByTestId('calendar-cell-person-manager-2026-05-05').hover();
  const hoverStyles = await page.getByTestId('calendar-cell-person-manager-2026-05-05').evaluate((element) => {
    const wash = getComputedStyle(element, '::before');
    const timeOff = getComputedStyle(element.querySelector('.time-off-overlay')!, '::before');
    return { timeOffImage: timeOff.backgroundImage, washBackground: wash.backgroundColor, washPattern: wash.backgroundImage };
  });
  expect(hoverStyles.washPattern).toBe('none');
  expect(hoverStyles.washBackground).not.toBe(styles.selectionBackground);
  expect(hoverStyles.timeOffImage).toContain('repeating-linear-gradient');

  const gridStripeBackground = await page.getByTestId('calendar-cell-person-manager-2026-05-04').evaluate((element) => {
    const grid = element.closest('.calendar-grid')!;
    return getComputedStyle(grid, '::before').backgroundImage;
  });
  expect(gridStripeBackground).toContain('-45deg');
});

test('calendar keeps person date selection, adds timed segments per project, and attaches tasks', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await expect(page.getByTestId('calendar-timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await page.getByRole('button', { name: 'Expand Tom Amrose' }).click();

  await page.getByTestId('calendar-cell-person-manager-2026-05-04').click();
  await page.getByTestId('calendar-cell-person-manager-2026-05-06').click({ modifiers: ['Shift'] });
  await expect(page.getByTestId('selection-count')).toHaveCount(0);

  await page.getByTestId('calendar-cell-person-artist-a-2026-05-05').click({ modifiers: ['Control'] });
  await expect(page.getByTestId('selection-count')).toHaveCount(0);

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByLabel('Start time 1').fill('09:00');
  await page.getByLabel('Duration 1').fill('5');
  await page.getByLabel('Status').last().selectOption('active');
  await page.getByRole('textbox', { name: 'Notes' }).fill('bulk allocation smoke test');
  await page.getByLabel('Photoshop retouch working files').check();
  await expect(page.getByTestId('attached-task-count')).toHaveText('1 attached');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveAttribute('aria-label', /9h allocated/);
  await expect(page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04')).toContainText('4h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).toContainText('5h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('5h');
  await expect(page.getByTestId('calendar-project-cell-person-artist-a-bexsero-retouch-project-2026-05-05')).toContainText('5h');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).not.toContainText('Bexsero Retouch Project');
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).not.toContainText('BEXRET');
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveClass(/is-over/);
  await expect(page.getByTestId('calendar-task-due-task-bexsero-retouch')).toHaveText('2026-05-06');

  await page.getByRole('button', { name: /Tasks/ }).click();
  await expect(page.getByTestId('task-row-task-bexsero-retouch')).toContainText('2026-05-06');
});

test('selected cells can append multiple timed segments to week cells', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-manager-2026-05-06').click();
  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByLabel('Start time 1').fill('09:00');
  await page.getByLabel('End time 1').fill('10:30');
  await page.getByRole('button', { name: 'Add segment' }).click();
  await page.getByLabel('Start time 2').fill('14:00');
  await page.getByLabel('End time 2').fill('15:15');
  await expect(page.getByTestId('selected-time-total')).toHaveCount(0);
  await page.getByRole('button', { name: 'Apply allocation' }).click();
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').locator('.allocation-band')).toHaveText(['1.5h', '1.25h']);
  await expect(page.getByTestId('calendar-utilization-person-manager-2026-05-06').locator('.utilization-segment')).toHaveCount(2);
});

test('selecting an allocated project cell loads all segments and replaces that cell', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await page.getByRole('button', { name: 'Add project row for Ben Hall' }).click();
  await page.getByRole('button', { name: 'Pick project' }).click();
  await page.getByRole('button', { name: 'Bexsero Retouch Project' }).click();

  await page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').click();
  await page.getByLabel('Start time 1').fill('09:00');
  await page.getByLabel('End time 1').fill('10:30');
  await page.getByRole('button', { name: 'Add segment' }).click();
  await page.getByLabel('Start time 2').fill('14:00');
  await page.getByLabel('End time 2').fill('15:15');
  await page.getByRole('button', { name: 'Apply allocation' }).click();
  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').locator('.allocation-band')).toHaveText(['1.5h', '1.25h']);

  await page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').click();
  await expect(page.getByTestId('allocation-editor-mode')).toHaveCount(0);
  await expect(page.getByTestId('segment-editor-row-0')).toBeVisible();
  await expect(page.getByTestId('segment-editor-row-1')).toBeVisible();
  await page.getByTestId('segment-editor-row-1').getByRole('button', { name: 'Delete' }).click();
  await page.getByLabel('Duration 1').fill('1');
  await page.getByRole('button', { name: 'Replace allocation' }).click();

  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('1h');
  await expect(page.getByTestId('calendar-utilization-person-manager-2026-05-06').locator('.utilization-segment')).toHaveCount(1);
});

test('day view supports snapped block creation, timezone marker, context delete, and pane sync', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Timezone').fill('UTC');
  await openCalendar(page, 'Allocation');
  await page.getByRole('button', { name: 'day' }).click();
  await page.getByLabel('Selected date').fill('2026-05-13');
  await expect(page.getByTestId('current-time-marker').first()).toBeVisible();
  await page.getByLabel('Selected date').fill('2026-05-14');

  const row = page.getByTestId('day-row-person-manager-2026-05-14');
  const box = await row.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 1, box!.y + 20);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.125, box!.y + 20);
  await page.mouse.up();

  const block = page.locator('[data-testid^="allocation-block-alloc-local-"]').last();
  await expect(block).toBeVisible();
  await expect(page.getByLabel('Start time 1')).toHaveValue('09:00');
  await expect(page.getByLabel('End time 1')).toHaveValue('10:30');

  await block.click({ button: 'right' });
  await expect(page.getByTestId('allocation-context-menu')).toBeVisible();
  await page.getByTestId('allocation-context-menu').getByRole('button', { name: 'Delete' }).click();
  await expect(block).not.toBeVisible();
});
