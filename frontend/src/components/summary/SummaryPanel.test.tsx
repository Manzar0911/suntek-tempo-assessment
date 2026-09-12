import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DailySummary } from '@/models';
import { SummaryPanel } from './SummaryPanel';

describe('SummaryPanel', () => {
  it('renders a helpful empty state before summary data loads', () => {
    render(<SummaryPanel summary={null} />);
    expect(screen.getByRole('heading', { name: /daily story starts here/i })).toBeInTheDocument();
  });

  it('renders totals, status counts, and task focus distribution', () => {
    const summary: DailySummary = {
      date: '2026-09-11', totalSeconds: 5400, completedCount: 2, pendingCount: 3, inProgressCount: 1,
      tasksWorkedOn: [{ taskId: 't1', title: 'Client brief', seconds: 3600 }, { taskId: 't2', title: 'Email', seconds: 1800 }],
      logs: [], active: null,
    };
    const { container } = render(<SummaryPanel summary={summary} />);
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
    expect(screen.getByText('Client brief')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-fill')).toHaveLength(2);
    expect(container.querySelectorAll('.bar-fill')[0]).toHaveStyle({ width: '100%' });
    expect(container.querySelectorAll('.bar-fill')[1]).toHaveStyle({ width: '50%' });
  });

  it('does not fabricate task bars when no sessions exist', () => {
    render(<SummaryPanel summary={{ date: '2026-09-11', totalSeconds: 0, completedCount: 0, pendingCount: 1, inProgressCount: 0, tasksWorkedOn: [], logs: [], active: null }} />);
    expect(screen.getByText(/no tracked sessions yet/i)).toBeInTheDocument();
  });
});
