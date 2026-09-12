import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  it('returns status counts and task time for a local day', async () => {
    const prisma = {
      timeLog: { findMany: jest.fn().mockResolvedValue([{ taskId: 't1', durationSeconds: 120, task: { id: 't1', title: 'Focus', priority: 'HIGH' } }]) },
      task: { findMany: jest.fn().mockResolvedValue([{ id: 't1', title: 'Focus', status: 'COMPLETED', completedAt: new Date('2026-09-11T08:00:00Z') }, { id: 't2', title: 'Later', status: 'PENDING', completedAt: null }]) },
      activeTimer: { findUnique: jest.fn().mockResolvedValue(null) }
    };
    const result = await new AnalyticsService(prisma as never).daily('u1', { date: '2026-09-11', timezoneOffset: 0 });
    expect(result.totalSeconds).toBe(120); expect(result.completedCount).toBe(1); expect(result.pendingCount).toBe(1); expect(result.tasksWorkedOn[0].title).toBe('Focus');
  });
});
