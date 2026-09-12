import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import type { Task } from '@/models';
import { Icon } from '@/components/ui/Icon';

interface ReminderCenterProps {
  tasks: Task[];
  onStartTask?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
}

interface ToastAlert {
  id: string;
  title: string;
  body: string;
  priority?: string;
  taskId?: string;
}

export function ReminderCenter({ tasks, onStartTask, onSelectTask }: ReminderCenterProps) {
  const supported = typeof Notification !== 'undefined';
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Play gentle modern chime on notification
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Group notifications into meaningful categories
  const { overdueTasks, dueTodayTasks, upcomingReminders, urgentAlerts, totalAlerts } =
    useMemo(() => {
      const now = Date.now();
      const in24h = now + 86_400_000;
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');

      // 1. Overdue tasks
      const overdue = activeTasks.filter(
        (t) => t.dueAt && new Date(t.dueAt).getTime() < now,
      );

      // 2. Due today (but not overdue)
      const dueToday = activeTasks.filter(
        (t) =>
          t.dueAt &&
          new Date(t.dueAt).getTime() >= now &&
          new Date(t.dueAt).getTime() <= todayEnd.getTime(),
      );

      // 3. Upcoming reminders in next 24-48 hours
      const reminders = activeTasks.filter(
        (t) =>
          t.reminderAt &&
          new Date(t.reminderAt).getTime() <= in24h,
      );

      // 4. Urgent / High priority in-progress items
      const urgent = activeTasks.filter(
        (t) =>
          (t.priority === 'HIGH' || (t.priority as string) === 'URGENT') &&
          t.status === 'IN_PROGRESS',
      );

      const uniqueIds = new Set([
        ...overdue.map((t) => t.id),
        ...dueToday.map((t) => t.id),
        ...reminders.map((t) => t.id),
      ]);

      return {
        overdueTasks: overdue,
        dueTodayTasks: dueToday,
        upcomingReminders: reminders,
        urgentAlerts: urgent,
        totalAlerts: uniqueIds.size,
      };
    }, [tasks]);

  // Trigger push notification helper
  const triggerNotification = useCallback((title: string, body: string, priority = 'HIGH', taskId?: string) => {
    playChime();

    // 1. Browser Native Desktop Notification
    if (supported && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`Tempo: ${title}`, {
          body,
          icon: '/favicon.svg',
          tag: `tempo-${Date.now()}`,
        });
        notif.onclick = () => {
          window.focus();
          if (taskId && onStartTask) onStartTask(taskId);
        };
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }

    // 2. In-App Floating Visual Banner Toast
    setActiveToast({ id: String(Date.now()), title, body, priority, taskId });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.title === title ? null : curr));
    }, 6500);
  }, [supported, onStartTask]);

  // Periodic automatic reminder monitor (checks every 30 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const due = upcomingReminders.filter(
        (task) => task.reminderAt && new Date(task.reminderAt).getTime() <= now,
      );

      for (const task of due) {
        const key = `tempo:reminded:${task.id}:${task.reminderAt}`;
        if (localStorage.getItem(key)) continue;

        triggerNotification(
          `Focus Reminder: ${task.title}`,
          task.dueAt
            ? `Priority: ${task.priority} • Due ${new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : `Scheduled focus time for: ${task.title}`,
          task.priority,
          task.id,
        );
        localStorage.setItem(key, 'shown');
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30_000);
    return () => clearInterval(interval);
  }, [upcomingReminders, triggerNotification]);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  async function requestBrowserPermission() {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      triggerNotification(
        'Push Notifications Activated!',
        'You will receive instant alerts for scheduled task reminders and due deadlines.',
        'HIGH',
      );
    }
  }

  function formatRelativeDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
  }

  return (
    <>
      {/* Floating In-App Toast Banner */}
      {activeToast && (
        <div className="in-app-toast-banner" role="alert">
          <div className="toast-icon">
            <Icon icon={BellRing} size={18} />
          </div>
          <div className="toast-content">
            <div className="toast-top">
              <span className={`priority-tag tag-${(activeToast.priority ?? 'high').toLowerCase()}`}>
                {activeToast.priority ?? 'ALERT'}
              </span>
              <strong>{activeToast.title}</strong>
            </div>
            <p>{activeToast.body}</p>
          </div>
          {activeToast.taskId && onStartTask && (
            <button
              type="button"
              className="toast-action-btn"
              onClick={() => {
                onStartTask(activeToast.taskId!);
                setActiveToast(null);
              }}
              title="Start Timer"
            >
              <Icon icon={Play} size={13} /> Focus
            </button>
          )}
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setActiveToast(null)}
            aria-label="Dismiss notification"
          >
            <Icon icon={X} size={14} />
          </button>
        </div>
      )}

      <div className="reminder-center-container" ref={dropdownRef}>
        <button
          className={`reminder-button ${isOpen ? 'active-open' : ''} ${permission === 'granted' ? 'enabled' : ''}`}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open notifications and reminders"
          aria-expanded={isOpen}
          title={totalAlerts > 0 ? `${totalAlerts} pending reminders & alerts` : 'Notifications & Reminders'}
        >
          <Icon icon={permission === 'granted' ? BellRing : Bell} size={19} />
          {totalAlerts > 0 && <span className="reminder-badge">{totalAlerts}</span>}
        </button>

        {isOpen && (
          <div className="reminder-popover" role="dialog" aria-label="Notifications panel">
            {/* Header */}
            <div className="reminder-popover-header">
              <div className="reminder-header-title">
                <Icon icon={Bell} size={18} />
                <div>
                  <h3>Notifications & Reminders</h3>
                  <small>{totalAlerts} active alerts requiring attention</small>
                </div>
              </div>
              <button
                className="icon-button small"
                onClick={() => setIsOpen(false)}
                aria-label="Close notification panel"
              >
                <Icon icon={X} size={16} />
              </button>
            </div>

            {/* Browser Permission Action Strip */}
            <div className="browser-permission-strip">
              <div className="permission-info">
                <Icon icon={permission === 'granted' ? BellRing : BellOff} size={14} />
                <span>
                  {permission === 'granted'
                    ? 'Desktop push alerts active'
                    : 'Desktop alerts disabled'}
                </span>
              </div>
              {permission !== 'granted' && supported && (
                <button
                  type="button"
                  className="permission-action-btn"
                  onClick={() => void requestBrowserPermission()}
                >
                  Enable
                </button>
              )}
            </div>

            {/* Scrollable Notifications List */}
            <div className="reminder-popover-body">
              {totalAlerts === 0 ? (
                <div className="reminder-empty-state">
                  <Icon icon={CheckCircle2} size={32} />
                  <strong>All caught up!</strong>
                  <p>No overdue tasks or scheduled reminders for the next 24 hours.</p>
                </div>
              ) : (
                <div className="reminder-sections">
                  {/* 1. Overdue Section */}
                  {overdueTasks.length > 0 && (
                    <div className="reminder-group">
                      <div className="reminder-group-title overdue-title">
                        <Icon icon={AlertCircle} size={14} />
                        <span>Overdue ({overdueTasks.length})</span>
                      </div>
                      {overdueTasks.map((task) => (
                        <div className="notification-card overdue-card" key={task.id}>
                          <div className="notification-card-content">
                            <div className="notification-meta">
                              <span className="priority-tag tag-urgent">Overdue</span>
                              <span className="notification-time">
                                Due {formatRelativeDate(task.dueAt!)}
                              </span>
                            </div>
                            <strong
                              className="notification-task-title"
                              onClick={() => {
                                onSelectTask?.(task);
                                setIsOpen(false);
                              }}
                            >
                              {task.title}
                            </strong>
                          </div>
                          {onStartTask && (
                            <button
                              className="notification-action-btn"
                              title="Start Focus Timer"
                              onClick={() => {
                                onStartTask(task.id);
                                setIsOpen(false);
                              }}
                            >
                              <Icon icon={Play} size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Due Today Section */}
                  {dueTodayTasks.length > 0 && (
                    <div className="reminder-group">
                      <div className="reminder-group-title due-today-title">
                        <Icon icon={Calendar} size={14} />
                        <span>Due Today ({dueTodayTasks.length})</span>
                      </div>
                      {dueTodayTasks.map((task) => (
                        <div className="notification-card" key={task.id}>
                          <div className="notification-card-content">
                            <div className="notification-meta">
                              <span className={`priority-tag tag-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                              <span className="notification-time">
                                Due {formatRelativeDate(task.dueAt!)}
                              </span>
                            </div>
                            <strong
                              className="notification-task-title"
                              onClick={() => {
                                onSelectTask?.(task);
                                setIsOpen(false);
                              }}
                            >
                              {task.title}
                            </strong>
                          </div>
                          {onStartTask && (
                            <button
                              className="notification-action-btn"
                              title="Start Focus Timer"
                              onClick={() => {
                                onStartTask(task.id);
                                setIsOpen(false);
                              }}
                            >
                              <Icon icon={Play} size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Scheduled Reminders Section */}
                  {upcomingReminders.length > 0 && (
                    <div className="reminder-group">
                      <div className="reminder-group-title reminder-title">
                        <Icon icon={Clock} size={14} />
                        <span>Scheduled Reminders ({upcomingReminders.length})</span>
                      </div>
                      {upcomingReminders.map((task) => (
                        <div className="notification-card" key={task.id}>
                          <div className="notification-card-content">
                            <div className="notification-meta">
                              <span className="priority-tag tag-reminder">Reminder</span>
                              <span className="notification-time">
                                Alert set for {formatRelativeDate(task.reminderAt!)}
                              </span>
                            </div>
                            <strong
                              className="notification-task-title"
                              onClick={() => {
                                onSelectTask?.(task);
                                setIsOpen(false);
                              }}
                            >
                              {task.title}
                            </strong>
                          </div>
                          {onStartTask && (
                            <button
                              className="notification-action-btn"
                              title="Start Focus Timer"
                              onClick={() => {
                                onStartTask(task.id);
                                setIsOpen(false);
                              }}
                            >
                              <Icon icon={Play} size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. Active In-Progress Urgent Items */}
                  {urgentAlerts.length > 0 && overdueTasks.length === 0 && (
                    <div className="reminder-group">
                      <div className="reminder-group-title in-progress-title">
                        <Icon icon={Sparkles} size={14} />
                        <span>In-Progress Focus ({urgentAlerts.length})</span>
                      </div>
                      {urgentAlerts.map((task) => (
                        <div className="notification-card" key={task.id}>
                          <div className="notification-card-content">
                            <div className="notification-meta">
                              <span className="priority-tag tag-progress">In Progress</span>
                              <span className="notification-time">
                                {task.priority} Priority
                              </span>
                            </div>
                            <strong
                              className="notification-task-title"
                              onClick={() => {
                                onSelectTask?.(task);
                                setIsOpen(false);
                              }}
                            >
                              {task.title}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="reminder-popover-footer">
              <span>Tempo Smart Notification Center</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
