import { BookingsView } from '../../components/BookingsView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function BookingsFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];

  return (
    <BookingsView
      allocations={state.allocations}
      bookings={state.bookings}
      currentUser={currentUser}
      people={state.people}
      projects={state.projects.filter((project) => !project.archivedAt)}
      setBookings={actions.setBookings}
      timezone={state.timezone}
    />
  );
}
