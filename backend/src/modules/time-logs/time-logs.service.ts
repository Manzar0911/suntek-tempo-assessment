import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateManualLogDto } from './dto/create-manual-log.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeLogsRepository } from './time-logs.repository';

@Injectable()
export class TimeLogsService {
  constructor(private readonly repository: TimeLogsRepository) {}
  active(userId: string) { return this.repository.active(userId); }
  list(userId: string, taskId?: string) { return this.repository.list(userId, taskId); }
  async start(userId: string, dto: StartTimerDto) {
    const task = await this.repository.ownedTask(userId, dto.taskId);
    if (!task) throw new NotFoundException('Task not found.');
    if (await this.active(userId)) throw new ConflictException('Stop the current timer before starting another one.');
    try {
      return await this.repository.client.$transaction(async (tx) => {
        if (task.status === 'PENDING') await tx.task.update({ where: { id: task.id }, data: { status: 'IN_PROGRESS' } });
        return tx.activeTimer.create({ data: { userId, taskId: dto.taskId, note: dto.note }, include: { task: { select: { id: true, title: true, priority: true } } } });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A timer is already running.');
      throw error;
    }
  }
  async stop(userId: string, dto: StopTimerDto) {
    const active = await this.repository.client.activeTimer.findUnique({ where: { userId } });
    if (!active) throw new NotFoundException('There is no active timer to stop.');
    const endedAt = new Date();
    const durationSeconds = Math.max(1, Math.floor((endedAt.getTime() - active.startedAt.getTime()) / 1000));
    return this.repository.client.$transaction(async (tx) => {
      if (!(await tx.activeTimer.deleteMany({ where: { id: active.id, userId } })).count) throw new ConflictException('The timer was already stopped in another tab.');
      const log = await tx.timeLog.create({ data: { userId, taskId: active.taskId, startedAt: active.startedAt, endedAt, durationSeconds, note: dto.note || active.note } });
      await tx.task.update({ where: { id: active.taskId }, data: { totalDurationSeconds: { increment: durationSeconds } } });
      return log;
    });
  }
  async manual(userId: string, dto: CreateManualLogDto) {
    if (dto.endedAt <= dto.startedAt) throw new BadRequestException('End time must be after start time.');
    const seconds = Math.floor((dto.endedAt.getTime() - dto.startedAt.getTime()) / 1000);
    if (seconds > 86_400) throw new BadRequestException('A single entry cannot exceed 24 hours.');
    if (!(await this.repository.ownedTask(userId, dto.taskId))) throw new NotFoundException('Task not found.');
    return this.repository.client.$transaction(async (tx) => {
      const log = await tx.timeLog.create({ data: { ...dto, userId, durationSeconds: seconds } });
      await tx.task.update({ where: { id: dto.taskId }, data: { totalDurationSeconds: { increment: seconds } } });
      return log;
    });
  }
  async remove(userId: string, id: string) {
    const log = await this.repository.findOwned(userId, id);
    if (!log) throw new NotFoundException('Time log not found.');
    await this.repository.client.$transaction([this.repository.client.timeLog.delete({ where: { id } }), this.repository.client.task.update({ where: { id: log.taskId }, data: { totalDurationSeconds: { decrement: log.durationSeconds } } })]);
    return { id };
  }
}
