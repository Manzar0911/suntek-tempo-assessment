import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Priority, TaskStatus } from '../../common/enums/task.enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, filters: { status?: TaskStatus; priority?: Priority; search?: string }) {
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.search && { OR: [{ title: { contains: filters.search } }, { description: { contains: filters.search } }] }),
    };
    return this.prisma.task.findMany({ where, orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }] });
  }

  upcomingReminders(userId: string, from: Date, until: Date) {
    return this.prisma.task.findMany({
      where: { userId, status: { not: TaskStatus.COMPLETED }, reminderAt: { gte: from, lte: until } },
      orderBy: { reminderAt: 'asc' },
    });
  }

  findOwned(userId: string, id: string) { return this.prisma.task.findFirst({ where: { id, userId }, include: { timeLogs: { orderBy: { startedAt: 'desc' } } } }); }
  create(userId: string, data: Prisma.TaskUncheckedCreateWithoutUserInput) { return this.prisma.task.create({ data: { ...data, userId } }); }
  updateOwned(userId: string, id: string, data: Prisma.TaskUpdateManyMutationInput) { return this.prisma.task.updateMany({ where: { id, userId }, data }); }
  deleteOwned(userId: string, id: string) { return this.prisma.task.deleteMany({ where: { id, userId } }); }
}
