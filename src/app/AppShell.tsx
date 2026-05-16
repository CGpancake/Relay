import React from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StudioLogo } from '../components/StudioLogo';
import { themes, themeStyle } from '../themes';
import type { ViewId } from '../types';
import { useAppState } from './AppStateContext';
import { useAppActions } from './useAppActions';
import { viewFromPath, views } from './views';

export function AppShell() {
  const state = useAppState();
  const actions = useAppActions();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [activeView, setActiveView] = React.useState<ViewId>(() => viewFromPath(window.location.pathname));

  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];
  const activeTheme = themes.find((theme) => theme.id === state.themeId) ?? themes[0];
  const unreadNotifications = state.notifications.filter((notification) => !notification.read).length;
  const activeViewModule = views.find((view) => view.id === activeView) ?? views.find((view) => view.id === 'tasks') ?? views[0];
  const ActiveComponent = activeViewModule.Component;

  React.useEffect(() => {
    const nextPath = activeView === 'calendar' ? calendarPathFromCurrentUrl() : activeView === 'tasks' ? '/deliverables' : `/${activeView}`;
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [activeView]);

  React.useEffect(() => {
    if (!activeViewModule.canAccess(currentUser)) {
      const firstAccessible = views.find((view) => view.canAccess(currentUser))?.id ?? 'tasks';
      setActiveView(firstAccessible);
    }
  }, [activeViewModule, currentUser]);

  return (
    <main
      className={`relay-shell theme-${activeTheme.id} ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}
      data-theme={activeTheme.id}
      style={themeStyle(activeTheme, state.accentKey)}
    >
      <header className="app-header">
        <button className="app-brand" aria-label="Alongside Global RELAY" onClick={() => setSidebarCollapsed(false)} type="button">
          <StudioLogo id="alongside" title="Alongside Global" className="brand-logo" />
          <span className="sr-only">RELAY</span>
        </button>
        <div className="app-notifications">
          <button
            aria-label="Notifications"
            className="icon-button"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              actions.markNotificationsRead();
            }}
            type="button"
          >
            <Bell size={16} aria-hidden="true" />
            {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
          </button>
          {notificationsOpen && (
            <section className="notification-panel" aria-label="Deliverable notifications">
              {state.notifications.length === 0 ? (
                <p>No deliverable updates</p>
              ) : (
                state.notifications.map((notification) => (
                  <article key={notification.id}>
                    <strong>{notification.message}</strong>
                    <span>
                      {notification.actor} / {notification.date}
                    </span>
                  </article>
                ))
              )}
            </section>
          )}
        </div>
      </header>
      <aside className="sidebar" aria-label="Primary navigation">
        <button
          aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="sidebar-collapse"
          onClick={(event) => {
            event.stopPropagation();
            setSidebarCollapsed((collapsed) => !collapsed);
          }}
          type="button"
        >
          {sidebarCollapsed ? <ChevronRight size={14} aria-hidden="true" /> : <ChevronLeft size={14} aria-hidden="true" />}
        </button>
        <div className="sidebar-inner">
          <section>
            <h2>views</h2>
            {views.map((view) => {
              const Icon = view.icon;
              const accessible = view.canAccess(currentUser);
              return (
                <button
                  aria-label={sidebarCollapsed ? view.label : undefined}
                  className={activeView === view.id ? 'is-active' : ''}
                  disabled={!accessible}
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id);
                    if (view.id === 'calendar') {
                      window.history.replaceState(null, '', '/calendar?mode=allocation');
                    }
                  }}
                  title={view.label}
                  type="button"
                >
                  <Icon size={14} aria-hidden />
                  <span>{view.label}</span>
                  {!accessible && <small>locked</small>}
                </button>
              );
            })}
          </section>
          <section className="identity">
            <h2>user</h2>
            <p>{currentUser.name}</p>
            <span>{currentUser.role}</span>
          </section>
        </div>
      </aside>
      <div className="content">
        <ErrorBoundary key={activeView} label={activeViewModule.label}>
          <ActiveComponent />
        </ErrorBoundary>
      </div>
    </main>
  );
}

function calendarPathFromCurrentUrl() {
  if (window.location.pathname === '/allocation') return '/calendar?mode=allocation';
  if (window.location.pathname === '/bookings') return '/calendar?mode=time-off';
  if (window.location.pathname === '/goals') return '/calendar?mode=milestones';
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  return `/calendar?mode=${mode === 'time-off' || mode === 'milestones' ? mode : 'allocation'}`;
}
