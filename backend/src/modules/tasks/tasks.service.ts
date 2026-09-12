import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../common/enums/task.enums';
import { CreateTaskDto } from './dto/create-task.dto';
import { EnhanceTaskDto } from './dto/enhance-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly repository: TasksRepository) {}
  list(userId: string, query: TaskQueryDto) { return this.repository.list(userId, query); }

  upcomingReminders(userId: string, hours: number) {
    const from = new Date();
    return this.repository.upcomingReminders(userId, from, new Date(from.getTime() + hours * 60 * 60 * 1000));
  }

  create(userId: string, dto: CreateTaskDto) {
    this.validateSchedule(dto.dueAt, dto.reminderAt);
    return this.repository.create(userId, { ...dto, description: dto.description || null, completedAt: dto.status === TaskStatus.COMPLETED ? new Date() : null });
  }

  async get(userId: string, id: string) {
    const task = await this.repository.findOwned(userId, id);
    if (!task) throw new NotFoundException('Task not found.');
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const current = await this.get(userId, id);
    this.validateSchedule(dto.dueAt ?? current.dueAt, dto.reminderAt ?? current.reminderAt);
    await this.repository.updateOwned(userId, id, {
      ...dto,
      description: dto.description === undefined ? undefined : dto.description || null,
      completedAt: dto.status === TaskStatus.COMPLETED ? current.completedAt ?? new Date() : dto.status ? null : undefined,
    });
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    if (!(await this.repository.deleteOwned(userId, id)).count) throw new NotFoundException('Task not found.');
    return { id };
  }

  enhance(dto: EnhanceTaskDto) {
    const cleaned = dto.prompt.replace(/\s+/g, ' ').trim();
    const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/[.!?]+$/, '');
    const priority = /urgent|asap|critical|today/i.test(cleaned) ? 'HIGH' : /whenever|optional|later/i.test(cleaned) ? 'LOW' : 'MEDIUM';
    return { title: title.length > 76 ? `${title.slice(0, 73)}...` : title, description: `Complete this action: ${cleaned}. Add the relevant context, owner, and expected outcome before starting.`, priority, source: 'smart-local' };
  }

  private validateSchedule(dueAt?: Date | null, reminderAt?: Date | null) {
    if (dueAt && reminderAt && reminderAt > dueAt) throw new BadRequestException('Reminder time must be before the task due time.');
  }
}
