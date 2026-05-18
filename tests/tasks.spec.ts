import { expect, test, type Page } from '@playwright/test';
import { themes } from '../src/themes';

test.beforeEach(async ({ page }) => {
  await page.goto('/deliverables');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('deliverables route is canonical and tasks remains a compatibility alias', async ({ page }) => {
  await expect(page).toHaveURL(/\/deliverables$/);
  await expect(page.getByRole('heading', { name: 'deliverables board' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Deliverables/ })).toBeVisible();

  await page.goto('/tasks');
  await expect(page.getByRole('heading', { name: 'deliverables board' })).toBeVisible();
  await expect(page).toHaveURL(/\/deliverables$/);
});

async function openCalendar(page: Page, mode: 'Allocation' | 'Time Off' | 'Milestones' = 'Allocation') {
  await page.getByRole('button', { name: /Calendar/ }).click();
  await page.getByRole('button', { name: mode, exact: true }).click();
}

async function canvasPixelStats(page: Page, testId = 'archive-graph-canvas') {
  return page.getByTestId(testId).evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement;
    const context = element.getContext('2d')!;
    const { data } = context.getImageData(0, 0, element.width, element.height);
    let painted = 0;
    let red = 0;
    let green = 0;
    let blue = 0;
    for (let index = 0; index < data.length; index += 16) {
      if (data[index + 3] > 0) {
        painted += 1;
        red += data[index];
        green += data[index + 1];
        blue += data[index + 2];
      }
    }
    return { painted, red, green, blue };
  });
}

async function clickVisibleGraphNode(page: Page) {
  const canvas = page.getByTestId('archive-graph-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const positions = [
    [0.47, 0.74],
    [0.5, 0.5],
    [0.42, 0.42],
    [0.62, 0.52],
    [0.24, 0.26],
    [0.78, 0.66],
    [0.72, 0.18],
    [0.88, 0.42],
  ];
  for (const [x, y] of positions) {
    await canvas.click({ position: { x: box!.width * x, y: box!.height * y } });
    if (await page.getByTestId('archive-graph-detail').count()) return;
  }
  throw new Error('No graph node was selectable at sampled positions');
}

