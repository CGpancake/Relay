import { CalendarView } from '../../components/CalendarView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function AllocationFeatureView() {
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
      initialMode="allocation"
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
