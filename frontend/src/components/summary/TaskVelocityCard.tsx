import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Task } from '@/models';
import { Icon } from '@/components/ui/Icon';

interface TaskVelocityProps {
  tasks: Task[];
}

export function TaskVelocityCard({ tasks }: TaskVelocityProps) {
  const data = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pending = tasks.filter((t) => t.status === 'PENDING').length;

    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.dueAt && new Date(t.dueAt) < now
    ).length;

    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completedPct,
      inProgressPct,
      pendingPct,
    };
  }, [tasks]);

  return (
    <section className="velocity-panel surface" aria-labelledby="velocity-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Pipeline & Velocity</span>
          <h2 id="velocity-heading">Task Status Distribution</h2>
        </div>
        <span className="date-chip">{data.total} Total Tasks</span>
      </div>

      <div className="velocity-content">
        {/* Multi-segmented single progress bar */}
        <div className="segmented-progress-track">
          {data.completedPct > 0 && (
            <div
              className="segment segment-completed"
              style={{ width: `${data.completedPct}%` }}
              title={`Completed: ${data.completed} (${data.completedPct}%)`}
            />
          )}
          {data.inProgressPct > 0 && (
            <div
              className="segment segment-progress"
              style={{ width: `${data.inProgressPct}%` }}
              title={`In Progress: ${data.inProgress} (${data.inProgressPct}%)`}
            />
          )}
          {data.pendingPct > 0 && (
            <div
              className="segment segment-pending"
              style={{ width: `${data.pendingPct}%` }}
              title={`Pending: ${data.pending} (${data.pendingPct}%)`}
            />
          )}
        </div>

        {/* 3 Status Cards */}
        <div className="status-cards-grid">
          <div className="status-kpi-card status-kpi-completed">
            <div className="status-kpi-top">
              <span className="status-dot dot-completed" />
              <span>Completed</span>
            </div>
            <strong>{data.completed}</strong>
            <small>{data.completedPct}% of pipeline</small>
          </div>

          <div className="status-kpi-card status-kpi-progress">
            <div className="status-kpi-top">
              <span className="status-dot dot-progress" />
              <span>In Progress</span>
            </div>
            <strong>{data.inProgress}</strong>
            <small>{data.inProgressPct}% active focus</small>
          </div>

          <div className="status-kpi-card status-kpi-pending">
            <div className="status-kpi-top">
              <span className="status-dot dot-pending" />
              <span>Pending</span>
            </div>
            <strong>{data.pending}</strong>
            <small>{data.pendingPct}% awaiting start</small>
          </div>
        </div>

        {data.overdue > 0 && (
          <div className="overdue-alert-banner">
            <Icon icon={AlertCircle} size={16} />
            <span><b>{data.overdue} {data.overdue === 1 ? 'task requires' : 'tasks require'} attention:</b> Past scheduled due date.</span>
          </div>
        )}
      </div>
    </section>
  );
}