async function contentScrollTop(page: Page) {
  return page.locator('.content').evaluate((element) => element.scrollTop);
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

  await page.getByRole('button', { name: /Deliverables/ }).click();
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

test('deliverables layout remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 820 });
  await expect(page.getByRole('heading', { name: 'deliverables board' })).toBeVisible();
  await expect(page.getByLabel('Deliverable filters')).toBeVisible();
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

test('elements review thumbnails open fullscreen annotation review by exact version and frame', async ({ page }) => {
  const annotationRequests: string[] = [];
  await page.route('**/annotations?**', async (route) => {
    annotationRequests.push(route.request().url());
    await route.fulfill({ contentType: 'application/json', json: [] });
  });

  await page.getByLabel('User').selectOption('all');
  await page.getByTestId('task-row-task-novartis-3d-sh-09').click();
  await expect(page.getByTestId(/^review-version-thumbnail-/)).toHaveCount(1);
  await expect(page.getByTestId('task-review-panel').getByText('Review versions')).toHaveCount(0);
  await expect(page.getByTestId('task-review-panel')).not.toContainText('Frames');
  await expect(page.getByTestId('review-version-thumbnail-v05').locator('img')).toHaveAttribute('src', /\/demo-review\/elements\/V05\/Elements_v05\.1060\.png$/);
  await expect(page.getByTestId('review-version-thumbnail-v05')).toContainText('Latest');
  await expect(page.getByTestId('review-version-thumbnail-v05')).toHaveCSS('box-shadow', /none|rgba\(0, 0, 0, 0\)/);
  const thumbnailFit = await page.getByTestId('review-version-thumbnail-v05').locator('img').evaluate((element) => getComputedStyle(element).objectFit);
  expect(thumbnailFit).toBe('cover');
  await expect(page.getByRole('button', { name: 'Previous review version' })).not.toHaveCSS('background-color', /rgba\(0, 0, 0, 0\)|transparent/);
  await expect(page.getByRole('button', { name: 'Next review version' })).not.toHaveCSS('background-color', /rgba\(0, 0, 0, 0\)|transparent/);
  const latestBadgeStyle = await page.locator('.review-latest-badge').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      borderStyle: style.borderStyle,
      color: style.color,
      fontSize: style.fontSize,
      top: style.top,
    };
  });
  const versionBadgeStyle = await page.locator('.review-version-badge').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      borderStyle: style.borderStyle,
      fontSize: style.fontSize,
      top: style.top,
    };
  });
  expect(latestBadgeStyle.background).toBe(versionBadgeStyle.background);
  expect(latestBadgeStyle.borderStyle).toBe(versionBadgeStyle.borderStyle);
  expect(latestBadgeStyle.fontSize).toBe(versionBadgeStyle.fontSize);
  expect(latestBadgeStyle.top).toBe(versionBadgeStyle.top);
  const activeAccentColor = await page.locator('.relay-shell').evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(element).getPropertyValue('--color-active').trim();
    element.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  expect(latestBadgeStyle.color).toBe(activeAccentColor);

  await page.getByRole('button', { name: 'Previous review version' }).click();
  await expect(page.getByTestId('review-version-thumbnail-v04')).toBeVisible();
  await page.getByRole('button', { name: 'Next review version' }).click();
  await expect(page.getByTestId('review-version-thumbnail-v05')).toBeVisible();

  await page.getByTestId('review-version-thumbnail-v05').first().click();
  await expect(page.getByTestId('fullscreen-review')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous frame' })).toHaveCount(0);
  await expect(page.getByTestId('review-frame-counter')).toBeVisible();
  await page.getByLabel('Fullscreen version for 3D pass SH_09').selectOption('elements-v01');
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1060 / 1060');
  await expect(page.getByTestId('review-frame-image')).toHaveAttribute('src', /\/demo-review\/elements\/V01\/Elements_V01\.1060\.png$/);

  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1059 / 1060');
  await expect(page.getByTestId('review-frame-image')).toHaveAttribute('src', /\/demo-review\/elements\/V01\/Elements_V01\.1059\.png$/);

  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1060 / 1060');
  await expect(page.getByRole('button', { name: 'Show annotation tools' })).toBeVisible();
  await expect(page.getByTestId('annotation-toolbar-group')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Select annotations' })).toHaveCount(0);
  await expect(page.getByLabel('A/B split angle degrees')).toHaveCount(0);
  await expect(page.getByLabel('A/B split angle slider')).toHaveCount(0);
  await expect(page.getByLabel('Review zoom')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zoom in' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zoom out' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'A/B preview' })).toBeVisible();
  await expect(page.getByLabel('Review timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Show annotation tools' }).click();
  await expect(page.getByTestId('annotation-toolbar-group')).toBeVisible();
  await expect(page.locator('footer .annotation-color-palette')).toHaveCount(0);
  await expect(page.locator('header .annotation-color-palette')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select annotations' })).toHaveClass(/is-active/);
  await page.getByRole('button', { name: 'Draw box annotation' }).click();
  await expect(page.getByRole('button', { name: 'Draw box annotation' })).toHaveClass(/is-active/);
  await expect(page.getByRole('button', { name: 'Select annotations' })).not.toHaveClass(/is-active/);
  await page.getByRole('button', { name: 'Draw pen annotation' }).click();
  await expect(page.getByRole('button', { name: 'Draw pen annotation' })).toHaveClass(/is-active/);
  await expect(page.getByRole('button', { name: 'Delete selected annotation' })).toBeDisabled();
  await page.getByRole('button', { name: 'Select annotations' }).click();
  await page.getByRole('button', { name: 'Hide annotation tools' }).click();
  await expect(page.getByRole('button', { name: 'Select annotations' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Draw box annotation' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Draw pen annotation' })).toHaveCount(0);
  await expect(page.locator('header .annotation-color-palette')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'A/B preview' })).toBeVisible();
  await expect(page.getByLabel('Review zoom')).toHaveCount(0);
  await expect(page.getByLabel('Review timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Show annotation tools' }).click();
  await expect(page.getByRole('button', { name: 'Select annotations' })).toBeVisible();
  const normalImageWidth = await page.getByTestId('review-frame-image').evaluate((element) => element.getBoundingClientRect().width);
  await expect(page.getByLabel('Review zoom')).toHaveValue('100');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(page.getByLabel('Review zoom')).toHaveValue('110');
  await expect.poll(() => page.getByTestId('review-frame-image').evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(normalImageWidth);
  await page.getByLabel('Review zoom').fill('200');
  await expect(page.getByLabel('Review zoom')).toHaveValue('200');
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('=');
  await expect(page.getByLabel('Review zoom')).toHaveValue('200');
  await page.keyboard.press('-');
  await expect(page.getByLabel('Review zoom')).toHaveValue('190');
  await page.getByLabel('Review zoom').fill('100');
  await expect(page.getByLabel('Review zoom')).toHaveValue('100');
  await expect(page.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('-');
  await expect(page.getByLabel('Review zoom')).toHaveValue('100');

  await page.getByLabel('Fullscreen version for 3D pass SH_09').selectOption('elements-v02');
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1047 / 1047');
  await expect(page.getByTestId('review-frame-image')).toHaveAttribute('src', /\/demo-review\/elements\/V02\/Elements_V02\.1047\.png$/);

  await page.getByRole('button', { name: 'A/B preview' }).click();
  await expect(page.getByTestId('ab-preview')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select annotations' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Draw box annotation' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Draw pen annotation' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Delete selected annotation' })).toBeDisabled();
  await expect(page.getByLabel('A/B left version')).toHaveValue('elements-v02');
  await expect(page.getByLabel('A/B right version')).toHaveValue('elements-v03');
  const leftControlBox = await page.getByLabel('A/B left version').boundingBox();
  const rightControlBox = await page.getByLabel('A/B right version').boundingBox();
  expect(leftControlBox).not.toBeNull();
  expect(rightControlBox).not.toBeNull();
  expect(leftControlBox!.x).toBeLessThan(rightControlBox!.x);
  expect(leftControlBox!.width).toBeLessThanOrEqual(120);
  expect(rightControlBox!.width).toBeLessThanOrEqual(120);
  const initialClipPath = await page.locator('.ab-right-clip').evaluate((element) => getComputedStyle(element).clipPath);
  await page.getByLabel('A/B split angle degrees').fill('25');
  await expect(page.getByLabel('A/B split angle slider')).toHaveValue('25');
  await expect.poll(() => page.locator('.ab-right-clip').evaluate((element) => getComputedStyle(element).clipPath)).not.toBe(initialClipPath);
  await expect(page.getByRole('button', { name: 'Drag A/B split' })).not.toHaveCSS('background-color', await page.locator('.relay-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-active').trim()));
  const lineBeforeDrag = await page.locator('.ab-split-line line').evaluate((element) => ({
    x1: element.getAttribute('x1'),
    x2: element.getAttribute('x2'),
    y1: element.getAttribute('y1'),
    y2: element.getAttribute('y2'),
  }));
  const handleBox = await page.getByRole('button', { name: 'Drag A/B split' }).boundingBox();
  expect(handleBox).not.toBeNull();
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox!.x + 40, handleBox!.y + handleBox!.height / 2 + 20);
  await page.mouse.up();
  await expect.poll(() => page.locator('.ab-split-line line').evaluate((element) => ({
    x1: element.getAttribute('x1'),
    x2: element.getAttribute('x2'),
    y1: element.getAttribute('y1'),
    y2: element.getAttribute('y2'),
  }))).not.toEqual(lineBeforeDrag);
  const abImageWidth = await page.locator('.ab-image-left').evaluate((element) => element.getBoundingClientRect().width);
  await page.getByLabel('Review zoom').fill('200');
  await expect(page.getByLabel('Review zoom')).toHaveValue('200');
  await expect.poll(() => page.locator('.ab-image-left').evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(abImageWidth);
  const zoomLayerBox = await page.getByTestId('review-zoom-layer').boundingBox();
  expect(zoomLayerBox).not.toBeNull();
  const panBefore = await page.getByTestId('review-zoom-layer').getAttribute('data-pan-x');
  await page.mouse.move(zoomLayerBox!.x + 12, zoomLayerBox!.y + 12);
  await page.mouse.down();
  await page.mouse.move(zoomLayerBox!.x + 52, zoomLayerBox!.y + 36);
  await page.mouse.up();
  await expect.poll(async () => page.getByTestId('review-zoom-layer').getAttribute('data-pan-x')).not.toBe(panBefore);
  await page.getByLabel('A/B split angle slider').evaluate((element) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set;
    valueSetter?.call(input, '-30');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.getByLabel('A/B split angle degrees')).toHaveValue('-30');
  await page.getByRole('button', { name: 'A/B preview' }).click();

  await page.getByRole('button', { name: 'Previous fullscreen review version' }).click();
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1060 / 1060');

  await page.keyboard.press('ArrowLeft');
  await page.getByLabel('Playback FPS').fill('12');
  await page.getByRole('button', { name: 'Play playback' }).click();
  await expect(page.getByTestId('annotated-frame-layer')).toHaveClass(/annotations-hidden/);
  await expect(page.getByRole('button', { name: 'Select annotations' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Draw box annotation' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Draw pen annotation' })).toBeDisabled();
  await expect(page.getByTestId('review-frame-counter')).toHaveText('Frame 1060 / 1060');
  await expect(page.getByRole('button', { name: 'Play playback' })).toBeVisible();
  await expect(page.getByTestId('annotated-frame-layer')).not.toHaveClass(/annotations-hidden/);
  await page.keyboard.press('ArrowLeft');
  await page.getByLabel('Playback FPS').fill('60');
  await page.getByRole('button', { name: 'Enable loop playback' }).click();
  await page.getByRole('button', { name: 'Play playback' }).click();
  await expect(page.getByRole('button', { name: 'Pause playback' })).toBeVisible();
  await expect.poll(async () => {
    const text = await page.getByTestId('review-frame-counter').textContent();
    return Number(text?.match(/Frame (\d+)/)?.[1] ?? 0);
  }).toBeLessThan(1059);
  await page.getByRole('button', { name: 'Pause playback' }).click();
  await expect(page.getByTestId('annotated-frame-layer')).not.toHaveClass(/annotations-hidden/);

  const shellBox = await page.locator('.fullscreen-review-shell').boundingBox();
  const footerBox = await page.locator('.fullscreen-playback-controls').boundingBox();
  expect(shellBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(footerBox!.x).toBeGreaterThanOrEqual(shellBox!.x);
  expect(footerBox!.x + footerBox!.width).toBeLessThanOrEqual(shellBox!.x + shellBox!.width + 1);
  expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(shellBox!.y + shellBox!.height + 1);

  await page.getByLabel('Fullscreen version for 3D pass SH_09').selectOption('elements-v02');
  await page.getByLabel('Fullscreen message for V02').fill('V02 scoped note');
  await page.getByRole('button', { name: 'Send fullscreen comment' }).click();
  await expect(page.getByTestId('fullscreen-version-comments')).toContainText('V02 scoped note');
  await page.getByLabel('Fullscreen version for 3D pass SH_09').selectOption('elements-v01');
  await expect(page.getByTestId('fullscreen-version-comments')).toContainText('V02 scoped note');

  await expect.poll(() => annotationRequests.length).toBeGreaterThanOrEqual(4);
  const requestParams = annotationRequests.map((url) => new URL(url).searchParams);
  expect(requestParams.some((params) => params.get('version_id') === 'elements-v01' && params.get('frame_number') === '1059')).toBe(true);
  expect(requestParams.some((params) => params.get('version_id') === 'elements-v02' && params.get('frame_number') === '1047')).toBe(true);
  expect(requestParams.every((params) => params.has('project_id') && params.has('shot_id') && params.has('version_id') && params.has('frame_number'))).toBe(true);
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

  await expect(page.getByLabel('Role for Billy Towsend')).toBeDisabled();
  await expect(page.getByLabel('Permission level for Billy Towsend')).toBeDisabled();
  const billyRow = page.locator('.people-row').filter({ hasText: 'Billy Towsend' });
  await billyRow.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Role for Billy Towsend').fill('Lead Artist');
  await page.getByLabel('Permission level for Billy Towsend').selectOption('Manager');
  await expect(page.locator('.permission-grid').last().getByRole('checkbox').first()).toBeChecked();
  await billyRow.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Role for Billy Towsend')).toHaveValue('Lead Artist');
  await expect(page.getByLabel('Permission level for Billy Towsend')).toHaveValue('Manager');
  await expect(page.getByLabel('Role for Billy Towsend')).toBeDisabled();
  await expect(billyRow.getByRole('button', { name: 'Remove' })).toBeEnabled();
  await expect(page.locator('.people-row').filter({ hasText: 'James Green' }).getByRole('button', { name: 'Remove' })).toBeDisabled();
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
  await page.locator('.people-row').filter({ hasText: 'Billy Towsend' }).getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Role for Billy Towsend').fill('Client Reviewer');
  await page.getByLabel('Permission level for Billy Towsend').selectOption('Client');
  await page.locator('.people-row').filter({ hasText: 'Billy Towsend' }).getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Current user').selectOption('person-artist-c');

  await expect(page.getByRole('button', { name: /Deliverables/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Documentation/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Calendar/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Bidding/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Finance Map/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /People/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Settings/ })).toBeDisabled();
  await page.getByRole('button', { name: /Deliverables/ }).click();
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

test('finance map appears in nav and renders source flow content', async ({ page }) => {
  await page.getByRole('button', { name: /Finance Map/ }).click();
  await expect(page).toHaveURL(/\/finance-map$/);
  await expect(page.getByRole('heading', { name: 'finance map' })).toBeVisible();
  await expect(page.getByText('Production & Project Delivery').first()).toBeVisible();
  await expect(page.getByText('New opportunity identified')).toBeVisible();
});

test('finance map switches flows and expands step detail', async ({ page }) => {
  await page.getByRole('button', { name: /Finance Map/ }).click();
  await page.getByRole('button', { name: /Invoicing & Payments/ }).click();
  await expect(page.getByRole('heading', { name: 'Invoicing & Payments' })).toBeVisible();
  await expect(page.getByText('Client details updated in Scoro')).toBeVisible();

  await page.getByRole('button', { name: /Client details updated in Xero/ }).click();
  await expect(page.getByText('Client contact created or updated in the correct Xero entity.')).toBeVisible();
  await expect(page.getByText('Wrong client entity / account creates reporting')).toBeVisible();
});

test('finance map access follows internal role permissions', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Finance Map/ })).toBeEnabled();

  await page.evaluate(() => localStorage.setItem('relay:current-person', 'person-manager'));
  await page.reload();
  await expect(page.getByRole('button', { name: /Finance Map/ })).toBeEnabled();

  await page.evaluate(() => localStorage.setItem('relay:current-person', 'person-artist-a'));
  await page.reload();
  await expect(page.getByRole('button', { name: /Finance Map/ })).toBeEnabled();
});

