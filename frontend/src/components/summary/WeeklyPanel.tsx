import { Award, CalendarCheck2, Flame, TimerReset } from 'lucide-react';
import type { WeeklySummary } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

export function WeeklyPanel({ summary }: { summary: WeeklySummary | null }) {
  if (!summary) return null;
  const max = Math.max(...summary.days.map((day) => day.seconds), 1);
  const bestLabel = summary.mostProductiveDay
    ? new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date(`${summary.mostProductiveDay}T12:00:00`))
    : 'No focus yet';

  return (
    <section className="weekly-panel surface" aria-labelledby="weekly-heading">
      <div className="section-heading">
        <div><span className="eyebrow">Seven-day intelligence</span><h2 id="weekly-heading">Your productivity rhythm</h2></div>
        <span className="date-chip">Last 7 days</span>
      </div>
      <div className="weekly-content">
        <div className="weekly-chart" role="img" aria-label={`Weekly focus chart. Total ${formatDuration(summary.totalSeconds, true)} across ${summary.activeDays} active days.`}>
          {summary.days.map((day) => {
            const label = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`));
            const height = day.seconds ? Math.max(12, day.seconds / max * 100) : 3;
            return <div className="chart-day" key={day.date} title={`${label}: ${formatDuration(day.seconds, true)}`}><span className="chart-value">{day.seconds ? formatDuration(day.seconds, true) : '—'}</span><div className="chart-track"><span style={{ height: `${height}%` }} /></div><b>{label}</b></div>;
          })}
        </div>
        <dl className="weekly-insights">
          <div><dt><Icon icon={TimerReset} />Weekly focus</dt><dd>{formatDuration(summary.totalSeconds, true)}</dd></div>
          <div><dt><Icon icon={Flame} />Active days</dt><dd>{summary.activeDays} / 7</dd></div>
          <div><dt><Icon icon={CalendarCheck2} />Completed</dt><dd>{summary.completedCount}</dd></div>
          <div><dt><Icon icon={Award} />Best day</dt><dd>{bestLabel}</dd></div>
        </dl>
      </div>
    </section>
  );
}
