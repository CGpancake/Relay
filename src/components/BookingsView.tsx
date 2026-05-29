import React from 'react';
import { monthLabel, shortDate } from '../lib/date';
import { canApproveBookings } from '../lib/permissions';
import { blockStyle, dateMatchesView, DEFAULT_DAY_MINUTES, DEFAULT_SNAP_MINUTES, minuteFromPointer } from '../shared/calendar';
import { CalendarToolbar } from '../shared/calendar/CalendarToolbar';
import { useCalendarState } from '../shared/calendar/useCalendarState';
import type { Allocation, AllocationSelectionCell, AllocationView as BookingViewMode, Booking, BookingStatus, BookingType, Person, Project } from '../types';
import { allocationsFor, colorForProject, durationMinutes } from './calendar/calendarUtils';
import { applyTimeOffOperation, hasTimeOffOverlap, normalizeTimeOffEntry, setTimeOffStatus } from '../features/calendar/timeOffModel';

const SNAP_MINUTES = DEFAULT_SNAP_MINUTES;
const DAY_MINUTES = DEFAULT_DAY_MINUTES;

type DragState =
  | { kind: 'create'; personId: string; date: string; startMinute: number; endMinute: number }
  | { kind: 'move'; bookingId: string; originMinute: number; originalStart: number; originalEnd: number }
  | { kind: 'resize-start' | 'resize-end'; bookingId: string; originalStart: number; originalEnd: number };

const sameCell = (a: AllocationSelectionCell, b: AllocationSelectionCell) =>
  a.personId === b.personId && a.date === b.date && a.rowType === b.rowType && a.allocationId === b.allocationId;

