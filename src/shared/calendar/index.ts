import type React from 'react';
import { addDays, daysInMonth, formatDate, startOfMonth, startOfWeek } from '../../lib/date';
import type { AllocationSelectionCell, AllocationView, CalendarDayWindowSettings } from '../../types';

export const DEFAULT_SNAP_MINUTES = 15;
export const DEFAULT_DAY_MINUTES = 24 * 60;
export const DEFAULT_DAY_WINDOW_SETTINGS: CalendarDayWindowSettings = { pastHours: 2, upcomingHours: 10 };
export const WEEK_DAY_COLUMN_WIDTH = 112;
export const MONTH_DAY_COLUMN_WIDTH = WEEK_DAY_COLUMN_WIDTH / 4;
export const YEAR_MONTH_COLUMN_WIDTH = 112;
export type VisibleDayWindow = { startMinute: number; endMinute: number };
export type DateMinute = { date: string; minuteOfDay: number };
export type BufferedCalendarRange = { dates: string[]; currentStart: number; currentEnd: number };
export type TimelineCenterCoordinate = { date: string; fraction: number };

export function datesForView(view: AllocationView, selectedDate: string) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  if (view === 'day') {
    return [selectedDate];
  }
  if (view === 'week') {
    const start = startOfWeek(selected);
    return Array.from({ length: 7 }, (_, index) => formatDate(addDays(start, index)));
  }
  if (view === 'month') {
    const start = startOfMonth(selected);
    return Array.from({ length: daysInMonth(selected) }, (_, index) => formatDate(addDays(start, index)));
  }
  return Array.from({ length: 12 }, (_, index) => formatDate(new Date(selected.getFullYear(), index, 1)));
}

export function bufferedDatesForView(view: AllocationView, selectedDate: string): BufferedCalendarRange {
  const previous = datesForView(view, shiftDateByView(selectedDate, view, -1));
  const current = datesForView(view, selectedDate);
  const next = datesForView(view, shiftDateByView(selectedDate, view, 1));
  return {
    dates: [...previous, ...current, ...next],
    currentStart: previous.length,
    currentEnd: previous.length + current.length,
  };
}

export function compactColumnWidthForView(view: AllocationView) {
  if (view === 'month') return MONTH_DAY_COLUMN_WIDTH;
  if (view === 'year') return YEAR_MONTH_COLUMN_WIDTH;
  return WEEK_DAY_COLUMN_WIDTH;
}

export function centeredDateFromTimeline(
  view: AllocationView,
  dates: string[],
  scrollLeft: number,
  clientWidth: number,
  labelWidth: number,
  columnWidth: number,
) {
  if (dates.length === 0) return null;
  if (view === 'day') {
    const centerMinute = (scrollLeft + clientWidth / 2 - labelWidth) / Math.max(columnWidth, 1);
    return absoluteMinuteToDateMinute(dates[0], centerMinute).date;
  }
  const centerX = scrollLeft + clientWidth / 2 - labelWidth;
  const index = Math.max(0, Math.min(dates.length - 1, Math.floor(centerX / Math.max(columnWidth, 1))));
  return view === 'year' ? `${dates[index].slice(0, 7)}-01` : dates[index];
}

export function centeredTimelineCoordinate(
  view: AllocationView,
  dates: string[],
  scrollLeft: number,
  clientWidth: number,
  labelWidth: number,
  columnWidth: number,
): TimelineCenterCoordinate | null {
  if (dates.length === 0) return null;
  const centerX = scrollLeft + clientWidth / 2 - labelWidth;
  const rawIndex = centerX / Math.max(columnWidth, 1);
  const index = Math.max(0, Math.min(dates.length - 1, Math.floor(rawIndex)));
  const fraction = Math.max(0, Math.min(0.999999, rawIndex - Math.floor(rawIndex)));
  return {
    date: view === 'year' ? `${dates[index].slice(0, 7)}-01` : dates[index],
    fraction,
  };
}

export function scrollLeftForTimelineCoordinate(
  view: AllocationView,
  dates: string[],
  coordinate: TimelineCenterCoordinate,
  clientWidth: number,
  labelWidth: number,
  columnWidth: number,
) {
  const targetIndex = dates.findIndex((date) => (view === 'year' ? date.slice(0, 7) === coordinate.date.slice(0, 7) : date === coordinate.date));
  if (targetIndex < 0) return null;
  return labelWidth + (targetIndex + coordinate.fraction) * columnWidth - clientWidth / 2;
}

export function bufferedDayWindow(window: VisibleDayWindow): VisibleDayWindow {
  return { startMinute: window.startMinute - DEFAULT_DAY_MINUTES, endMinute: window.endMinute + DEFAULT_DAY_MINUTES };
}

export function shiftDateByView(selectedDate: string, view: AllocationView, direction: -1 | 1) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  if (view === 'day') {
    return formatDate(addDays(selected, direction));
  }
  if (view === 'week') {
    return formatDate(addDays(selected, direction * 7));
  }
  if (view === 'month') {
    selected.setMonth(selected.getMonth() + direction);
    return formatDate(selected);
  }
  selected.setFullYear(selected.getFullYear() + direction);
  return formatDate(selected);
}

export function dateMatchesView(itemDate: string, date: string, view: AllocationView) {
  return view === 'year' ? itemDate.startsWith(date.slice(0, 7)) : itemDate === date;
}

