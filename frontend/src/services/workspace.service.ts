import type { ActiveTimer, DailySummary, Priority, Status, Task, TaskInput, TimeLog, WeeklySummary } from '@/models';
import { request } from './api';

export const workspaceService = {
  tasks: (filters?: { search?: string; status?: Status | ''; priority?: Priority | '' }) => {
    const query = new URLSearchParams(Object.entries(filters ?? {}).filter(([, value]) => value) as [string, string][]);
    return request<Task[]>(`/tasks?${query}`);
  },
  createTask: (data: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<TaskInput>) => request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<{ id: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  enhance: (prompt: string) => request<{ title: string; description: string; priority: Priority }>('/tasks/enhance', { method: 'POST', body: JSON.stringify({ prompt }) }),
  reminders: (hours = 24) => request<Task[]>(`/tasks/reminders/upcoming?hours=${hours}`),
  active: () => request<ActiveTimer | null>('/timelogs/active'),
  start: (taskId: string) => request<ActiveTimer>('/timelogs/start', { method: 'POST', body: JSON.stringify({ taskId }) }),
  stop: () => request<TimeLog>('/timelogs/stop', { method: 'POST', body: '{}' }),
  logs: () => request<TimeLog[]>('/timelogs'),
  deleteLog: (id: string) => request<{ id: string }>(`/timelogs/${id}`, { method: 'DELETE' }),
  summary: () => request<DailySummary>(`/analytics/daily-summary?timezoneOffset=${new Date().getTimezoneOffset()}`),
  weeklySummary: () => request<WeeklySummary>(`/analytics/weekly-summary?timezoneOffset=${new Date().getTimezoneOffset()}`),
};
