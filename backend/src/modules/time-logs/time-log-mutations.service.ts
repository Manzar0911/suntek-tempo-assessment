import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';

@Injectable()
export class TimeLogMutationsService {
  constructor(private readonly prisma: PrismaService) {}
  async update(userId: string, id: string, dto: UpdateTimeLogDto) {
    const current = await this.prisma.timeLog.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundException('Time log not found.');
    const startedAt = dto.startedAt ?? current.startedAt;
    const endedAt = dto.endedAt ?? current.endedAt;
    if (endedAt <= startedAt) throw new BadRequestException('End time must be after start time.');
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    if (durationSeconds > 86_400) throw new BadRequestException('A single entry cannot exceed 24 hours.');
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.timeLog.update({ where: { id }, data: { startedAt, endedAt, durationSeconds, note: dto.note } });
      await tx.task.update({ where: { id: current.taskId }, data: { totalDurationSeconds: { increment: durationSeconds - current.durationSeconds } } });
      return log;
    });
  }
}
