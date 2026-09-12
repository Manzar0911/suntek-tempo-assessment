import { useCallback, useEffect, useState } from 'react';
import type { ActiveTimer, DailySummary, Task, TaskInput, TimeLog, WeeklySummary } from '@/models';
import { workspaceService } from '@/services/workspace.service';

export function useWorkspaceController() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [nextTasks, nextLogs, nextActive, nextSummary, nextWeekly] = await Promise.all([
        workspaceService.tasks(), workspaceService.logs(), workspaceService.active(),
        workspaceService.summary(), workspaceService.weeklySummary(),
      ]);
      setTasks(nextTasks); setLogs(nextLogs); setActive(nextActive); setSummary(nextSummary); setWeekly(nextWeekly);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const action = async (operation: () => Promise<unknown>) => {
    try { setError(''); await operation(); await refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Action failed.'); throw caught; }
  };

  return {
    tasks, logs, active, summary, weekly, loading, error, clearError: () => setError(''), refresh,
    createTask: (data: TaskInput) => action(() => workspaceService.createTask(data)),
    updateTask: (id: string, data: Partial<TaskInput>) => action(() => workspaceService.updateTask(id, data)),
    deleteTask: (id: string) => action(() => workspaceService.deleteTask(id)),
    start: (taskId: string) => action(() => workspaceService.start(taskId)),
    stop: () => action(() => workspaceService.stop()),
    deleteLog: (id: string) => action(() => workspaceService.deleteLog(id)),
  };
}
