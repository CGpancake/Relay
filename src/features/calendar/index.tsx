import { CalendarView } from '../../components/CalendarView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';
import type { CalendarMode } from '../../types';

export function CalendarFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];
  const activeProjects = state.projects.filter((project) => !project.archivedAt);

  return (
    <CalendarView
      allocations={state.allocations}
      calendarDayWindow={state.calendarDayWindow}
      calendarOverlays={state.calendarOverlays}
      currentUser={currentUser}
      initialMode={modeFromUrl()}
      people={state.people}
      projects={activeProjects}
      setAllocations={actions.setAllocations}
      setTasks={actions.setTasks}
      setTimeOff={actions.setBookings}
      tasks={state.tasks}
      timeOff={state.bookings}
      timezone={state.timezone}
    />
  );
}

function modeFromUrl(): CalendarMode {
  const pathMode = legacyModeFromPath(window.location.pathname);
  if (pathMode) return pathMode;
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'time-off' || mode === 'milestones' || mode === 'allocation' ? mode : 'allocation';
}

function legacyModeFromPath(pathname: string): CalendarMode | null {
  if (pathname === '/bookings') return 'time-off';
  if (pathname === '/goals') return 'milestones';
  if (pathname === '/allocation') return 'allocation';
  return null;
}
