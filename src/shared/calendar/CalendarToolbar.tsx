import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AllocationView } from '../../types';

const VIEWS: AllocationView[] = ['day', 'week', 'month', 'year'];

export function CalendarToolbar({
  selectedDate,
  dateLabel = 'Selected date',
  setSelectedDate,
  setView,
  shiftSelectedDate,
  view,
}: {
  selectedDate: string;
  dateLabel?: string;
  setSelectedDate: (date: string) => void;
  setView: (mode: AllocationView) => void;
  shiftSelectedDate: (delta: -1 | 1) => void;
  view: AllocationView;
}) {
  return (
    <div className="toolbar calendar-toolbar">
      {VIEWS.map((mode) => (
        <button className={view === mode ? 'is-active' : ''} key={mode} onClick={() => setView(mode)} type="button">
          {mode}
        </button>
      ))}
      <div className="calendar-nav-row">
        <button aria-label={`Previous ${view}`} onClick={() => shiftSelectedDate(-1)} type="button">
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        <input
          aria-label={dateLabel}
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
        <button aria-label={`Next ${view}`} onClick={() => shiftSelectedDate(1)} type="button">
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
