import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '@/models';
import { ReminderCenter } from './ReminderCenter';

describe('ReminderCenter', () => {
  const dummyTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Urgent Stripe Webhook Fix',
      description: 'Resolve webhook bug',
      rawInput: null,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      totalDurationSeconds: 1200,
      dueAt: new Date(Date.now() - 3600000).toISOString(), // Overdue
      reminderAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Review Sprint Analytics',
      description: 'Audit KPIs',
      rawInput: null,
      status: 'PENDING',
      priority: 'MEDIUM',
      totalDurationSeconds: 0,
      dueAt: new Date(Date.now() + 3600000).toISOString(), // Due today
      reminderAt: new Date(Date.now() + 1800000).toISOString(), // Reminder today
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders bell button with total active alerts badge', () => {
    render(<ReminderCenter tasks={dummyTasks} />);
    const button = screen.getByRole('button', { name: /open notifications and reminders/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens interactive notification popover on click', () => {
    render(<ReminderCenter tasks={dummyTasks} />);
    const button = screen.getByRole('button', { name: /open notifications and reminders/i });
    fireEvent.click(button);

    expect(screen.getByText(/Notifications & Reminders/i)).toBeInTheDocument();
    expect(screen.getByText('Urgent Stripe Webhook Fix')).toBeInTheDocument();
    expect(screen.getAllByText('Review Sprint Analytics').length).toBeGreaterThan(0);
    expect(screen.getByText(/Overdue \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Due Today \(1\)/i)).toBeInTheDocument();
  });

  it('triggers onStartTask callback when play icon is clicked', () => {
    const handleStart = vi.fn();
    render(<ReminderCenter tasks={dummyTasks} onStartTask={handleStart} />);

    fireEvent.click(screen.getByRole('button', { name: /open notifications and reminders/i }));
    const playButtons = screen.getAllByTitle(/Start Focus Timer/i);
    expect(playButtons.length).toBeGreaterThan(0);

    fireEvent.click(playButtons[0]);
    expect(handleStart).toHaveBeenCalledWith('task-1');
  });

  it('renders clean empty state when no pending alerts exist', () => {
    render(<ReminderCenter tasks={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /open notifications and reminders/i }));
    expect(screen.getByText(/All caught up!/i)).toBeInTheDocument();
  });
});
