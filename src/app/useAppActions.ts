import React from 'react';
import type { Allocation, Booking, CalendarDayWindowSettings, CalendarOverlaySettings, Person, Project, Task } from '../types';
import { useAppDispatch, useAppState } from './AppStateContext';

export function useAppActions() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];

  const today = () => new Date().toISOString().slice(0, 10);

  return React.useMemo(
    () => ({
      setPeople: (updater: React.SetStateAction<Person[]>) => dispatch({ type: 'people/set', updater }),
      setProjects: (updater: React.SetStateAction<Project[]>) => dispatch({ type: 'projects/set', updater }),
      setTasks: (updater: React.SetStateAction<Task[]>) => dispatch({ type: 'tasks/set', updater }),
      setAllocations: (updater: React.SetStateAction<Allocation[]>) => dispatch({ type: 'allocations/set', updater }),
      setBookings: (updater: React.SetStateAction<Booking[]>) => dispatch({ type: 'bookings/set', updater }),
      setThemeId: (themeId: string) => dispatch({ type: 'theme/changed', themeId }),
      setAccentKey: (accentKey: string) => dispatch({ type: 'accent/changed', accentKey }),
      setCurrentPersonId: (personId: string) => dispatch({ type: 'current-user/changed', personId }),
      setTimezone: (timezone: string) => dispatch({ type: 'timezone/changed', timezone }),
      setCalendarOverlays: (overlays: CalendarOverlaySettings) => dispatch({ type: 'calendar-overlays/changed', overlays }),
      setCalendarDayWindow: (settings: CalendarDayWindowSettings) => dispatch({ type: 'calendar-day-window/changed', settings }),
      markNotificationsRead: () => dispatch({ type: 'notifications/set', updater: (current) => current.map((item) => ({ ...item, read: true })) }),
      notifyTaskFollowers: (task: Task, message: string) =>
        dispatch({
          type: 'notifications/set',
          updater: (current) => [
            {
              id: `notification-${current.length + 1}`,
              taskId: task.id,
              actor: currentUser.name,
              date: today(),
              message,
              read: false,
            },
            ...current,
          ],
        }),
      archiveTask: (taskId: string, message = 'Task archived') =>
        dispatch({ type: 'task/archived', taskId, archivedAt: today(), actor: currentUser.name, message }),
      archiveSubtask: (taskId: string, subtaskId: string) =>
        dispatch({ type: 'subtask/archived', taskId, subtaskId, archivedAt: today(), actor: currentUser.name }),
      archiveProject: (projectId: string) => dispatch({ type: 'project/archived', projectId, archivedAt: today(), actor: currentUser.name }),
      restoreProject: (projectId: string) => dispatch({ type: 'project/restored', projectId, actor: currentUser.name }),
      restoreTask: (taskId: string) => dispatch({ type: 'task/restored', taskId, actor: currentUser.name }),
    }),
    [currentUser.name, dispatch],
  );
}
