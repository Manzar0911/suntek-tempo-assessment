import { useMemo } from 'react';
import { Flame, Moon, Sun, Sunrise, Sunset, Zap } from 'lucide-react';
import type { TimeLog } from '@/models';
import { formatDuration } from '@/utils/format';
import { Icon } from '@/components/ui/Icon';

interface HourlyRhythmProps {
  logs: TimeLog[];
}

interface PeriodBucket {
  id: string;
  name: string;
  timeRange: string;
  icon: typeof Sun;
  color: string;
  seconds: number;
  percentage: number;
}

export function HourlyRhythmCard({ logs }: HourlyRhythmProps) {
  const { periods, hourlyDistribution, peakHour } = useMemo(() => {
    const hours = new Array<number>(24).fill(0);
    let total = 0;

    for (const log of logs) {
      if (!log.startedAt) continue;
      const start = new Date(log.startedAt);
      const hour = start.getHours();
      hours[hour] += log.durationSeconds;
      total += log.durationSeconds;
    }

    // Categorize into 4 periods
    // Morning: 06:00 - 11:59 (hours 6..11)
    // Afternoon: 12:00 - 16:59 (hours 12..16)
    // Evening: 17:00 - 20:59 (hours 17..20)
    // Night: 21:00 - 05:59 (hours 21..23, 0..5)
    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    let night = 0;

    hours.forEach((secs, h) => {
      if (h >= 6 && h < 12) morning += secs;
      else if (h >= 12 && h < 17) afternoon += secs;
      else if (h >= 17 && h < 21) evening += secs;
      else night += secs;
    });

    const calcPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

    const periodData: PeriodBucket[] = [
      {
        id: 'morning',
        name: 'Morning Flow',
        timeRange: '06:00 – 12:00',
        icon: Sunrise,
        color: '#e49e3d',
        seconds: morning,
        percentage: calcPct(morning),
      },
      {
        id: 'afternoon',
        name: 'Afternoon Peak',
        timeRange: '12:00 – 17:00',
        icon: Sun,
        color: '#da7334',
        seconds: afternoon,
        percentage: calcPct(afternoon),
      },
      {
        id: 'evening',
        name: 'Evening Wrap',
        timeRange: '17:00 – 21:00',
        icon: Sunset,
        color: '#8964c4',
        seconds: evening,
        percentage: calcPct(evening),
      },
      {
        id: 'night',
        name: 'Night Deep Work',
        timeRange: '21:00 – 06:00',
        icon: Moon,
        color: '#4f75bb',
        seconds: night,
        percentage: calcPct(night),
      },
    ];

    // Find peak hour
    let maxHourIdx = -1;
    let maxHourVal = 0;
    hours.forEach((secs, h) => {
      if (secs > maxHourVal) {
        maxHourVal = secs;
        maxHourIdx = h;
      }
    });

    const formatHour = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formatted = h % 12 === 0 ? 12 : h % 12;
      return `${formatted} ${ampm}`;
    };

    const peakStr =
      maxHourIdx >= 0 && maxHourVal > 0
        ? `${formatHour(maxHourIdx)} – ${formatHour((maxHourIdx + 1) % 24)}`
        : 'Afternoon (12 PM – 5 PM)';

    return {
      periods: periodData,
      hourlyDistribution: hours,
      peakHour: peakStr,
    };
  }, [logs]);

  const maxHour = Math.max(...hourlyDistribution, 1);
  const bestPeriod = [...periods].sort((a, b) => b.seconds - a.seconds)[0];

  return (
    <section className="hourly-panel surface" aria-labelledby="rhythm-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Circadian Focus Map</span>
          <h2 id="rhythm-heading">Time-of-Day Rhythm</h2>
        </div>
        <div className="peak-badge">
          <Icon icon={Flame} size={14} />
          <span>Peak Flow: <b>{peakHour}</b></span>
        </div>
      </div>

      <div className="rhythm-layout">
        {/* 24-hour micro heatmap spectrum */}
        <div className="spectrum-container">
          <div className="spectrum-title">
            <span>24-Hour Intensity Timeline</span>
            <small>Darker golden bars indicate deeper focus blocks</small>
          </div>
          <div className="spectrum-bar-grid">
            {hourlyDistribution.map((secs, h) => {
              const heightPct = secs > 0 ? Math.max(14, (secs / maxHour) * 100) : 6;
              const opacity = secs > 0 ? Math.max(0.4, secs / maxHour) : 0.12;
              const ampm = h >= 12 ? 'PM' : 'AM';
              const displayH = h % 12 === 0 ? 12 : h % 12;
              const hourLabel = `${displayH}${ampm}`;

              return (
                <div
                  key={h}
                  className="spectrum-column"
                  title={`${hourLabel}: ${formatDuration(secs, true)} focused`}
                >
                  <div className="spectrum-column-track">
                    <span
                      style={{
                        height: `${heightPct}%`,
                        opacity,
                        backgroundColor: secs > 0 ? '#caa452' : '#777',
                      }}
                    />
                  </div>
                  {h % 4 === 0 && <span className="spectrum-hour-label">{displayH}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Energy Zone Cards */}
        <div className="periods-grid">
          {periods.map((p) => {
            const isTop = bestPeriod && bestPeriod.id === p.id && p.seconds > 0;
            return (
              <div
                key={p.id}
                className={`period-card ${isTop ? 'period-card-peak' : ''}`}
              >
                <div className="period-card-top">
                  <span className="period-icon" style={{ color: p.color }}>
                    <Icon icon={p.icon} size={17} />
                  </span>
                  {isTop && (
                    <span className="period-top-tag">
                      <Icon icon={Zap} size={11} /> Top Zone
                    </span>
                  )}
                </div>
                <strong className="period-name">{p.name}</strong>
                <span className="period-time">{p.timeRange}</span>
                <div className="period-metric">
                  <strong>{formatDuration(p.seconds, true)}</strong>
                  <span>{p.percentage}%</span>
                </div>
                <div className="period-track">
                  <div
                    className="period-fill"
                    style={{
                      width: `${Math.max(4, p.percentage)}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
