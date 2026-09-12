import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ActiveTimer, Task } from '@/models';
import { TaskCard } from './TaskCard';

const baseTask: Task = {
  id: 't1', title: 'Prepare client brief', description: 'Collect requirements.', rawInput: null,
  status: 'PENDING', priority: 'HIGH', totalDurationSeconds: 3720, dueAt: null, reminderAt: null,
  createdAt: '2026-09-11T08:00:00Z', updatedAt: '2026-09-11T08:00:00Z',
};

function renderCard(overrides: Partial<Task> = {}, active: ActiveTimer | null = null) {
  const props = { onStart: vi.fn(), onEdit: vi.fn(), onUpdate: vi.fn(), onDelete: vi.fn() };
  render(<TaskCard task={{ ...baseTask, ...overrides }} active={active} {...props} />);
  return props;
}

describe('TaskCard', () => {
  it('renders task metadata and compact tracked time', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Prepare client brief' })).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('1h 2m')).toBeInTheDocument();
  });

  it('provides task-specific accessible edit and delete controls', () => {
    const props = renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Prepare client brief' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Prepare client brief' }));
    expect(props.onEdit).toHaveBeenCalledOnce(); expect(props.onDelete).toHaveBeenCalledOnce();
  });

  it('starts a pending task and can mark it complete', () => {
    const props = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /start focus/i }));
    fireEvent.click(screen.getByRole('button', { name: /complete/i }));
    expect(props.onStart).toHaveBeenCalledOnce(); expect(props.onUpdate).toHaveBeenCalledWith({ status: 'COMPLETED' });
  });

  it('disables starting a second timer while another task is active', () => {
    renderCard({}, { id: 'timer', taskId: 'other', startedAt: '2026-09-11T10:00:00Z', task: { id: 'other', title: 'Other', priority: 'LOW' } });
    expect(screen.getByRole('button', { name: /timer in use/i })).toBeDisabled();
  });

  it('labels the active task and prevents duplicate starts', () => {
    renderCard({}, { id: 'timer', taskId: 't1', startedAt: '2026-09-11T10:00:00Z', task: { id: 't1', title: baseTask.title, priority: 'HIGH' } });
    expect(screen.getByRole('button', { name: /tracking now/i })).toBeDisabled();
  });

  it('reopens a completed task instead of starting it', () => {
    const props = renderCard({ status: 'COMPLETED' });
    expect(screen.queryByRole('button', { name: /^complete$/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reopen task/i }));
    expect(props.onUpdate).toHaveBeenCalledWith({ status: 'PENDING' }); expect(props.onStart).not.toHaveBeenCalled();
  });

  it('shows persisted reminders and overdue state', () => {
    const { container } = render(<TaskCard task={{ ...baseTask, dueAt: '2020-01-01T10:00:00Z', reminderAt: '2020-01-01T09:30:00Z' }} active={null} onStart={vi.fn()} onEdit={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/reminder set/i)).toBeInTheDocument();
    expect(container.querySelector('.task-overdue')).toBeInTheDocument();
  });
});
