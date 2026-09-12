export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User { id: string; name: string; email: string; createdAt: string }
export interface Task {
  id: string; title: string; description: string | null; rawInput: string | null;
  status: Status; priority: Priority; totalDurationSeconds: number;
  dueAt: string | null; reminderAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface ActiveTimer { id: string; taskId: string; startedAt: string; note?: string | null; task: Pick<Task, 'id' | 'title' | 'priority'> }
export interface TimeLog { id: string; taskId: string; startedAt: string; endedAt: string; durationSeconds: number; note?: string | null; task: Pick<Task, 'id' | 'title' | 'priority'> }
export interface DailySummary { date: string; totalSeconds: number; completedCount: number; pendingCount: number; inProgressCount: number; tasksWorkedOn: { taskId: string; title: string; seconds: number }[]; logs: TimeLog[]; active: ActiveTimer | null }
export interface WeeklySummary { startDate: string; endDate: string; totalSeconds: number; averageSeconds: number; activeDays: number; completedCount: number; mostProductiveDay: string | null; days: { date: string; seconds: number }[] }
export interface TaskInput { title: string; description?: string; rawInput?: string; status?: Status; priority?: Priority; dueAt?: string | null; reminderAt?: string | null }