export function BookingsView({
  bookings,
  currentUser,
  allocations = [],
  people,
  projects = [],
  setBookings,
  timezone,
}: {
  allocations?: Allocation[];
  bookings: Booking[];
  currentUser: Person;
  people: Person[];
  projects?: Project[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  timezone: string;
}) {
  const [type, setType] = React.useState<BookingType>('holiday');
  const [timeMode, setTimeMode] = React.useState<'full-day' | 'hourly'>('full-day');
  const [startMinute, setStartMinute] = React.useState(9 * 60);
  const [endMinute, setEndMinute] = React.useState(13 * 60);
  const [dragState, setDragState] = React.useState<DragState | null>(null);
  const [validationMessage, setValidationMessage] = React.useState('');
  const defaultStatus: BookingStatus = 'pending';
  const canApprove = canApproveBookings(currentUser);

  const visiblePeople = React.useMemo(() => {
    if (currentUser.permissionLevel === 'Artist') {
      return people.filter((person) => person.id === currentUser.id);
    }
    return people;
  }, [currentUser, people]);

  const cal = useCalendarState({ timezone, people, initialView: 'week' });
  const { view, setView, selectedDate, setSelectedDate, shiftSelectedDate, dates, today, now, selection, setSelection, setAnchor, selectCell } = cal;

  const visibleBookingCount = bookings.filter((booking) => visiblePeople.some((person) => person.id === booking.personId)).length;

  const selectBooking = (booking: Booking, event: React.MouseEvent) => {
    event.stopPropagation();
    const cell = { personId: booking.personId, date: booking.date, rowType: 'summary' as const, allocationId: booking.id };
    setSelection([cell]);
    setAnchor(cell);
    setType(booking.type);
    setTimeMode(booking.startMinute === 0 && booking.endMinute === DAY_MINUTES ? 'full-day' : 'hourly');
    setStartMinute(booking.startMinute);
    setEndMinute(booking.endMinute);
  };

  const selectBookingGroup = (cellBookings: Booking[], event: React.MouseEvent) => {
    event.stopPropagation();
    if (cellBookings.length === 0) return;
    const cells = cellBookings.map((booking) => ({
      personId: booking.personId,
      date: booking.date,
      rowType: 'summary' as const,
      allocationId: booking.id,
    }));
    const first = cellBookings[0];
    setSelection(cells);
    setAnchor(cells[0]);
    setType(first.type);
    setTimeMode(first.startMinute === 0 && first.endMinute === DAY_MINUTES ? 'full-day' : 'hourly');
    setStartMinute(first.startMinute);
    setEndMinute(first.endMinute);
    setValidationMessage('');
  };

  const selectedBookings = selection
    .map((cell) => cell.allocationId)
    .filter(Boolean)
    .map((id) => bookings.find((booking) => booking.id === id))
    .filter(Boolean) as Booking[];

  const applyBooking = () => {
    setValidationMessage('');
    const nextStart = timeMode === 'full-day' ? 0 : startMinute;
    const nextEnd = timeMode === 'full-day' ? DAY_MINUTES : endMinute;
    const result = applyTimeOffOperation({
      entries: bookings,
      selection,
      type,
      startMinute: nextStart,
      endMinute: nextEnd,
      defaultStatus,
      idPrefix: 'booking-local',
      summaryOnly: false,
    });
    if (!result.ok) {
      if (result.reason === 'overlap') setValidationMessage('Booking overlaps an existing booking for the same person and time range.');
      return;
    }
    setBookings(result.entries);
  };

  const setSelectedBookingStatus = (status: BookingStatus) => {
    if (!canApprove || selectedBookings.length === 0) return;
    setValidationMessage('');
    setBookings((current) => setTimeOffStatus(current, selectedBookings, status));
  };

  const deleteSelection = () => {
    const selectedCells = [...selection];
    setBookings((current) =>
      current.filter(
        (booking) =>
          !selectedCells.some((cell) =>
            cell.allocationId ? cell.allocationId === booking.id : cell.personId === booking.personId && dateMatchesView(booking.date, cell.date, view),
          ),
      ),
    );
    setSelection([]);
  };

  const beginCreate = (personId: string, date: string, event: React.PointerEvent<HTMLElement>) => {
    if (view !== 'day') {
      return;
    }
    const startMinute = minuteFromPointer(event);
    setDragState({ kind: 'create', personId, date, startMinute, endMinute: Math.min(DAY_MINUTES, startMinute + 60) });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCreate = (event: React.PointerEvent<HTMLElement>) => {
    if (dragState?.kind !== 'create') {
      return;
    }
    setDragState({ ...dragState, endMinute: Math.max(SNAP_MINUTES, minuteFromPointer(event)) });
  };

  const endCreate = () => {
    if (dragState?.kind !== 'create') {
      return;
    }
    const booking = normalizeBooking({
      id: `booking-local-${Date.now()}`,
      personId: dragState.personId,
      date: dragState.date,
      startMinute: Math.min(dragState.startMinute, dragState.endMinute),
      endMinute: Math.max(dragState.startMinute + SNAP_MINUTES, dragState.endMinute),
      type,
      status: defaultStatus,
    });
    if (hasBookingOverlap(bookings, booking)) {
      setValidationMessage('Booking overlaps an existing booking for the same person and time range.');
      setDragState(null);
      return;
    }
    setValidationMessage('');
    setBookings((current) => [...current, booking]);
    setSelection([{ personId: booking.personId, date: booking.date, rowType: 'summary', allocationId: booking.id }]);
    setDragState(null);
  };

  const beginBlockDrag = (booking: Booking, kind: 'move' | 'resize-start' | 'resize-end', event: React.PointerEvent) => {
    if (view !== 'day') {
      return;
    }
    event.stopPropagation();
    const cell = { personId: booking.personId, date: booking.date, rowType: 'summary' as const, allocationId: booking.id };
    setSelection([cell]);
    setAnchor(cell);
    setType(booking.type);
    setTimeMode(booking.startMinute === 0 && booking.endMinute === DAY_MINUTES ? 'full-day' : 'hourly');
    setStartMinute(booking.startMinute);
    setEndMinute(booking.endMinute);
    const originMinute = minuteFromPointer(event);
    setDragState({ kind, bookingId: booking.id, originMinute, originalStart: booking.startMinute, originalEnd: booking.endMinute });
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const updateBlockDrag = (event: React.PointerEvent) => {
    if (!dragState || dragState.kind === 'create') {
      return;
    }
    const minute = minuteFromPointer(event);
    setBookings((current) =>
      current.map((booking) => {
        if (booking.id !== dragState.bookingId) {
          return booking;
        }
        if (dragState.kind === 'move') {
          const duration = dragState.originalEnd - dragState.originalStart;
          const nextStart = Math.max(0, Math.min(DAY_MINUTES - duration, dragState.originalStart + minute - dragState.originMinute));
          return { ...booking, startMinute: nextStart, endMinute: nextStart + duration };
        }
        if (dragState.kind === 'resize-start') {
          return { ...booking, startMinute: Math.min(minute, dragState.originalEnd - SNAP_MINUTES) };
        }
        return { ...booking, endMinute: Math.max(minute, dragState.originalStart + SNAP_MINUTES) };
      }),
    );
  };

  const endBlockDrag = () => {
    if (!dragState || dragState.kind === 'create') {
      setDragState(null);
      return;
    }
    const normalized = bookings.map(normalizeBooking);
    const draggedBooking = normalized.find((booking) => booking.id === dragState.bookingId);
    if (draggedBooking && hasBookingOverlap(normalized, draggedBooking, [draggedBooking.id])) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === dragState.bookingId
            ? normalizeBooking({ ...booking, startMinute: dragState.originalStart, endMinute: dragState.originalEnd })
            : normalizeBooking(booking),
        ),
      );
      setValidationMessage('Booking overlaps an existing booking for the same person and time range.');
      setDragState(null);
      return;
    }
    setBookings(normalized);
    setDragState(null);
  };

  if (currentUser.permissionLevel === 'Client') {
    return (
      <section className="placeholder-view" aria-label="Bookings locked">
        <p className="eyebrow">Relay / Bookings</p>
        <h1>bookings locked</h1>
      </section>
    );
  }

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Bookings</p>
          <h1>bookings</h1>
        </div>
        <div className="header-stats">
          <span>{visibleBookingCount} blocks</span>
          <span>{timezone}</span>
        </div>
      </section>

      <section className="calendar-layout bookings-calendar-layout" aria-label="Bookings editor">
        <CalendarToolbar
          dateLabel="Booking date"
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setView={setView}
          shiftSelectedDate={shiftSelectedDate}
          view={view}
        />

        <div className="calendar-timeline" data-testid="booking-calendar-timeline">
          {view === 'day' ? (
            <div className="day-timeline" data-testid="booking-day">
              <div className="calendar-person day-label">person</div>
              <div className="day-scale" aria-hidden="true">
                {Array.from({ length: 25 }, (_, hour) => (
                  <span key={hour} style={{ left: `${(hour / 24) * 100}%` }}>
                    {String(hour).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
              {visiblePeople.map((person) => {
                const dayBookings = bookingsFor(bookings, person.id, selectedDate, view).sort((a, b) => a.startMinute - b.startMinute);
                const dayAllocations = allocationsFor(allocations, person.id, selectedDate, 'day').sort((a, b) => a.startMinute - b.startMinute);
                return (
                  <React.Fragment key={person.id}>
                    <div className="calendar-person calendar-summary-person day-person" data-testid={`booking-person-row-${person.id}`}>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.discipline} / {person.role}</small>
                      </span>
                    </div>
                    <div
                      className="day-row"
                      data-testid={`booking-row-${person.id}-${selectedDate}`}
                      onPointerDown={(event) => beginCreate(person.id, selectedDate, event)}
                      onPointerMove={(event) => {
                        moveCreate(event);
                        updateBlockDrag(event);
                      }}
                      onPointerUp={() => {
                        endCreate();
                        endBlockDrag();
                      }}
                    >
                      {selectedDate < today && <span className="past-day-fill" aria-hidden="true" />}
                      {selectedDate === today && (
                        <span className="past-day-fill" style={{ width: `${(now.minute / DAY_MINUTES) * 100}%` }} aria-hidden="true" />
                      )}
                      {dragState?.kind === 'create' && dragState.personId === person.id && (
                        <span className={`booking-block booking-${type} status-${defaultStatus} is-draft`} style={blockStyle(dragState.startMinute, dragState.endMinute)}>
                          {bookingTypeLabel(type)} {timeLabel(Math.min(dragState.startMinute, dragState.endMinute))}-{timeLabel(Math.max(dragState.startMinute, dragState.endMinute))}
                        </span>
                      )}
                      {dayAllocations.map((allocation) => {
                        const project = projects.find((candidate) => candidate.id === allocation.projectId);
                        return (
                          <span
                            aria-hidden="true"
                            className="booking-allocation-context"
                            key={allocation.id}
                            style={{ ...blockStyle(allocation.startMinute, allocation.endMinute), '--project-color': colorForProject(allocation.projectId, projects) } as React.CSSProperties}
                            title={`${project?.name ?? allocation.projectId} ${timeLabel(allocation.startMinute)}-${timeLabel(allocation.endMinute)}`}
                          />
                        );
                      })}
                      {dayBookings.map((booking) => {
                        const selected = selection.some((cell) => cell.allocationId === booking.id);
                        return (
                          <span
                            className={`booking-block booking-${booking.type} status-${booking.status} ${selected ? 'is-selected' : ''}`}
                            data-testid={`booking-block-${booking.type}-${booking.status}`}
                            key={booking.id}
                            onPointerDown={(event) => beginBlockDrag(booking, 'move', event)}
                            style={blockStyle(booking.startMinute, booking.endMinute)}
                          >
                            <span className="resize-handle is-start" onPointerDown={(event) => beginBlockDrag(booking, 'resize-start', event)} />
                            <button type="button" onClick={(event) => selectBooking(booking, event)}>
                              <strong>{bookingTypeLabel(booking.type)}</strong>
                              <small>{booking.status} / {timeLabel(booking.startMinute)}-{timeLabel(booking.endMinute)}</small>
                            </button>
                            <span className="resize-handle is-end" onPointerDown={(event) => beginBlockDrag(booking, 'resize-end', event)} />
                          </span>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className={`calendar-grid calendar-${view}`} style={{ '--calendar-columns': dates.length } as React.CSSProperties}>
              <div className="calendar-corner">person</div>
              {dates.map((date) => (
                <div className={`calendar-date ${date < today ? 'is-past' : ''}`} key={date}>
                  {view === 'year' ? monthLabel(date) : shortDate(date)}
                </div>
              ))}
              {visiblePeople.map((person) => (
                <React.Fragment key={person.id}>
                  <div className="calendar-person calendar-summary-person" data-testid={`booking-person-row-${person.id}`}>
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.discipline} / {person.role}</small>
                    </span>
                  </div>
                  {dates.map((date, dateIndex) => {
                    const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'summary' };
                    const dayBookings = bookingsFor(bookings, person.id, date, view);
                    const dayAllocations = allocationsFor(allocations, person.id, date, view);
                    const totalMinutes = dayAllocations.reduce((sum, allocation) => sum + durationMinutes(allocation), 0);
                    const selected = selection.some((selectionCell) => sameCell(selectionCell, cell));
                    return (
                      <button
                        className={`calendar-cell booking-calendar-cell ${selected ? 'is-selected' : ''} ${date < today ? 'is-past' : ''}`}
                        data-testid={`booking-cell-${person.id}-${date}`}
                        key={date}
                        onClick={(event) => {
                          if (dayBookings.length > 0) {
                            selectBookingGroup(dayBookings, event);
                            return;
                          }
                          selectCell(cell, event);
                          setValidationMessage('');
                        }}
                        type="button"
                      >
                        {dayBookings.map((booking) => (
                          <span
                            aria-hidden="true"
                            className={`booking-overlay booking-${booking.type} status-${booking.status} is-compact ${date < today ? 'is-past-booking' : 'is-future-booking'}`}
                            data-testid={`booking-block-${booking.type}-${booking.status}`}
                            key={booking.id}
                            style={bookingGridOverlayStyle(dates.length, dateIndex)}
                          />
                        ))}
                        {totalMinutes > 0 && <span aria-hidden="true" className="booking-allocation-summary" style={{ width: `${Math.min(100, (totalMinutes / (8 * 60)) * 100)}%` }} />}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <aside className="allocation-editor booking-mark-editor">
          <h2>mark type</h2>
          <p data-testid="booking-selection-count">{selection.length} selected</p>
          <label>
            Type
            <select aria-label="Booking type" value={type} onChange={(event) => setType(event.target.value as BookingType)}>
              <option value="holiday">Holiday</option>
              <option value="sick-leave">Sick leave</option>
            </select>
          </label>
          {selectedBookings.length > 0 && (
            <p data-testid="booking-status-summary">{selectedBookings.map((booking) => booking.status).join(', ')}</p>
          )}
          <div className="toggle-row booking-time-mode" role="group" aria-label="Booking time mode">
            <button className={timeMode === 'full-day' ? 'is-active' : ''} onClick={() => setTimeMode('full-day')} type="button">
              Full day
            </button>
            <button className={timeMode === 'hourly' ? 'is-active' : ''} onClick={() => setTimeMode('hourly')} type="button">
              Hourly
            </button>
          </div>
          {timeMode === 'hourly' && (
            <div className="time-input-grid">
              <label>
                Start
                <select aria-label="Booking start time" value={startMinute} onChange={(event) => setStartMinute(Number(event.target.value))}>
                  {hourOptions().slice(0, -1).map((minute) => (
                    <option key={minute} value={minute}>
                      {timeLabel(minute)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                End
                <select aria-label="Booking end time" value={endMinute} onChange={(event) => setEndMinute(Number(event.target.value))}>
                  {hourOptions().slice(1).map((minute) => (
                    <option key={minute} value={minute}>
                      {timeLabel(minute)}
                    </option>
                  ))}
                </select>
              </label>
              {endMinute <= startMinute && <p role="alert">End must be after start.</p>}
            </div>
          )}
          <button className="primary-action" disabled={selection.length === 0 || (timeMode === 'hourly' && endMinute <= startMinute)} onClick={applyBooking} type="button">
            {selection.some((cell) => cell.allocationId) ? 'Update booking' : 'Apply booking'}
          </button>
          {validationMessage && <p className="access-note" role="alert">{validationMessage}</p>}
          {canApprove && selectedBookings.length > 0 && (
            <div className="segment-actions">
              {selectedBookings.some((booking) => booking.status === 'pending') && (
                <button className="secondary-action" onClick={() => setSelectedBookingStatus('confirmed')} type="button">
                  Confirm
                </button>
              )}
              {selectedBookings.some((booking) => booking.status === 'confirmed') && (
                <button className="secondary-action" onClick={() => setSelectedBookingStatus('pending')} type="button">
                  Revert to pending
                </button>
              )}
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

function bookingsFor(bookings: Booking[], personId: string, date: string, view: BookingViewMode) {
  return bookings.filter((booking) => booking.personId === personId && dateMatchesView(booking.date, date, view));
}

const normalizeBooking = normalizeTimeOffEntry;
const hasBookingOverlap = hasTimeOffOverlap;

function bookingTypeLabel(type: BookingType) {
  return type === 'sick-leave' ? 'Sick leave' : 'Holiday';
}

function timeLabel(minutes: number) {
  const clamped = Math.max(0, Math.min(DAY_MINUTES, Math.round(minutes)));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function hourOptions() {
  return Array.from({ length: 25 }, (_, hour) => hour * 60);
}

function bookingGridOverlayStyle(columnCount: number, dateIndex: number) {
  return {
    '--booking-bg-left': `${dateIndex * -100}%`,
    '--booking-bg-width': `${columnCount * 100}%`,
  } as React.CSSProperties;
}
