import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeeklyPanel } from './WeeklyPanel';

describe('WeeklyPanel', () => {
  it('renders seven accessible daily bars and weekly insights', () => {
    const { container } = render(<WeeklyPanel summary={{
      startDate: '2026-09-05', endDate: '2026-09-11', totalSeconds: 7200, averageSeconds: 1029,
      activeDays: 2, completedCount: 3, mostProductiveDay: '2026-09-11',
      days: [
        { date: '2026-09-05', seconds: 0 }, { date: '2026-09-06', seconds: 0 },
        { date: '2026-09-07', seconds: 3600 }, { date: '2026-09-08', seconds: 0 },
        { date: '2026-09-09', seconds: 0 }, { date: '2026-09-10', seconds: 0 },
        { date: '2026-09-11', seconds: 3600 },
      ],
    }} />);
    expect(screen.getByRole('img', { name: /weekly focus chart/i })).toBeInTheDocument();
    expect(container.querySelectorAll('.chart-day')).toHaveLength(7);
    expect(screen.getByText('2 / 7')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders nothing until weekly data is available', () => {
    const { container } = render(<WeeklyPanel summary={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
