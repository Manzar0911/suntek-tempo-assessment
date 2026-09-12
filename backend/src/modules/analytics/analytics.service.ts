import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async daily(userId: string, query: DailySummaryQueryDto) {
    const offset = query.timezoneOffset ?? 0;
    const date = query.date ?? this.localDate(new Date(), offset);
    const { start, end } = this.dayRange(date, offset);
    const [logs, tasks, active] = await Promise.all([
      this.prisma.timeLog.findMany({ where: { userId, startedAt: { gte: start, lt: end } }, include: { task: { select: { id: true, title: true, priority: true } } }, orderBy: { startedAt: 'asc' } }),
      this.prisma.task.findMany({ where: { userId }, select: { id: true, title: true, status: true, completedAt: true } }),
      this.prisma.activeTimer.findUnique({ where: { userId }, include: { task: { select: { id: true, title: true, priority: true } } } }),
    ]);
    const map = new Map<string, { taskId: string; title: string; seconds: number }>();
    for (const log of logs) {
      const item = map.get(log.taskId) ?? { taskId: log.taskId, title: log.task.title, seconds: 0 };
      item.seconds += log.durationSeconds;
      map.set(log.taskId, item);
    }
    let activeSeconds = 0;
    if (active && active.startedAt < end && Date.now() >= start.getTime()) {
      const effectiveStart = active.startedAt < start ? start : active.startedAt;
      activeSeconds = Math.max(0, Math.floor((Math.min(Date.now(), end.getTime()) - effectiveStart.getTime()) / 1000));
      const item = map.get(active.taskId) ?? { taskId: active.taskId, title: active.task.title, seconds: 0 };
      item.seconds += activeSeconds;
      map.set(active.taskId, item);
    }
    return {
      date,
      totalSeconds: logs.reduce((sum, log) => sum + log.durationSeconds, 0) + activeSeconds,
      completedCount: tasks.filter((task) => task.completedAt && task.completedAt >= start && task.completedAt < end).length,
      pendingCount: tasks.filter((task) => task.status === 'PENDING').length,
      inProgressCount: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
      tasksWorkedOn: [...map.values()].sort((a, b) => b.seconds - a.seconds),
      logs,
      active,
    };
  }

  async weekly(userId: string, query: DailySummaryQueryDto) {
    const offset = query.timezoneOffset ?? 0;
    const endDate = query.date ?? this.localDate(new Date(), offset);
    const endDay = new Date(`${endDate}T00:00:00.000Z`);
    const startDay = new Date(endDay);
    startDay.setUTCDate(startDay.getUTCDate() - 6);
    const startDate = startDay.toISOString().slice(0, 10);
    const { start } = this.dayRange(startDate, offset);
    const { end } = this.dayRange(endDate, offset);
    const [logs, completed] = await Promise.all([
      this.prisma.timeLog.findMany({ where: { userId, startedAt: { gte: start, lt: end } }, select: { startedAt: true, durationSeconds: true } }),
      this.prisma.task.count({ where: { userId, completedAt: { gte: start, lt: end } } }),
    ]);
    const totals = new Map<string, number>();
    for (const log of logs) {
      const key = this.localDate(log.startedAt, offset);
      totals.set(key, (totals.get(key) ?? 0) + log.durationSeconds);
    }
    const days = Array.from({ length: 7 }, (_, index) => {
      const cursor = new Date(startDay);
      cursor.setUTCDate(cursor.getUTCDate() + index);
      const date = cursor.toISOString().slice(0, 10);
      return { date, seconds: totals.get(date) ?? 0 };
    });
    const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0);
    const mostProductive = [...days].sort((a, b) => b.seconds - a.seconds)[0];
    return {
      startDate,
      endDate,
      totalSeconds,
      averageSeconds: Math.round(totalSeconds / 7),
      activeDays: days.filter((day) => day.seconds > 0).length,
      completedCount: completed,
      mostProductiveDay: mostProductive.seconds > 0 ? mostProductive.date : null,
      days,
    };
  }

  private localDate(value: Date, timezoneOffset: number) {
    return new Date(value.getTime() - timezoneOffset * 60_000).toISOString().slice(0, 10);
  }

  private dayRange(date: string, timezoneOffset: number) {
    const start = new Date(`${date}T00:00:00.000Z`);
    start.setUTCMinutes(start.getUTCMinutes() + timezoneOffset);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }
}
