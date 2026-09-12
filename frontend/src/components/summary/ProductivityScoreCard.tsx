import { useMemo } from 'react';
import { CheckCircle2, Flame, Gauge, Sparkles, Timer } from 'lucide-react';
import type { Task, TimeLog, WeeklySummary } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

interface ProductivityScoreProps {
  tasks: Task[];
  logs: TimeLog[];
  weekly: WeeklySummary | null;
}

export function ProductivityScoreCard({ tasks, logs, weekly }: ProductivityScoreProps) {
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Average session length
    const totalLogs = logs.length;
    const totalLogDuration = logs.reduce((sum, l) => sum + l.durationSeconds, 0);
    const avgSessionSeconds = totalLogs > 0 ? Math.round(totalLogDuration / totalLogs) : 0;

    // Active days out of 7
    const activeDays = weekly?.activeDays ?? (logs.length > 0 ? 1 : 0);

    // Productivity Score (0-100)
    // 40% active days consistency (activeDays / 7 * 40)
    // 30% completion rate (completionRate * 0.3)
    // 30% focus volume benchmark (e.g. 20 hours target = 72000s)
    const activeDaysScore = Math.min(40, (activeDays / 7) * 40);
    const completionScore = Math.min(30, (completionRate / 100) * 30);
    const volumeTargetSeconds = 15 * 3600; // 15 hours weekly benchmark
    const volumeScore = weekly?.totalSeconds
      ? Math.min(30, (weekly.totalSeconds / volumeTargetSeconds) * 30)
      : Math.min(30, (totalLogDuration / (volumeTargetSeconds * 2)) * 30);

    const overallScore = Math.min(100, Math.max(10, Math.round(activeDaysScore + completionScore + volumeScore)));

    let scoreTier = 'Steady Pace';
    let tierColor = '#777';
    if (overallScore >= 85) {
      scoreTier = 'Master Flow (Elite)';
      tierColor = '#dfbd6c';
    } else if (overallScore >= 70) {
      scoreTier = 'High Momentum';
      tierColor = '#609a7b';
    } else if (overallScore >= 50) {
      scoreTier = 'Active Builder';
      tierColor = '#5e86c8';
    }

    return {
      overallScore,
      scoreTier,
      tierColor,
      completionRate,
      completedTasks,
      totalTasks,
      avgSessionSeconds,
      activeDays,
    };
  }, [tasks, logs, weekly]);

  return (
    <section className="score-panel surface" aria-labelledby="score-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Performance Quotient</span>
          <h2 id="score-heading">Productivity & Flow Score</h2>
        </div>
        <span className="date-chip">Composite Index</span>
      </div>

      <div className="score-content-grid">
        {/* Main Circular Gauge Card */}
        <div className="score-gauge-card">
          <div className="gauge-circle-wrapper">
            <svg className="gauge-svg" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r="56"
                fill="transparent"
                stroke="#ece7dc"
                strokeWidth="12"
              />
              <circle
                cx="70"
                cy="70"
                r="56"
                fill="transparent"
                stroke="url(#gauge-gradient)"
                strokeWidth="12"
                strokeDasharray={`${(metrics.overallScore / 100) * 351.8} 351.8`}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dasharray 0.8s ease',
                  filter: 'drop-shadow(0 0 6px rgba(223, 189, 108, 0.4))',
                }}
              />
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a37424" />
                  <stop offset="100%" stopColor="#efcb75" />
                </linearGradient>
              </defs>
            </svg>
            <div className="gauge-inner">
              <Icon icon={Gauge} size={18} />
              <strong className="gauge-number">{metrics.overallScore}</strong>
              <small>/ 100</small>
            </div>
          </div>
          <div className="gauge-tagline">
            <span className="gauge-tier-pill" style={{ color: metrics.tierColor }}>
              <Icon icon={Sparkles} size={12} /> {metrics.scoreTier}
            </span>
            <p>Calculated across your active days, focus volume, and task completion velocity.</p>
          </div>
        </div>

        {/* 3 Detail KPI Stat Cards */}
        <div className="score-kpi-stack">
          <div className="score-kpi-item">
            <div className="kpi-icon"><Icon icon={CheckCircle2} size={18} /></div>
            <div className="kpi-info">
              <span>Task Completion Velocity</span>
              <strong>{metrics.completionRate}%</strong>
              <small>{metrics.completedTasks} of {metrics.totalTasks} tasks completed</small>
            </div>
          </div>

          <div className="score-kpi-item">
            <div className="kpi-icon"><Icon icon={Timer} size={18} /></div>
            <div className="kpi-info">
              <span>Average Focus Block</span>
              <strong>{formatDuration(metrics.avgSessionSeconds, true)}</strong>
              <small>Average duration per uninterrupted focus session</small>
            </div>
          </div>

          <div className="score-kpi-item">
            <div className="kpi-icon"><Icon icon={Flame} size={18} /></div>
            <div className="kpi-info">
              <span>Consistency Rhythm</span>
              <strong>{metrics.activeDays} / 7 Days</strong>
              <small>Active focus sessions recorded this week</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
