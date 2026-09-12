import { Bell, CalendarClock, Check, Clock3, Pencil, Play, Trash2 } from 'lucide-react';
import type { ActiveTimer, Task, TaskInput } from '@/models';
import { formatDuration, titleCase } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

function dueLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return `${isToday ? 'Today' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)}, ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)}`;
}

export function TaskCard({ task, active, onStart, onEdit, onUpdate, onDelete }: { task: Task; active: ActiveTimer | null; onStart(): void; onEdit(): void; onUpdate(data: Partial<TaskInput>): void; onDelete(): void }) {
  const isActive = active?.taskId === task.id;
  const overdue = Boolean(task.dueAt && task.status !== 'COMPLETED' && new Date(task.dueAt).getTime() < Date.now());
  return (
    <article className={`task-card ${isActive ? 'task-active' : ''} ${overdue ? 'task-overdue' : ''}`}>
      <div className="task-top"><span className={`priority priority-${task.priority.toLowerCase()}`}><span />{titleCase(task.priority)}</span><div className="task-menu"><button className="icon-button small" onClick={onEdit} aria-label={`Edit ${task.title}`}><Icon icon={Pencil} size={16} /></button><button className="icon-button small danger" onClick={onDelete} aria-label={`Delete ${task.title}`}><Icon icon={Trash2} size={16} /></button></div></div>
      <div><h3>{task.title}</h3><p>{task.description || 'No description — keep it simple and start when ready.'}</p></div>
      {(task.dueAt || task.reminderAt) && <div className="task-schedule">{task.dueAt && <span className={overdue ? 'overdue' : ''}><Icon icon={CalendarClock} size={14} />{overdue ? 'Overdue · ' : 'Due · '}{dueLabel(task.dueAt)}</span>}{task.reminderAt && <span><Icon icon={Bell} size={13} />Reminder set</span>}</div>}
      <div className="task-footer"><span className={`status status-${task.status.toLowerCase()}`}><span />{titleCase(task.status)}</span><span className="tracked"><Icon icon={Clock3} size={16} />{formatDuration(task.totalDurationSeconds, true)}</span></div>
      <div className="task-actions"><button className={task.status === 'COMPLETED' ? 'secondary-button' : 'primary-button'} onClick={task.status === 'COMPLETED' ? () => onUpdate({ status: 'PENDING' }) : onStart} disabled={isActive || (!!active && task.status !== 'COMPLETED')}><Icon icon={task.status === 'COMPLETED' ? Check : Play} size={16} />{isActive ? 'Tracking now' : task.status === 'COMPLETED' ? 'Reopen task' : active ? 'Timer in use' : 'Start focus'}</button>{task.status !== 'COMPLETED' && <button className="complete-button" onClick={() => onUpdate({ status: 'COMPLETED' })}><Icon icon={Check} size={16} />Complete</button>}</div>
    </article>
  );
}
