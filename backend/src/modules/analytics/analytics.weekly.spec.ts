import { AnalyticsService } from './analytics.service';

describe('AnalyticsService weekly summary', () => {
  it('builds a complete seven-day series including zero-focus days', async () => {
    const prisma = {
      timeLog: { findMany: jest.fn().mockResolvedValue([
        { startedAt: new Date('2026-09-05T10:00:00Z'), durationSeconds: 1800 },
        { startedAt: new Date('2026-09-05T12:00:00Z'), durationSeconds: 900 },
        { startedAt: new Date('2026-09-11T08:00:00Z'), durationSeconds: 3600 },
      ]) },
      task: { count: jest.fn().mockResolvedValue(3) },
    };
    const result = await new AnalyticsService(prisma as never).weekly('u1', { date: '2026-09-11', timezoneOffset: 0 });
    expect(result.days).toHaveLength(7);
    expect(result.days[0]).toEqual({ date: '2026-09-05', seconds: 2700 });
    expect(result.days[6]).toEqual({ date: '2026-09-11', seconds: 3600 });
    expect(result.totalSeconds).toBe(6300);
    expect(result.activeDays).toBe(2);
    expect(result.completedCount).toBe(3);
    expect(result.mostProductiveDay).toBe('2026-09-11');
  });

  it('returns a null best day for an empty week', async () => {
    const prisma = { timeLog: { findMany: jest.fn().mockResolvedValue([]) }, task: { count: jest.fn().mockResolvedValue(0) } };
    const result = await new AnalyticsService(prisma as never).weekly('u1', { date: '2026-09-11', timezoneOffset: -330 });
    expect(result.totalSeconds).toBe(0);
    expect(result.averageSeconds).toBe(0);
    expect(result.mostProductiveDay).toBeNull();
  });
});