export function minuteFromPointer(event: React.PointerEvent, snapMinutes = DEFAULT_SNAP_MINUTES, dayMinutes = DEFAULT_DAY_MINUTES) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  return clampMinute((x / rect.width) * dayMinutes, snapMinutes, dayMinutes);
}

export function minuteFromPointerInWindow(event: React.PointerEvent, window: VisibleDayWindow, snapMinutes = DEFAULT_SNAP_MINUTES) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const minute = window.startMinute + (x / Math.max(rect.width, 1)) * visibleWindowDuration(window);
  return snapAbsoluteMinute(Math.max(window.startMinute, Math.min(window.endMinute, minute)), snapMinutes);
}

export function blockStyle(startMinute: number, endMinute: number, dayMinutes = DEFAULT_DAY_MINUTES) {
  const start = Math.min(startMinute, endMinute);
  const end = Math.max(startMinute, endMinute);
  return {
    left: `${(start / dayMinutes) * 100}%`,
    width: `${Math.max(1, ((end - start) / dayMinutes) * 100)}%`,
  } as React.CSSProperties;
}

export function visibleBlockStyle(startMinute: number, endMinute: number, window: VisibleDayWindow) {
  const clipped = clipMinutesToWindow(startMinute, endMinute, window);
  if (!clipped) return { display: 'none' } as React.CSSProperties;
  return {
    left: `${minuteToWindowPercent(clipped.startMinute, window)}%`,
    right: 'auto',
    width: `${Math.max(1, ((clipped.endMinute - clipped.startMinute) / visibleWindowDuration(window)) * 100)}%`,
  } as React.CSSProperties;
}

export function computeVisibleDayWindow(
  selectedDate: string,
  today: string,
  nowMinute: number,
  settings: CalendarDayWindowSettings = DEFAULT_DAY_WINDOW_SETTINGS,
): VisibleDayWindow {
  void selectedDate;
  void today;
  void nowMinute;
  void settings;
  return { startMinute: 0, endMinute: DEFAULT_DAY_MINUTES };
}

export function minuteToWindowPercent(minute: number, window: VisibleDayWindow) {
  return ((Math.max(window.startMinute, Math.min(window.endMinute, minute)) - window.startMinute) / visibleWindowDuration(window)) * 100;
}

export function clipMinutesToWindow(startMinute: number, endMinute: number, window: VisibleDayWindow) {
  const start = Math.max(Math.min(startMinute, endMinute), window.startMinute);
  const end = Math.min(Math.max(startMinute, endMinute), window.endMinute);
  return end > start ? { startMinute: start, endMinute: end } : null;
}

export function absoluteMinuteToDateMinute(selectedDate: string, absoluteMinute: number): DateMinute {
  const dayOffset = Math.floor(absoluteMinute / DEFAULT_DAY_MINUTES);
  const minuteOfDay = absoluteMinute - dayOffset * DEFAULT_DAY_MINUTES;
  return { date: formatDate(addDays(new Date(`${selectedDate}T00:00:00`), dayOffset)), minuteOfDay };
}

export function dateMinuteToAbsoluteMinute(selectedDate: string, date: string, minuteOfDay: number) {
  return dateOffset(selectedDate, date) * DEFAULT_DAY_MINUTES + minuteOfDay;
}

export function clipDateMinuteRangeToVisibleWindow(
  selectedDate: string,
  date: string,
  startMinute: number,
  endMinute: number,
  window: VisibleDayWindow,
) {
  return clipMinutesToWindow(
    dateMinuteToAbsoluteMinute(selectedDate, date, startMinute),
    dateMinuteToAbsoluteMinute(selectedDate, date, endMinute),
    window,
  );
}

export function visibleWindowDuration(window: VisibleDayWindow) {
  return Math.max(DEFAULT_SNAP_MINUTES, window.endMinute - window.startMinute);
}

export function zonedNow(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      month: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    }).formatToParts(new Date());
    const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
    return {
      date: `${value('year')}-${value('month')}-${value('day')}`,
      minute: Number(value('hour')) * 60 + Number(value('minute')),
    };
  } catch {
    const now = new Date();
    return { date: formatDate(now), minute: now.getHours() * 60 + now.getMinutes() };
  }
}

export function sameSelectionCell(a: AllocationSelectionCell, b: AllocationSelectionCell) {
  return a.personId === b.personId && a.date === b.date && a.rowType === b.rowType && a.projectId === b.projectId && a.allocationId === b.allocationId;
}

export function toggleSelectionCell(selection: AllocationSelectionCell[], cell: AllocationSelectionCell) {
  return selection.some((selected) => sameSelectionCell(selected, cell))
    ? selection.filter((selected) => !sameSelectionCell(selected, cell))
    : [...selection, cell];
}

export function clampMinute(value: number, snapMinutes = DEFAULT_SNAP_MINUTES, dayMinutes = DEFAULT_DAY_MINUTES) {
  return Math.max(0, Math.min(dayMinutes, Math.round(value / snapMinutes) * snapMinutes));
}

export function snapAbsoluteMinute(value: number, snapMinutes = DEFAULT_SNAP_MINUTES) {
  return Math.round(value / snapMinutes) * snapMinutes;
}

function dateOffset(baseDate: string, date: string) {
  const base = Date.parse(`${baseDate}T00:00:00Z`);
  const target = Date.parse(`${date}T00:00:00Z`);
  return Math.round((target - base) / (24 * 60 * 60 * 1000));
}
