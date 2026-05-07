import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  Bell,
  BookOpenText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Handshake,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ArchiveView } from './components/ArchiveView';
import { CalendarView } from './components/CalendarView';
import { DocumentationView } from './components/DocumentationView';
import { PeopleView, SettingsView } from './components/PeopleSettings';
import { ProjectsView } from './components/ProjectsView';
import { StudioLogo } from './components/StudioLogo';
import { TaskView } from './components/TaskView';
import { createSeedAllocations, createSeedPeople, createSeedProjects, createSeedTasks } from './data/seed';
import { canAccess } from './lib/permissions';
import { defaultAccentKey, defaultThemeId, isAccentKey, isThemeId, themes, themeStyle } from './themes';
import type { ArchiveState, Task, TaskNotification, ViewId } from './types';
import './styles.css';

const RELAY_STORAGE_KEY = 'relay:first-slice:ephemeral';
const THEME_STORAGE_KEY = 'relay:theme';
const ACCENT_STORAGE_KEY = 'relay:accent-key';
const CURRENT_PERSON_STORAGE_KEY = 'relay:current-person';

const views: Array<{ id: ViewId; label: string; icon: LucideIcon }> = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'allocation', label: 'Allocation', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'bidding', label: 'Bidding', icon: Handshake },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'documentation', label: 'Documentation', icon: BookOpenText },
  { id: 'people', label: 'People', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function App() {
  const [tasks, setTasks] = React.useState(() => {
    localStorage.setItem(RELAY_STORAGE_KEY, 'seed-reset-on-load');
    return createSeedTasks();
  });
  const [projects, setProjects] = React.useState(createSeedProjects);
  const [people, setPeople] = React.useState(createSeedPeople);
  const [allocations, setAllocations] = React.useState(createSeedAllocations);
  const [archive, setArchive] = React.useState<ArchiveState>({ projects: [], tasks: [], subtasks: [], allocations: [] });
  const [notifications, setNotifications] = React.useState<TaskNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [themeId, setThemeIdState] = React.useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(savedTheme) ? savedTheme : defaultThemeId;
  });
  const [accentKey, setAccentKeyState] = React.useState(() => {
    const savedAccentKey = localStorage.getItem(ACCENT_STORAGE_KEY);
    return isAccentKey(savedAccentKey) ? savedAccentKey : defaultAccentKey;
  });
  const [currentPersonId, setCurrentPersonIdState] = React.useState(() => {
    const savedPersonId = localStorage.getItem(CURRENT_PERSON_STORAGE_KEY);
    return savedPersonId ?? 'person-admin';
  });
  const [activeView, setActiveView] = React.useState<ViewId>(() => viewFromPath(window.location.pathname));
  const currentUser = people.find((person) => person.id === currentPersonId) ?? people[0];
  const activeTheme = themes.find((theme) => theme.id === themeId) ?? themes[0];
  const activeProjects = projects.filter((project) => !project.archivedAt);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  React.useEffect(() => {
    if (!people.some((person) => person.id === currentPersonId)) {
      setCurrentPersonIdState(people[0].id);
    }
  }, [currentPersonId, people]);

  React.useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  React.useEffect(() => {
    localStorage.setItem(ACCENT_STORAGE_KEY, accentKey);
  }, [accentKey]);

  React.useEffect(() => {
    localStorage.setItem(CURRENT_PERSON_STORAGE_KEY, currentPersonId);
  }, [currentPersonId]);

  React.useEffect(() => {
    const nextPath = `/${activeView}`;
    if (window.location.pathname !== nextPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [activeView]);

  React.useEffect(() => {
    if (!canAccess(currentUser, activeView)) {
      const firstAccessible = views.find((view) => canAccess(currentUser, view.id))?.id ?? 'tasks';
      setActiveView(firstAccessible);
    }
  }, [activeView, currentUser]);

  const setThemeId = (nextThemeId: string) => {
    if (isThemeId(nextThemeId)) {
      setThemeIdState(nextThemeId);
    }
  };

  const setAccentKey = (nextAccentKey: string) => {
    if (isAccentKey(nextAccentKey)) {
      setAccentKeyState(nextAccentKey);
    }
  };

  const setCurrentPersonId = (personId: string) => {
    setCurrentPersonIdState(personId);
  };

  const notifyTaskFollowers = (task: Task, message: string) => {
    const date = new Date().toISOString().slice(0, 10);
    setNotifications((current) => [
      {
        id: `notification-${current.length + 1}`,
        taskId: task.id,
        actor: currentUser.name,
        date,
        message,
        read: false,
      },
      ...current,
    ]);
  };

  const archiveTask = (taskId: string, message = 'Task archived') => {
    const archivedAt = new Date().toISOString().slice(0, 10);
    setTasks((current) => {
      const task = current.find((candidate) => candidate.id === taskId);
      if (!task) {
        return current;
      }
      const archivedTask = { ...task, archivedAt };
      setArchive((archiveState) => ({ ...archiveState, tasks: [archivedTask, ...archiveState.tasks] }));
      notifyTaskFollowers(task, `${message}: ${task.title}`);
      return current.filter((candidate) => candidate.id !== taskId);
    });
  };

  const archiveSubtask = (taskId: string, subtaskId: string) => {
    const archivedAt = new Date().toISOString().slice(0, 10);
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const subtask = task.subtasks.find((candidate) => candidate.id === subtaskId);
        if (!subtask) {
          return task;
        }
        setArchive((archiveState) => ({
          ...archiveState,
          subtasks: [{ ...subtask, taskId: task.id, taskTitle: task.title, projectId: task.projectId, archivedAt }, ...archiveState.subtasks],
        }));
        notifyTaskFollowers(task, `Subtask archived: ${subtask.title}`);
        return { ...task, subtasks: task.subtasks.filter((candidate) => candidate.id !== subtaskId) };
      }),
    );
  };

  const archiveProject = (projectId: string) => {
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      return;
    }
    const confirmed = window.confirm(`${project.name} will be moved to Archive with its tasks and allocations. It can be restored later.`);
    if (!confirmed) {
      return;
    }
    const archivedAt = new Date().toISOString().slice(0, 10);
    const projectTasks = tasks.filter((task) => task.projectId === projectId).map((task) => ({ ...task, archivedAt }));
    const projectAllocations = allocations.filter((allocation) => allocation.projectId === projectId);
    setArchive((current) => ({
      projects: [{ ...project, archivedAt }, ...current.projects],
      tasks: [...projectTasks, ...current.tasks],
      subtasks: current.subtasks,
      allocations: [...projectAllocations, ...current.allocations],
    }));
    projectTasks.forEach((task) => notifyTaskFollowers(task, `Project archived: ${project.name}`));
    setProjects((current) => current.filter((candidate) => candidate.id !== projectId));
    setTasks((current) => current.filter((task) => task.projectId !== projectId));
    setAllocations((current) => current.filter((allocation) => allocation.projectId !== projectId));
  };

  const restoreProject = (projectId: string) => {
    const project = archive.projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      return;
    }
    const restoredProject = { ...project };
    delete restoredProject.archivedAt;
    const restoredTasks = archive.tasks
      .filter((task) => task.projectId === projectId)
      .map((task) => {
        const restoredTask = { ...task };
        delete restoredTask.archivedAt;
        return restoredTask;
      });
    const restoredAllocations = archive.allocations.filter((allocation) => allocation.projectId === projectId);
    setProjects((current) => [...current, restoredProject]);
    setTasks((current) => [...current, ...restoredTasks]);
    setAllocations((current) => [...current, ...restoredAllocations]);
    setArchive((current) => ({
      projects: current.projects.filter((candidate) => candidate.id !== projectId),
      tasks: current.tasks.filter((task) => task.projectId !== projectId),
      subtasks: current.subtasks,
      allocations: current.allocations.filter((allocation) => allocation.projectId !== projectId),
    }));
    restoredTasks.forEach((task) => notifyTaskFollowers(task, `Project restored: ${project.name}`));
  };

  const restoreTask = (taskId: string) => {
    const task = archive.tasks.find((candidate) => candidate.id === taskId);
    if (!task || archive.projects.some((project) => project.id === task.projectId)) {
      return;
    }
    const restoredTask = { ...task };
    delete restoredTask.archivedAt;
    setTasks((current) => [...current, restoredTask]);
    setArchive((current) => ({ ...current, tasks: current.tasks.filter((candidate) => candidate.id !== taskId) }));
    notifyTaskFollowers(restoredTask, `Task restored: ${restoredTask.title}`);
  };

  return (
    <main
      className={`relay-shell theme-${activeTheme.id} ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}
      data-theme={activeTheme.id}
      style={themeStyle(activeTheme, accentKey)}
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
              setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
            }}
            type="button"
          >
            <Bell size={16} aria-hidden="true" />
            {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
          </button>
          {notificationsOpen && (
            <section className="notification-panel" aria-label="Task notifications">
              {notifications.length === 0 ? (
                <p>No task updates</p>
              ) : (
                notifications.map((notification) => (
                  <article key={notification.id}>
                    <strong>{notification.message}</strong>
                    <span>{notification.actor} / {notification.date}</span>
                  </article>
                ))
              )}
            </section>
          )}
        </div>
      </header>
      <aside className="sidebar" aria-label="Primary navigation" onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}>
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
        <section>
          <h2>views</h2>
          {views.map((view) => {
            const Icon = view.icon;
            const accessible = canAccess(currentUser, view.id);
            return (
              <button
                className={activeView === view.id ? 'is-active' : ''}
                disabled={!accessible}
                key={view.id}
                onClick={() => setActiveView(view.id)}
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
      </aside>
      <div className="content">
        {activeView === 'projects' && (
          <ProjectsView
            currentUser={currentUser}
            onArchiveProject={archiveProject}
            onArchiveTask={archiveTask}
            people={people}
            projects={activeProjects}
            setProjects={setProjects}
            setTasks={setTasks}
            tasks={tasks}
          />
        )}
        {activeView === 'allocation' && (
          <CalendarView
            allocations={allocations}
            currentUser={currentUser}
            people={people}
            projects={activeProjects}
            setAllocations={setAllocations}
            setTasks={setTasks}
            tasks={tasks}
          />
        )}
        {activeView === 'tasks' && (
          <TaskView
            currentUser={currentUser}
            onArchiveSubtask={archiveSubtask}
            onArchiveTask={archiveTask}
            onTaskUpdated={notifyTaskFollowers}
            people={people}
            projects={activeProjects}
            setTasks={setTasks}
            tasks={tasks}
          />
        )}
        {activeView === 'bidding' && <BiddingView />}
        {activeView === 'archive' && <ArchiveView archive={archive} currentUser={currentUser} onRestoreProject={restoreProject} onRestoreTask={restoreTask} />}
        {activeView === 'documentation' && <DocumentationView />}
        {activeView === 'people' && <PeopleView currentUser={currentUser} people={people} setPeople={setPeople} />}
        {activeView === 'settings' && (
          <SettingsView
            accentKey={accentKey}
            currentPersonId={currentPersonId}
            currentUser={currentUser}
            people={people}
            setAccentKey={setAccentKey}
            setCurrentPersonId={setCurrentPersonId}
            setThemeId={setThemeId}
            themeId={themeId}
          />
        )}
      </div>
    </main>
  );
}

function BiddingView() {
  return (
    <section className="placeholder-view" aria-label="Bidding">
      <p className="eyebrow">Relay / Bidding</p>
      <h1>bidding</h1>
    </section>
  );
}

function viewFromPath(pathname: string): ViewId {
  const candidate = pathname.replace('/', '') as ViewId;
  return views.some((view) => view.id === candidate) ? candidate : 'tasks';
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
