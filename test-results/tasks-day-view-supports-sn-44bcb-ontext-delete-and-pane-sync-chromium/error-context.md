# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> day view supports snapped block creation, selected date marker, context delete, and pane sync
- Location: tests/tasks.spec.ts:1583:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('allocation-context-menu')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('allocation-context-menu')

```

```yaml
- main:
  - button "Alongside Global RELAY":
    - img "Alongside Global"
    - text: RELAY
  - button "Notifications"
  - complementary "Primary navigation":
    - button "Collapse navigation"
    - heading "views" [level=2]
    - button "Projects"
    - button "Calendar"
    - button "Deliverables"
    - button "Bidding"
    - button "Finance Map"
    - button "Archive"
    - button "Documentation"
    - button "People"
    - button "Settings"
    - heading "user" [level=2]
    - paragraph: James Green
    - text: Admin
  - paragraph: Relay / Calendar
  - heading "calendar" [level=1]
  - button "Allocation"
  - button "Time Off"
  - button "Milestones"
  - text: person
  - button "Add project row for James Green"
  - button "Expand James Green"
  - strong: James Green
  - text: Admin
  - button
  - button "Add project row for Ben Hall"
  - button "Expand Ben Hall"
  - strong: Ben Hall
  - text: Manager
  - button "Area23 ProjectJ Toleb 09:15-13:30":
    - button "Area23 ProjectJ Toleb 09:15-13:30":
      - strong: Area23 ProjectJ Toleb
      - text: 09:15-13:30
  - button "Add project row for Harry Hughes"
  - button "Expand Harry Hughes"
  - strong: Harry Hughes
  - text: Manager
  - button
  - button "Add project row for Tom Amrose"
  - button "Expand Tom Amrose"
  - strong: Tom Amrose
  - text: Artist
  - button
  - button "Add project row for Aryaan Arora"
  - button "Expand Aryaan Arora"
  - strong: Aryaan Arora
  - text: Artist
  - button
  - button "Add project row for Billy Towsend"
  - button "Expand Billy Towsend"
  - strong: Billy Towsend
  - text: Artist
  - button
  - region "Calendar legend": Pending holiday Confirmed holiday Pending sick Confirmed sick UK bank holiday Overbooked Selected date
  - button "day"
  - button "week"
  - button "month"
  - button "year"
  - button "Previous day"
  - textbox "Selected date": 2026-05-15
  - button "Next day"
  - complementary "Allocation editor":
    - heading "selected time" [level=2]
    - paragraph: Edit selected segment mode
    - region "Time segments":
      - article:
        - text: Project
        - combobox "Project Using selected project rows" [disabled]:
          - option "Area23 ProjectJ Toleb" [selected]
          - option "Havas Redemplo"
          - option "TheShipyard MammothLakes"
          - option "Calcium Xcopri"
          - option "Envarsis KidneyFlower"
          - option "CultHealth QuickPitch"
          - option "RocAero"
          - option "Ddomain"
          - option "Internal BotoxSofa"
          - option "fcbhealth abbvie Lymphoma"
          - option "Novartis Novartis"
          - option "Bexsero Retouch Project"
          - option "Vijoice KikiCharacter"
          - option "DDBHealth New Welireg Project"
          - option "Area23 Jemperli Grassbirds"
          - option "moonrabbit oxervate papereyes"
        - text: Using selected project rows Start
        - textbox "Start time 1": 09:15
        - text: End
        - textbox "End time 1": 13:30
        - text: Duration
        - spinbutton "Duration 1": "4.25"
        - text: Status
        - combobox "Status":
          - option "Planned" [selected]
          - option "Queued"
          - option "Active"
          - option "Blocked"
          - option "Done"
        - text: Notes
        - textbox "Notes"
        - region "Attach deliverables":
          - heading "attach deliverables" [level=2]
          - button "Select deliverables"
        - button "Delete"
    - button "Add segment"
    - paragraph: 0 deliverables attached
    - button "Update selected segments"
