import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, CalendarDays, CheckCircle2, ChevronDown, LayoutGrid, ListFilter, LogOut, Plus, Search, Timer, X } from 'lucide-react';
import type { Status, Task } from '@/models';
import { useAuth } from '@/controllers/auth.controller';
import { useWorkspaceController } from '@/controllers/use-workspace-controller';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskForm } from '@/components/task/TaskForm';
import { ActiveTimerBar } from '@/components/timer/ActiveTimerBar';
import { SummaryPanel } from '@/components/summary/SummaryPanel';
import { WeeklyPanel } from '@/components/summary/WeeklyPanel';
import { PriorityDistributionCard } from '@/components/summary/PriorityDistributionCard';
import { HourlyRhythmCard } from '@/components/summary/HourlyRhythmCard';
import { ProductivityScoreCard } from '@/components/summary/ProductivityScoreCard';
import { TaskVelocityCard } from '@/components/summary/TaskVelocityCard';
import { ReminderCenter } from '@/components/reminders/ReminderCenter';
import { LogsPanel } from '@/components/logs/LogsPanel';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { greeting } from '@/utils/format';

type Tab = 'tasks' | 'today' | 'logs';

export function DashboardView() {
  const { user, loading: authLoading, logout } = useAuth();
  const workspace = useWorkspaceController();
  const [tab, setTab] = useState<Tab>('tasks');
  const [modal, setModal] = useState<'create' | Task | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'ALL'>('ALL');

  const filtered = useMemo(() => workspace.tasks.filter((task) =>
    (status === 'ALL' || task.status === status) && `${task.title} ${task.description ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  ), [workspace.tasks, query, status]);

  if (authLoading) return <main className="loading-page"><div className="loading-mark"><Icon icon={Timer} size={28} /></div><p>Opening your workspace…</p></main>;
  if (!user) return <Navigate to="/auth/login" replace />;

  async function removeTask(task: Task) {
    if (window.confirm(`Delete “${task.title}” and all its time logs?`)) await workspace.deleteTask(task.id);
  }

  const navigation = [
    { id: 'tasks' as const, label: 'Tasks', icon: LayoutGrid },
    { id: 'today' as const, label: 'Insights', icon: BarChart3 },
    { id: 'logs' as const, label: 'Time logs', icon: CalendarDays },
  ];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace-content">Skip to workspace</a>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon icon={Timer} size={21} /></span><span>tempo</span></div>
        <nav aria-label="Main navigation">{navigation.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}><Icon icon={item.icon} />{item.label}</button>)}</nav>
        <div className="sidebar-note" aria-hidden="true"><span>Focus edition</span><p>Make time visible.</p></div>
        <div className="sidebar-bottom"><button onClick={() => void logout()}><Icon icon={LogOut} />Sign out</button><div className="user-card"><span>{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></div>
      </aside>

      <main className="workspace" id="workspace-content">
        <header className="workspace-header">
          <div><span className="eyebrow">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span><h1>{greeting()}, {user.name.split(' ')[0]}.</h1><p>{workspace.active ? 'You’re in focus mode. Keep the momentum going.' : 'What deserves your attention today?'}</p></div>
          <div className="header-actions"><ReminderCenter tasks={workspace.tasks} onStartTask={(id) => void workspace.start(id)} onSelectTask={(task) => setModal(task)} /><button className="primary-button add-button" onClick={() => setModal('create')}><Icon icon={Plus} />New task</button></div>
        </header>

        {workspace.error && <div className="error-banner" role="alert"><span>{workspace.error}</span><button className="icon-button" onClick={workspace.clearError} aria-label="Dismiss error"><Icon icon={X} /></button></div>}
        {workspace.loading ? <div className="content-loading" aria-label="Loading workspace"><span /><span /><span /></div> : <>
          {tab === 'tasks' && <section aria-labelledby="tasks-heading"><h2 className="visually-hidden" id="tasks-heading">Tasks</h2><div className="task-toolbar"><div className="search-field"><Icon icon={Search} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks…" aria-label="Search tasks" /></div><div className="filter-field"><Icon icon={ListFilter} /><select value={status} onChange={(event) => setStatus(event.target.value as Status | 'ALL')} aria-label="Filter task status"><option value="ALL">All tasks</option><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select><Icon icon={ChevronDown} size={15} /></div><span className="task-count">{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}</span></div>{filtered.length ? <div className="task-grid">{filtered.map((task) => <TaskCard key={task.id} task={task} active={workspace.active} onStart={() => void workspace.start(task.id)} onEdit={() => setModal(task)} onUpdate={(data) => void workspace.updateTask(task.id, data)} onDelete={() => void removeTask(task)} />)}</div> : <div className="empty-state"><CheckCircle2 /><h3>Nothing in this view</h3><p>Clear the filter or create a task to get moving.</p><button className="secondary-button" onClick={() => setModal('create')}><Icon icon={Plus} />Create a task</button></div>}</section>}
          {tab === 'today' && (
            <div className="insights-stack">
              <SummaryPanel summary={workspace.summary} />
              <ProductivityScoreCard tasks={workspace.tasks} logs={workspace.logs} weekly={workspace.weekly} />
              <WeeklyPanel summary={workspace.weekly} />
              <div className="insights-row">
                <PriorityDistributionCard tasks={workspace.tasks} logs={workspace.logs} />
                <TaskVelocityCard tasks={workspace.tasks} />
              </div>
              <HourlyRhythmCard logs={workspace.logs} />
            </div>
          )}
          {tab === 'logs' && <LogsPanel logs={workspace.logs} onDelete={(id) => { if (window.confirm('Delete this time entry?')) void workspace.deleteLog(id); }} />}
        </>}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.slice(0, 2).map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}><Icon icon={item.icon} /><span>{item.label}</span></button>)}<button className="mobile-add" onClick={() => setModal('create')} aria-label="Create task"><Icon icon={Plus} size={22} /></button><button className={tab === 'logs' ? 'active' : ''} aria-current={tab === 'logs' ? 'page' : undefined} onClick={() => setTab('logs')}><Icon icon={CalendarDays} /><span>Logs</span></button><button onClick={() => void logout()}><Icon icon={LogOut} /><span>Sign out</span></button></nav>
      <ActiveTimerBar active={workspace.active} onStop={() => void workspace.stop()} />
      {modal && <Modal title={modal === 'create' ? 'Create a new task' : 'Edit your task'} description={modal === 'create' ? 'Capture the thought, then shape it into clear work.' : 'Keep the outcome clear and actionable.'} onClose={() => setModal(null)}><TaskForm task={modal === 'create' ? undefined : modal} onCancel={() => setModal(null)} onSubmit={async (data) => { if (modal === 'create') await workspace.createTask(data); else await workspace.updateTask(modal.id, data); setModal(null); }} /></Modal>}
    </div>
  );
}
