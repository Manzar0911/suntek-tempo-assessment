import { useMemo } from 'react';
import { PieChart, ShieldAlert, Sparkles } from 'lucide-react';
import type { Task, TimeLog, Priority } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

interface PriorityDistributionProps {
  tasks: Task[];
  logs: TimeLog[];
}

interface PriorityStat {
  key: Priority | 'URGENT';
  label: string;
  color: string;
  glowColor: string;
  seconds: number;
  taskCount: number;
  percentage: number;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; glowColor: string }> = {
  URGENT: { label: 'Urgent', color: '#e05244', glowColor: 'rgba(224, 82, 68, 0.35)' },
  HIGH: { label: 'High Priority', color: '#e29e38', glowColor: 'rgba(226, 158, 56, 0.35)' },
  MEDIUM: { label: 'Medium Priority', color: '#688dcd', glowColor: 'rgba(104, 141, 205, 0.35)' },
  LOW: { label: 'Low Priority', color: '#529b7a', glowColor: 'rgba(82, 155, 122, 0.35)' },
};

export function PriorityDistributionCard({ tasks, logs }: PriorityDistributionProps) {
  const stats = useMemo(() => {
    const timeMap = new Map<string, number>();
    const countMap = new Map<string, number>();

    // Map logs to task priority
    for (const log of logs) {
      const priority = (log.task?.priority ?? 'MEDIUM').toUpperCase();
      timeMap.set(priority, (timeMap.get(priority) ?? 0) + log.durationSeconds);
    }

    // Count tasks per priority
    for (const task of tasks) {
      const priority = (task.priority ?? 'MEDIUM').toUpperCase();
      countMap.set(priority, (countMap.get(priority) ?? 0) + 1);
    }

    const totalTime = Array.from(timeMap.values()).reduce((sum, val) => sum + val, 0);

    const keys: (Priority | 'URGENT')[] = ['HIGH', 'MEDIUM', 'LOW'];
    // Include URGENT if exists
    if (timeMap.has('URGENT') || countMap.has('URGENT')) {
      keys.unshift('URGENT');
    }

    return keys.map((key) => {
      const cfg = PRIORITY_CONFIG[key] ?? { label: key, color: '#999', glowColor: 'rgba(150,150,150,0.3)' };
      const seconds = timeMap.get(key) ?? 0;
      const taskCount = countMap.get(key) ?? 0;
      const percentage = totalTime > 0 ? Math.round((seconds / totalTime) * 100) : 0;
      return {
        key,
        label: cfg.label,
        color: cfg.color,
        glowColor: cfg.glowColor,
        seconds,
        taskCount,
        percentage,
      } as PriorityStat;
    });
  }, [tasks, logs]);

  const totalSeconds = stats.reduce((sum, s) => sum + s.seconds, 0);
  const dominant = [...stats].sort((a, b) => b.seconds - a.seconds)[0];

  // SVG Donut calculation
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <section className="priority-panel surface" aria-labelledby="priority-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Priority intelligence</span>
          <h2 id="priority-heading">Focus by Priority</h2>
        </div>
        <span className="date-chip">All time logs</span>
      </div>

      <div className="priority-content">
        <div className="donut-wrapper">
          <svg
            className="donut-svg"
            viewBox="0 0 160 160"
            role="img"
            aria-label="Priority distribution donut chart"
          >
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#ece7dc"
              strokeWidth={strokeWidth}
            />
            {totalSeconds > 0 ? (
              stats.map((stat) => {
                const strokeDasharray = `${(stat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (stat.percentage / 100) * circumference;

                return (
                  <circle
                    key={stat.key}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={stat.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                      transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease',
                      filter: `drop-shadow(0 0 4px ${stat.glowColor})`,
                    }}
                  />
                );
              })
            ) : (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#ded9cd"
                strokeWidth={strokeWidth}
              />
            )}
          </svg>

          <div className="donut-center">
            <Icon icon={PieChart} size={20} />
            <strong>{totalSeconds > 0 ? formatDuration(totalSeconds, true) : '0m'}</strong>
            <small>Total tracked</small>
          </div>
        </div>

        <div className="priority-legend">
          {stats.map((stat) => (
            <div className="priority-legend-item" key={stat.key}>
              <div className="legend-head">
                <span className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: stat.color, boxShadow: `0 0 8px ${stat.glowColor}` }} />
                  <strong>{stat.label}</strong>
                </span>
                <span className="legend-time">{formatDuration(stat.seconds, true)} ({stat.percentage}%)</span>
              </div>
              <div className="legend-track">
                <div
                  className="legend-fill"
                  style={{
                    width: `${Math.max(3, stat.percentage)}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
              <small className="legend-tasks">{stat.taskCount} {stat.taskCount === 1 ? 'task' : 'tasks'} categorized</small>
            </div>
          ))}

          {dominant && dominant.percentage > 0 && (
            <div className="priority-callout">
              <Icon icon={dominant.key === 'URGENT' ? ShieldAlert : Sparkles} size={15} />
              <span>
                <strong>{dominant.percentage}% of your energy</strong> went into <em>{dominant.label}</em> objectives.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
