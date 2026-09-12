import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimeLogsRepository {
  constructor(private readonly prisma: PrismaService) {}
  active(userId: string) { return this.prisma.activeTimer.findUnique({ where: { userId }, include: { task: { select: { id: true, title: true, priority: true } } } }); }
  ownedTask(userId: string, taskId: string) { return this.prisma.task.findFirst({ where: { id: taskId, userId }, select: { id: true, status: true } }); }
  list(userId: string, taskId?: string) { return this.prisma.timeLog.findMany({ where: { userId, ...(taskId && { taskId }) }, include: { task: { select: { id: true, title: true, priority: true } } }, orderBy: { startedAt: 'desc' }, take: 100 }); }
  findOwned(userId: string, id: string) { return this.prisma.timeLog.findFirst({ where: { id, userId } }); }
  get client() { return this.prisma; }
}