test('primary navigation order exposes one calendar entry', async ({ page }) => {
  const labels = await page.locator('.sidebar section').first().getByRole('button').evaluateAll((buttons) =>
    buttons.map((button) => button.querySelector('span')?.textContent?.trim()),
  );

  expect(labels).toEqual([
    'Projects',
    'Calendar',
    'Deliverables',
    'Bidding',
    'Finance Map',
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

test('pending time off can be deleted while confirmed time off requires revert first', async ({ page }) => {
  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await page.getByTestId(/time-off-overlay-holiday-pending/).click();
  await expect(page.getByRole('button', { name: 'Delete pending time off' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete pending time off' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-pending/)).toHaveCount(0);
  await expect(page.getByTestId('time-off-selection-count')).toHaveText('0 selected');
  await expect(page.getByRole('button', { name: 'Delete pending time off' })).toHaveCount(0);

  await page.getByTestId('calendar-cell-person-manager-2026-05-06').click();
  await page.getByRole('button', { name: 'Apply time off' }).click();
  await page.getByTestId(/time-off-overlay-holiday-pending/).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByTestId(/time-off-overlay-holiday-confirmed/).click();
  await expect(page.getByRole('button', { name: 'Delete pending time off' })).toHaveCount(0);
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
  await expect(page.getByRole('button', { name: 'Delete pending time off' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByTestId(/time-off-overlay-holiday-confirmed/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete pending time off' })).toHaveCount(0);
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
  await page.locator('.calendar-overlay-settings').getByLabel('Allocation').uncheck();
  await page.locator('.calendar-overlay-settings').getByLabel('Time Off').uncheck();
  await expect(page.locator('.calendar-overlay-settings').getByLabel('Milestones')).toBeDisabled();
  await page.reload();
  await expect(page.locator('.calendar-overlay-settings').getByLabel('Allocation')).not.toBeChecked();
  await expect(page.locator('.calendar-overlay-settings').getByLabel('Time Off')).not.toBeChecked();
  await expect(page.locator('.calendar-overlay-settings').getByLabel('Milestones')).not.toBeChecked();

  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  await expect(page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04').locator('.allocation-band')).toBeVisible();

  await openCalendar(page, 'Time Off');
  await page.getByLabel('Time off date').fill('2026-05-05');
  await expect(page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04').locator('.allocation-band')).toHaveCount(0);
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

test('day view padding settings persist but day timeline shows the full 24 hour scale', async ({ page }) => {
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
  await page.getByLabel('Selected date').fill('2026-05-15');
  await expect(page.locator('.day-scale')).toContainText('00:00');
  await expect(page.locator('.day-scale')).toContainText('09:00');
  await expect(page.locator('.day-scale')).toContainText('22:00');
  await expect(page.locator('.day-scale')).toContainText('24:00');
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
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Projects and Deliverables/ })).toBeVisible();
  await expect(page.locator('.documentation-browser').getByRole('button', { name: 'Deliverables Board' })).not.toBeVisible();
  await page.getByRole('button', { name: /Projects and Deliverables/ }).click();
  await expect(page.locator('.documentation-browser').getByRole('button', { name: 'Deliverables Board' })).toBeVisible();

  await page.getByTestId('documentation-reader').getByRole('button', { name: 'Deliverables Board' }).click();
  await expect(page.getByRole('heading', { name: 'Deliverables Board' })).toBeVisible();
  await expect(page.getByTestId('documentation-reader')).toContainText('The deliverables board is the main place to inspect and update production work.');

  await page.getByTestId('documentation-reader').getByRole('button', { name: 'Archive and Restore' }).click();
  await expect(page.getByRole('heading', { name: 'Archive and Restore' })).toBeVisible();
});

test('archive project rows use full project names without visible codes', async ({ page }) => {
  await page.getByTitle('Archive').click();
  await expect(page.getByTestId('archive-filter-panel')).toBeVisible();
  await expect(page.getByRole('button', { name: /Archive numbers/ })).toBeVisible();
  await expect(page.locator('.archive-summary .stat-active')).toHaveCount(0);
  await page.getByRole('button', { name: /Archive numbers/ }).click();
  await expect(page.locator('.archive-summary .stat-active')).toContainText('Active projects');
  await expect(page.locator('.archive-summary .stat-active')).toContainText('16');
  await expect(page.getByTestId('archive-project-novartis-novartis')).toContainText('Active');
  await expect(page.getByTestId('archive-project-novartis-novartis').getByRole('button', { name: 'Restore' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByTestId('studio-toggle-bonfire').click();
  await page.getByTestId('project-row-novartis-novartis').click();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Archive project' }).click();

  await page.getByTitle('Archive').click();
  await page.getByRole('button', { name: /Archive numbers/ }).click();
  await expect(page.locator('.archive-summary .stat-active')).toContainText('15');
  await expect(page.getByTestId('archive-project-novartis-novartis')).toContainText('Novartis Novartis');
  await expect(page.getByTestId('archive-project-novartis-novartis')).not.toContainText('Active');
  await expect(page.getByTestId('archive-project-novartis-novartis').getByRole('button', { name: 'Restore' })).toBeVisible();
  await expect(page.getByTestId('archive-project-novartis-novartis')).not.toContainText('NOV45');

  await expect(page.getByTestId('archive-graph')).toBeVisible();
  await expect(page.locator('.archive-workspace .archive-filters')).toBeVisible();
  await expect(page.locator('.archive-workspace .archive-graph-panel')).toBeVisible();
  await expect(page.getByTestId('archive-graph-canvas')).toBeVisible();
  await expect.poll(async () => (await canvasPixelStats(page)).painted).toBeGreaterThan(1000);
  const archiveFilters = page.getByTestId('archive-filter-panel');
  const workspaceLayout = await page.locator('.archive-workspace').evaluate((workspace) => {
    const [filters, graph] = Array.from(workspace.children) as HTMLElement[];
    return {
      filtersWidth: filters.getBoundingClientRect().width,
      graphWidth: graph.getBoundingClientRect().width,
    };
  });
  expect(workspaceLayout.filtersWidth / workspaceLayout.graphWidth).toBeGreaterThan(0.92);
  expect(workspaceLayout.filtersWidth / workspaceLayout.graphWidth).toBeLessThan(1.08);
  await expect(page.getByLabel('Open graph controls')).toBeVisible();
  await expect(page.getByTestId('archive-graph-controls')).not.toContainText('Forces');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-zoom'))).not.toBe(1);
  await page.waitForTimeout(760);
  const fittedViewBefore = await page.getByTestId('archive-graph').evaluate((element) => ({
    x: Number(element.getAttribute('data-view-x')),
    y: Number(element.getAttribute('data-view-y')),
    zoom: Number(element.getAttribute('data-zoom')),
  }));
  await page.getByLabel('Fit graph').click();
  const fittedViewAfter = await page.getByTestId('archive-graph').evaluate((element) => ({
    x: Number(element.getAttribute('data-view-x')),
    y: Number(element.getAttribute('data-view-y')),
    zoom: Number(element.getAttribute('data-zoom')),
  }));
  expect(Math.abs(fittedViewAfter.x - fittedViewBefore.x)).toBeLessThan(3);
  expect(Math.abs(fittedViewAfter.y - fittedViewBefore.y)).toBeLessThan(3);
  expect(Math.abs(fittedViewAfter.zoom - fittedViewBefore.zoom)).toBeLessThan(0.03);
  await page.getByLabel('Open graph controls').click();
  const archiveCheckboxBox = await archiveFilters.getByLabel('Active').boundingBox();
  const graphCheckboxBox = await page.getByTestId('archive-graph-controls').getByLabel('Labels').boundingBox();
  expect(archiveCheckboxBox?.width).toBeLessThanOrEqual(16);
  expect(archiveCheckboxBox?.height).toBeLessThanOrEqual(16);
  expect(graphCheckboxBox?.width).toBeLessThanOrEqual(16);
  expect(graphCheckboxBox?.height).toBeLessThanOrEqual(16);
  const centerRangeBox = await page.getByLabel('Center force').boundingBox();
  const linkRangeBox = await page.getByLabel('Link distance').boundingBox();
  expect(centerRangeBox?.height).toBeLessThanOrEqual(20);
  expect(linkRangeBox?.height).toBeLessThanOrEqual(20);
  await expect(page.getByTestId('archive-graph-controls')).not.toContainText('Filters');
  await expect(page.getByTestId('archive-graph-controls')).not.toContainText('Groups');
  await expect(page.getByTestId('archive-graph-controls')).toContainText('Display');
  await expect(page.getByTestId('archive-graph-controls')).toContainText('Forces');
  await expect(page.getByTestId('archive-graph-controls').getByLabel('Arrows')).not.toBeChecked();
  const linkThickness = page.getByLabel('Link thickness');
  await expect(linkThickness).toHaveValue(await linkThickness.getAttribute('min') ?? '');
  for (const sliderName of ['Center force', 'Repel force', 'Link force', 'Link distance']) {
    const slider = page.getByLabel(sliderName);
    await expect(slider).toHaveValue(await slider.getAttribute('min') ?? '');
  }
  const checkedColor = await archiveFilters.getByLabel('Active').evaluate((element) => getComputedStyle(element).color);
  const activeToken = await page.locator('.relay-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-active').trim());
  expect(checkedColor).not.toBe(activeToken);

  const allNodes = Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'));
  await page.getByLabel('Search archive').fill('Novartis');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeLessThan(allNodes);
  await expect(page.getByTestId('archive-project-novartis-novartis')).toBeVisible();
  await page.getByLabel('Search archive').fill('');
  await archiveFilters.getByLabel('Project tag').selectOption('cg');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeLessThan(allNodes);
  await archiveFilters.getByLabel('Project tag').selectOption('all');
  await archiveFilters.getByLabel('Project tool').selectOption('Photoshop');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeLessThan(allNodes);
  await archiveFilters.getByLabel('Project tool').selectOption('all');
  await archiveFilters.getByLabel('Deliverable status').selectOption('done');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeLessThan(allNodes);
  await archiveFilters.getByLabel('Deliverable status').selectOption('all');
  await archiveFilters.getByLabel('Deliverable phase').selectOption('delivery');
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeLessThan(allNodes);
  await archiveFilters.getByLabel('Deliverable phase').selectOption('all');
  await archiveFilters.getByLabel('Active').uncheck();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toBeVisible();
  await archiveFilters.getByLabel('Archived').uncheck();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toHaveCount(0);
  await archiveFilters.getByLabel('Active').check();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toHaveCount(0);
  await archiveFilters.getByLabel('Archived').check();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toBeVisible();
  await archiveFilters.getByLabel('Projects').uncheck();
  await expect(page.getByTestId('archive-project-novartis-novartis')).toHaveCount(0);
  await archiveFilters.getByLabel('Projects').check();

  const canvasBox = await page.getByTestId('archive-graph-canvas').boundingBox();
  expect(canvasBox).not.toBeNull();
  await page.locator('.content').evaluate((element) => { element.scrollTop = 12; });
  const scrolledCanvasBox = await page.getByTestId('archive-graph-canvas').boundingBox();
  expect(scrolledCanvasBox).not.toBeNull();
  const scrollBeforeWheel = await contentScrollTop(page);
  if (Number(await page.getByTestId('archive-graph').getAttribute('data-zoom')) <= 0.36) {
    await page.getByLabel('Zoom in graph').click();
  }
  const zoomBeforeWheel = Number(await page.getByTestId('archive-graph').getAttribute('data-zoom'));
  await page.mouse.move(scrolledCanvasBox!.x + scrolledCanvasBox!.width * 0.5, scrolledCanvasBox!.y + scrolledCanvasBox!.height * 0.5);
  await page.mouse.wheel(0, 240);
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-zoom'))).toBeLessThan(zoomBeforeWheel);
  await expect.poll(async () => contentScrollTop(page)).toBe(scrollBeforeWheel);
  const viewBeforeMiddlePan = await page.getByTestId('archive-graph').evaluate((element) => ({
    x: element.getAttribute('data-view-x'),
    y: element.getAttribute('data-view-y'),
  }));
  await page.mouse.move(scrolledCanvasBox!.x + scrolledCanvasBox!.width * 0.5, scrolledCanvasBox!.y + scrolledCanvasBox!.height * 0.5);
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(scrolledCanvasBox!.x + scrolledCanvasBox!.width * 0.58, scrolledCanvasBox!.y + scrolledCanvasBox!.height * 0.56);
  await page.mouse.up({ button: 'middle' });
  await expect.poll(async () => page.getByTestId('archive-graph').evaluate((element) => ({
    x: element.getAttribute('data-view-x'),
    y: element.getAttribute('data-view-y'),
  }))).not.toEqual(viewBeforeMiddlePan);
  await expect.poll(async () => contentScrollTop(page)).toBe(scrollBeforeWheel);
  await page.mouse.move(canvasBox!.x + canvasBox!.width * 0.47, canvasBox!.y + canvasBox!.height * 0.74);
  await page.mouse.down();
  await page.mouse.move(canvasBox!.x + canvasBox!.width * 0.52, canvasBox!.y + canvasBox!.height * 0.70);
  await page.mouse.up();
  await clickVisibleGraphNode(page);
  await expect(page.getByTestId('archive-graph-detail')).toBeVisible();
  await page.getByTestId('archive-graph-canvas').click({ position: { x: 4, y: 4 } });
  await expect(page.getByTestId('archive-graph-detail')).toHaveCount(0);
  await page.getByLabel('Zoom in graph').click();
  await page.getByLabel('Zoom out graph').click();
  await page.getByLabel('Fit graph').click();
  await page.getByLabel('Reset graph').click();

  await page.getByLabel('Collapse graph controls').click();
  await expect(page.getByText('Forces')).not.toBeVisible();
  await page.getByLabel('Open graph controls').click();
  await expect(page.getByText('Forces')).toBeVisible();
});

test('archive graph uses theme accent tokens when rendering canvas highlights', async ({ page }) => {
  await page.getByTitle('Archive').click();
  await expect(page.getByTestId('archive-graph-canvas')).toBeVisible();
  await expect.poll(async () => Number(await page.getByTestId('archive-graph').getAttribute('data-node-count'))).toBeGreaterThan(0);
  await expect.poll(async () => (await canvasPixelStats(page)).painted).toBeGreaterThan(1000);

  await clickVisibleGraphNode(page);
  await expect(page.getByTestId('archive-graph-detail')).toBeVisible();

  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.relay-shell')?.style.setProperty('--color-active', 'rgb(255, 0, 0)');
  });
  await page.waitForTimeout(80);
  const redAccent = await canvasPixelStats(page);
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.relay-shell')?.style.setProperty('--color-active', 'rgb(0, 0, 255)');
  });
  await page.waitForTimeout(80);
  const blueAccent = await canvasPixelStats(page);

  expect(redAccent.red).toBeGreaterThan(blueAccent.red);
  expect(blueAccent.blue).toBeGreaterThan(redAccent.blue);
});

test('archive graph distributes node colors from theme tokens', async ({ page }) => {
  await page.getByTitle('Archive').click();
  await expect(page.getByTestId('archive-graph-canvas')).toBeVisible();
  await expect.poll(async () => (await canvasPixelStats(page)).painted).toBeGreaterThan(1000);

  await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('.relay-shell');
    shell?.style.setProperty('--color-active', 'rgb(0, 0, 0)');
    shell?.style.setProperty('--color-success', 'rgb(0, 0, 0)');
    shell?.style.setProperty('--color-pending', 'rgb(0, 0, 0)');
    shell?.style.setProperty('--color-special', 'rgb(0, 0, 0)');
    shell?.style.setProperty('--color-danger', 'rgb(0, 0, 0)');
    shell?.style.setProperty('--ink-2', 'rgb(0, 0, 0)');
  });
  await page.waitForTimeout(80);
  const darkNodes = await canvasPixelStats(page);

  await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('.relay-shell');
    shell?.style.setProperty('--color-active', 'rgb(255, 255, 255)');
    shell?.style.setProperty('--color-success', 'rgb(255, 255, 255)');
    shell?.style.setProperty('--color-pending', 'rgb(255, 255, 255)');
    shell?.style.setProperty('--color-special', 'rgb(255, 255, 255)');
    shell?.style.setProperty('--color-danger', 'rgb(255, 255, 255)');
    shell?.style.setProperty('--ink-2', 'rgb(255, 255, 255)');
  });
  await page.waitForTimeout(80);
  const lightNodes = await canvasPixelStats(page);

  expect(lightNodes.red + lightNodes.green + lightNodes.blue).toBeGreaterThan(darkNodes.red + darkNodes.green + darkNodes.blue);

  const studioDotColor = await page.locator('.graph-legend span', { hasText: 'Studios' }).evaluate((element) => getComputedStyle(element, '::before').backgroundColor);
  expect(studioDotColor).toBe('rgb(255, 255, 255)');
  await page.getByTestId('archive-filter-panel').getByLabel('Studios').uncheck();
  await expect(page.locator('.graph-legend span', { hasText: 'Studios' })).toHaveAttribute('data-muted', 'true');
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
    const band = element.querySelector('.allocation-band')!;
    return {
      borderRight: cellStyles.borderRightColor,
      text: element.textContent?.trim(),
      bandWidth: getComputedStyle(band).width,
    };
  });
  expect(summaryStyles.text).toBe('4h');
  expect(Number.parseFloat(summaryStyles.bandWidth)).toBeGreaterThan(20);
  const timelineOverflow = await page.getByTestId('calendar-timeline').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(timelineOverflow.scrollWidth).toBeGreaterThan(timelineOverflow.clientWidth);
  await page.getByRole('button', { name: 'month' }).click();
  const header = page.getByTestId('calendar-date-header-2026-05-04');
  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  await page.mouse.move(headerBox!.x + headerBox!.width / 2, headerBox!.y + headerBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(headerBox!.x - 180, headerBox!.y + headerBox!.height / 2);
  await page.mouse.up();
  await expect
    .poll(() => page.getByTestId('calendar-timeline').evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Start time 1').fill('18:00');
  await page.getByLabel('Duration 1').fill('4');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await expect(page.getByTestId('calendar-summary-bands-person-manager-2026-05-05').locator('.allocation-band')).toHaveCount(2);
});

test('calendar timeline pans through hidden horizontal scrollbar and tracks centered date', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await expect(page.getByTestId('calendar-timeline')).toBeVisible();

  const weekWidth = await page.getByTestId('calendar-date-header-2026-05-05').evaluate((element) => element.getBoundingClientRect().width);
  await page.getByRole('button', { name: 'month' }).click();
  const monthWidth = await page.getByTestId('calendar-date-header-2026-05-05').evaluate((element) => element.getBoundingClientRect().width);
  expect(Math.round(monthWidth)).toBe(Math.round(weekWidth / 4));

  const timelineMetrics = await page.getByTestId('calendar-timeline').evaluate((element) => ({
    clientWidth: element.clientWidth,
    horizontalChrome: element.offsetHeight - element.clientHeight,
    scrollWidth: element.scrollWidth,
  }));
  expect(timelineMetrics.scrollWidth).toBeGreaterThan(timelineMetrics.clientWidth);
  expect(timelineMetrics.horizontalChrome).toBeLessThanOrEqual(2);

  const header = page.getByTestId('calendar-date-header-2026-05-05');
  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  await page.waitForTimeout(100);
  await page.mouse.move(headerBox!.x + headerBox!.width / 2, headerBox!.y + headerBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(headerBox!.x - 900, headerBox!.y + headerBox!.height / 2);
  await page.mouse.up();
  await expect.poll(() => page.getByLabel('Selected date').inputValue()).not.toBe('2026-05-05');
  await expect.poll(() => page.getByTestId('calendar-timeline').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});

test('calendar places toolbar and editor in the right column while legend stays under the timeline', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');

  const layout = await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('[data-testid="calendar-main-column"]')!;
    const side = document.querySelector<HTMLElement>('[data-testid="calendar-side-column"]')!;
    const timeline = document.querySelector<HTMLElement>('[data-testid="calendar-timeline"]')!;
    const legend = document.querySelector<HTMLElement>('[data-testid="calendar-legend"]')!;
    const toolbar = document.querySelector<HTMLElement>('.calendar-toolbar')!;
    const editor = document.querySelector<HTMLElement>('[aria-label="Allocation editor"]')!;
    const timelineBox = timeline.getBoundingClientRect();
    const legendBox = legend.getBoundingClientRect();
    const toolbarBox = toolbar.getBoundingClientRect();
    const editorBox = editor.getBoundingClientRect();
    return {
      editorBelowToolbar: editorBox.top >= toolbarBox.bottom,
      legendAfterTimeline: legendBox.top >= timelineBox.bottom,
      legendInMain: legend.parentElement === main,
      legendWidth: Math.round(legendBox.width),
      sideContainsEditor: editor.parentElement === side,
      sideContainsToolbar: toolbar.parentElement === side,
      timelineWidth: Math.round(timelineBox.width),
    };
  });

  expect(layout.sideContainsToolbar).toBe(true);
  expect(layout.sideContainsEditor).toBe(true);
  expect(layout.editorBelowToolbar).toBe(true);
  expect(layout.legendInMain).toBe(true);
  expect(layout.legendAfterTimeline).toBe(true);
  expect(Math.abs(layout.legendWidth - layout.timelineWidth)).toBeLessThanOrEqual(1);
});

test('year view renders read-only monthly project statistics without holiday or overbooking marks', async ({ page }) => {
  await openCalendar(page, 'Allocation');
  await page.getByLabel('Selected date').fill('2026-05-05');
  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByTestId('calendar-cell-person-manager-2026-05-05').click();
  await page.getByLabel('Start time 1').fill('18:00');
  await page.getByLabel('Duration 1').fill('4');
  await page.getByRole('button', { name: 'Apply allocation' }).click();

  await page.getByRole('button', { name: 'year' }).click();
  const yearCell = page.getByTestId('calendar-cell-person-manager-2026-05-01');
  await expect(yearCell.locator('.year-project-stat')).toHaveCount(3);
  await expect(yearCell).not.toContainText('9h');
  await expect(yearCell).not.toHaveClass(/is-over/);
  await expect(page.getByTestId(/uk-holiday-overlay-/)).toHaveCount(0);

  const statStyles = await yearCell.evaluate((element) => {
    const stats = [...element.querySelectorAll<HTMLElement>('.year-project-stat')];
    return {
      firstWidth: getComputedStyle(stats[0]).getPropertyValue('--stat-width').trim(),
      secondWidth: getComputedStyle(stats[1]).getPropertyValue('--stat-width').trim(),
      overbookWidth: getComputedStyle(stats[1]).getPropertyValue('--overbook-width').trim(),
      statBackground: getComputedStyle(stats[1]).backgroundImage,
    };
  });
  expect(statStyles.firstWidth).toBe('100%');
  expect(Number.parseFloat(statStyles.secondWidth)).toBeGreaterThan(0);
  expect(statStyles.overbookWidth).toBe('');
  expect(statStyles.statBackground).not.toContain('239, 68, 68');

  await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  const projectYearCell = page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-01');
  await expect(projectYearCell.locator('.year-project-stat')).toContainText('4h');
  await expect(projectYearCell).not.toHaveClass(/is-over/);

  await yearCell.click();
  await expect(page.getByTestId('allocation-editor-mode')).toHaveText('Create mode');
  await expect(page.getByRole('button', { name: 'Apply allocation' })).toBeDisabled();
  await expect(page.getByLabel('Project').last()).toBeDisabled();
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
  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByLabel('Start time 1').fill('18:00');
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
    const summaryZ = getComputedStyle(element.querySelector('.allocation-segment-layer')!).zIndex;
    const bandZ = getComputedStyle(element.querySelector('.allocation-band')!).zIndex;
    const timeOffZ = getComputedStyle(element.querySelector('.time-off-overlay')!).zIndex;
    return { bandZ, holiday, over, overZ, selectionBackground: selection.backgroundColor, selectionPattern: selection.backgroundImage, sickLeave, summaryZ, timeOffZ };
  });
  expect(styles.over).toContain('-45deg');
  expect(styles.holiday).toContain('repeating-linear-gradient');
  expect(styles.holiday).toContain('-45deg');
  expect(styles.sickLeave).toContain('repeating-linear-gradient');
  expect(styles.sickLeave).toContain('-45deg');
  expect(styles.selectionPattern).toBe('none');
  expect(styles.selectionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(Number(styles.summaryZ)).toBeGreaterThanOrEqual(1);
  expect(Number(styles.overZ)).toBeLessThan(Number(styles.summaryZ));
  expect(Number(styles.timeOffZ)).toBeLessThan(Number(styles.summaryZ));
  expect(Number(styles.timeOffZ)).toBeLessThan(Number(styles.bandZ));

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

  await page.getByRole('button', { name: 'day' }).click();
  await page.getByLabel('Selected date').fill('2026-05-05');
  const dayLayering = await page.getByTestId('day-row-person-manager-2026-05-05').evaluate((element) => {
    const block = element.querySelector<HTMLElement>('.allocation-block')!;
    const timeOff = element.querySelector<HTMLElement>('.time-off-overlay')!;
    const holiday = element.querySelector<HTMLElement>('.uk-holiday')!;
    return {
      blockZ: getComputedStyle(block).zIndex,
      holidayZ: getComputedStyle(holiday).zIndex,
      timeOffZ: getComputedStyle(timeOff).zIndex,
    };
  });
  expect(Number(dayLayering.blockZ)).toBeGreaterThan(Number(dayLayering.timeOffZ));
  expect(Number(dayLayering.blockZ)).toBeGreaterThan(Number(dayLayering.holidayZ));
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
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveClass(/is-range-start/);
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-05')).toHaveClass(/is-range-middle/);
  await expect(page.getByTestId('calendar-cell-person-manager-2026-05-06')).toHaveClass(/is-range-end/);

  await page.getByTestId('calendar-cell-person-artist-a-2026-05-05').click({ modifiers: ['Control'] });
  await expect(page.getByTestId('selection-count')).toHaveCount(0);
  await expect(page.getByTestId('calendar-cell-person-artist-a-2026-05-05')).toHaveClass(/is-range-start/);
  await expect(page.getByTestId('calendar-cell-person-artist-a-2026-05-05')).toHaveClass(/is-range-end/);

  await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  await page.getByLabel('Start time 1').fill('09:00');
  await page.getByLabel('Duration 1').fill('5');
  await page.getByLabel('Status').last().selectOption('active');
  await page.getByRole('textbox', { name: 'Notes' }).fill('bulk allocation smoke test');
  await page.getByRole('button', { name: 'Select deliverables' }).click();
  await page.getByLabel('Photoshop retouch working files').check();
  await expect(page.getByTestId('attached-task-count')).toHaveText('1 deliverable attached');
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

  await page.getByRole('button', { name: /Deliverables/ }).click();
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
  await expect(page.getByTestId('calendar-summary-bands-person-manager-2026-05-06').locator('.allocation-band')).toHaveCount(2);
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
  await expect(page.getByTestId('allocation-editor-mode')).toHaveText('Replace cell mode');
  await expect(page.getByTestId('segment-editor-row-0')).toBeVisible();
  await expect(page.getByTestId('segment-editor-row-1')).toBeVisible();
  await page.getByTestId('segment-editor-row-1').getByRole('button', { name: 'Delete' }).click();
  await page.getByLabel('Duration 1').fill('1');
  await page.getByRole('button', { name: 'Replace allocation' }).click();

  await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('1h');
  await expect(page.getByTestId('calendar-summary-bands-person-manager-2026-05-06').locator('.allocation-band')).toHaveCount(1);
});

test('day view supports snapped block creation, selected date marker, context delete, and pane sync', async ({ page }) => {
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByLabel('Timezone').fill('UTC');
  await openCalendar(page, 'Allocation');
  await page.getByRole('button', { name: 'day' }).click();
  await page.getByLabel('Selected date').fill('2026-05-14');
  await expect(page.getByTestId('current-time-marker')).toHaveCount(0);
  await expect(page.getByTestId('selected-date-overlay-2026-05-14').first()).toBeVisible();
  await page.getByLabel('Selected date').fill('2026-05-15');

  const row = page.getByTestId('day-row-person-manager-2026-05-15');
  const dragBox = await row.evaluate((element) => {
    const rowBox = element.getBoundingClientRect();
    const timeline = element.closest('.calendar-timeline') as HTMLElement;
    const timelineBox = timeline.getBoundingClientRect();
    const labelWidth = timeline.querySelector<HTMLElement>('.calendar-corner')?.getBoundingClientRect().width ?? 0;
    const contentWidth = timeline.clientWidth - labelWidth;
    return {
      endX: timelineBox.left + labelWidth + 1 + contentWidth * 0.125,
      startX: timelineBox.left + labelWidth + 1,
      y: rowBox.top + 20,
    };
  });
  await page.mouse.move(dragBox.startX, dragBox.y);
  await page.mouse.down();
  await page.mouse.move(dragBox.endX, dragBox.y);
  await page.mouse.up();

  const block = page.locator('[data-testid^="allocation-block-alloc-local-"]').last();
  await expect(block).toBeVisible();
  await expect(page.getByLabel('Start time 1')).toHaveValue('09:15');
  await expect(page.getByLabel('End time 1')).toHaveValue('10:15');
  await block.click();
  await expect(page.getByTestId('allocation-editor-mode')).toHaveText('Edit selected segment mode');
  await page.getByLabel('End time 1').fill('13:30');
  await page.getByRole('button', { name: 'Update selected segments' }).click();
  await expect(block).toContainText('09:15-13:30');

  await block.click({ button: 'right' });
  await expect(page.getByTestId('allocation-context-menu')).toBeVisible();
  await page.getByTestId('allocation-context-menu').getByRole('button', { name: 'Delete' }).click();
  await expect(block).not.toBeVisible();
});