```

# Test source

```ts
  1522 | 
  1523 |   await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveAttribute('aria-label', /9h allocated/);
  1524 |   await expect(page.getByTestId('calendar-project-cell-person-manager-novartis-novartis-2026-05-04')).toContainText('4h');
  1525 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).toContainText('5h');
  1526 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('5h');
  1527 |   await expect(page.getByTestId('calendar-project-cell-person-artist-a-bexsero-retouch-project-2026-05-05')).toContainText('5h');
  1528 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).not.toContainText('Bexsero Retouch Project');
  1529 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-04')).not.toContainText('BEXRET');
  1530 |   await expect(page.getByTestId('calendar-cell-person-manager-2026-05-04')).toHaveClass(/is-over/);
  1531 |   await expect(page.getByTestId('calendar-task-due-task-bexsero-retouch')).toHaveText('2026-05-06');
  1532 | 
  1533 |   await page.getByRole('button', { name: /Deliverables/ }).click();
  1534 |   await expect(page.getByTestId('task-row-task-bexsero-retouch')).toContainText('2026-05-06');
  1535 | });
  1536 | 
  1537 | test('selected cells can append multiple timed segments to week cells', async ({ page }) => {
  1538 |   await openCalendar(page, 'Allocation');
  1539 |   await page.getByLabel('Selected date').fill('2026-05-05');
  1540 |   await page.getByTestId('calendar-cell-person-manager-2026-05-06').click();
  1541 |   await page.getByLabel('Project').last().selectOption('bexsero-retouch-project');
  1542 |   await page.getByLabel('Start time 1').fill('09:00');
  1543 |   await page.getByLabel('End time 1').fill('10:30');
  1544 |   await page.getByRole('button', { name: 'Add segment' }).click();
  1545 |   await page.getByLabel('Start time 2').fill('14:00');
  1546 |   await page.getByLabel('End time 2').fill('15:15');
  1547 |   await expect(page.getByTestId('selected-time-total')).toHaveCount(0);
  1548 |   await page.getByRole('button', { name: 'Apply allocation' }).click();
  1549 |   await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  1550 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').locator('.allocation-band')).toHaveText(['1.5h', '1.25h']);
  1551 |   await expect(page.getByTestId('calendar-summary-bands-person-manager-2026-05-06').locator('.allocation-band')).toHaveCount(2);
  1552 | });
  1553 | 
  1554 | test('selecting an allocated project cell loads all segments and replaces that cell', async ({ page }) => {
  1555 |   await openCalendar(page, 'Allocation');
  1556 |   await page.getByLabel('Selected date').fill('2026-05-05');
  1557 |   await page.getByRole('button', { name: 'Expand Ben Hall' }).click();
  1558 |   await page.getByRole('button', { name: 'Add project row for Ben Hall' }).click();
  1559 |   await page.getByRole('button', { name: 'Pick project' }).click();
  1560 |   await page.getByRole('button', { name: 'Bexsero Retouch Project' }).click();
  1561 | 
  1562 |   await page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').click();
  1563 |   await page.getByLabel('Start time 1').fill('09:00');
  1564 |   await page.getByLabel('End time 1').fill('10:30');
  1565 |   await page.getByRole('button', { name: 'Add segment' }).click();
  1566 |   await page.getByLabel('Start time 2').fill('14:00');
  1567 |   await page.getByLabel('End time 2').fill('15:15');
  1568 |   await page.getByRole('button', { name: 'Apply allocation' }).click();
  1569 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').locator('.allocation-band')).toHaveText(['1.5h', '1.25h']);
  1570 | 
  1571 |   await page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06').click();
  1572 |   await expect(page.getByTestId('allocation-editor-mode')).toHaveText('Replace cell mode');
  1573 |   await expect(page.getByTestId('segment-editor-row-0')).toBeVisible();
  1574 |   await expect(page.getByTestId('segment-editor-row-1')).toBeVisible();
  1575 |   await page.getByTestId('segment-editor-row-1').getByRole('button', { name: 'Delete' }).click();
  1576 |   await page.getByLabel('Duration 1').fill('1');
  1577 |   await page.getByRole('button', { name: 'Replace allocation' }).click();
  1578 | 
  1579 |   await expect(page.getByTestId('calendar-project-cell-person-manager-bexsero-retouch-project-2026-05-06')).toContainText('1h');
  1580 |   await expect(page.getByTestId('calendar-summary-bands-person-manager-2026-05-06').locator('.allocation-band')).toHaveCount(1);
  1581 | });
  1582 | 
  1583 | test('day view supports snapped block creation, selected date marker, context delete, and pane sync', async ({ page }) => {
  1584 |   await page.getByRole('button', { name: /Settings/ }).click();
  1585 |   await page.getByLabel('Timezone').fill('UTC');
  1586 |   await openCalendar(page, 'Allocation');
  1587 |   await page.getByRole('button', { name: 'day' }).click();
  1588 |   await page.getByLabel('Selected date').fill('2026-05-14');
  1589 |   await expect(page.getByTestId('current-time-marker')).toHaveCount(0);
  1590 |   await expect(page.getByTestId('selected-date-overlay-2026-05-14').first()).toBeVisible();
  1591 |   await page.getByLabel('Selected date').fill('2026-05-15');
  1592 | 
  1593 |   const row = page.getByTestId('day-row-person-manager-2026-05-15');
  1594 |   const dragBox = await row.evaluate((element) => {
  1595 |     const rowBox = element.getBoundingClientRect();
  1596 |     const timeline = element.closest('.calendar-timeline') as HTMLElement;
  1597 |     const timelineBox = timeline.getBoundingClientRect();
  1598 |     const labelWidth = timeline.querySelector<HTMLElement>('.calendar-corner')?.getBoundingClientRect().width ?? 0;
  1599 |     const contentWidth = timeline.clientWidth - labelWidth;
  1600 |     return {
  1601 |       endX: timelineBox.left + labelWidth + 1 + contentWidth * 0.125,
  1602 |       startX: timelineBox.left + labelWidth + 1,
  1603 |       y: rowBox.top + 20,
  1604 |     };
  1605 |   });
  1606 |   await page.mouse.move(dragBox.startX, dragBox.y);
  1607 |   await page.mouse.down();
  1608 |   await page.mouse.move(dragBox.endX, dragBox.y);
  1609 |   await page.mouse.up();
  1610 | 
  1611 |   const block = page.locator('[data-testid^="allocation-block-alloc-local-"]').last();
  1612 |   await expect(block).toBeVisible();
  1613 |   await expect(page.getByLabel('Start time 1')).toHaveValue('09:15');
  1614 |   await expect(page.getByLabel('End time 1')).toHaveValue('10:15');
  1615 |   await block.click();
  1616 |   await expect(page.getByTestId('allocation-editor-mode')).toHaveText('Edit selected segment mode');
  1617 |   await page.getByLabel('End time 1').fill('13:30');
  1618 |   await page.getByRole('button', { name: 'Update selected segments' }).click();
  1619 |   await expect(block).toContainText('09:15-13:30');
  1620 | 
  1621 |   await block.click({ button: 'right' });
> 1622 |   await expect(page.getByTestId('allocation-context-menu')).toBeVisible();
       |                                                             ^ Error: expect(locator).toBeVisible() failed
  1623 |   await page.getByTestId('allocation-context-menu').getByRole('button', { name: 'Delete' }).click();
  1624 |   await expect(block).not.toBeVisible();
  1625 | });
  1626 | 
```