import { BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';

describe('TasksService reminders', () => {
  const repository = { list: jest.fn(), create: jest.fn(), findOwned: jest.fn(), updateOwned: jest.fn(), deleteOwned: jest.fn(), upcomingReminders: jest.fn() };
  const service = new TasksService(repository as never);
  beforeEach(() => jest.clearAllMocks());

  it('queries a bounded user-scoped upcoming window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-11T10:00:00Z'));
    repository.upcomingReminders.mockResolvedValue([]);
    await service.upcomingReminders('u1', 24);
    expect(repository.upcomingReminders).toHaveBeenCalledWith('u1', new Date('2026-09-11T10:00:00Z'), new Date('2026-09-12T10:00:00Z'));
    jest.useRealTimers();
  });

  it('rejects a reminder scheduled after the due date', () => {
    expect(() => service.create('u1', { title: 'Brief', dueAt: new Date('2026-09-11T12:00:00Z'), reminderAt: new Date('2026-09-11T13:00:00Z') })).toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('persists a valid due date and reminder together', async () => {
    const dueAt = new Date('2026-09-11T12:00:00Z');
    const reminderAt = new Date('2026-09-11T11:30:00Z');
    repository.create.mockResolvedValue({ id: 't1' });
    await service.create('u1', { title: 'Brief', dueAt, reminderAt });
    expect(repository.create).toHaveBeenCalledWith('u1', expect.objectContaining({ dueAt, reminderAt }));
  });
});
