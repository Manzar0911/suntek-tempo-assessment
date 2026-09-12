import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';

describe('TimeLogsService', () => {
  const tx = {
    task: { update: jest.fn() },
    activeTimer: { create: jest.fn(), deleteMany: jest.fn() },
    timeLog: { create: jest.fn(), delete: jest.fn() },
  };
  const client = {
    activeTimer: { findUnique: jest.fn() },
    task: { update: jest.fn() },
    timeLog: { delete: jest.fn() },
    $transaction: jest.fn((operation: unknown) => typeof operation === 'function' ? operation(tx) : Promise.resolve(operation)),
  };
  const repository = {
    client,
    active: jest.fn(),
    list: jest.fn(),
    ownedTask: jest.fn(),
    findOwned: jest.fn(),
  };
  const service = new TimeLogsService(repository as never);

  beforeEach(() => {
    jest.clearAllMocks();
    client.$transaction.mockImplementation((operation: unknown) => typeof operation === 'function' ? operation(tx) : Promise.resolve(operation));
  });

  it('scopes active timer and log queries to the authenticated user', async () => {
    repository.active.mockResolvedValue(null);
    repository.list.mockResolvedValue([]);
    await service.active('u1');
    await service.list('u1', 'task-1');
    expect(repository.active).toHaveBeenCalledWith('u1');
    expect(repository.list).toHaveBeenCalledWith('u1', 'task-1');
  });

  it('rejects starting a timer for a task the user does not own', async () => {
    repository.ownedTask.mockResolvedValue(null);
    await expect(service.start('u1', { taskId: 'foreign' })).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.active).not.toHaveBeenCalled();
  });

  it('enforces one active timer per user', async () => {
    repository.ownedTask.mockResolvedValue({ id: 't1', status: 'PENDING' });
    repository.active.mockResolvedValue({ id: 'running' });
    await expect(service.start('u1', { taskId: 't1' })).rejects.toBeInstanceOf(ConflictException);
    expect(client.$transaction).not.toHaveBeenCalled();
  });

  it('moves a pending task into progress when timing starts', async () => {
    repository.ownedTask.mockResolvedValue({ id: 't1', status: 'PENDING' });
    repository.active.mockResolvedValue(null);
    tx.activeTimer.create.mockResolvedValue({ id: 'timer-1' });
    await service.start('u1', { taskId: 't1', note: 'Focus' });
    expect(tx.task.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { status: 'IN_PROGRESS' } });
    expect(tx.activeTimer.create).toHaveBeenCalledWith(expect.objectContaining({ data: { userId: 'u1', taskId: 't1', note: 'Focus' } }));
  });

  it('stops atomically, creates a minimum one-second log, and increments the task total', async () => {
    const now = new Date('2026-09-11T10:00:00.500Z');
    jest.useFakeTimers().setSystemTime(now);
    client.activeTimer.findUnique.mockResolvedValue({ id: 'timer-1', taskId: 't1', startedAt: new Date('2026-09-11T10:00:00.200Z'), note: 'original' });
    tx.activeTimer.deleteMany.mockResolvedValue({ count: 1 });
    tx.timeLog.create.mockResolvedValue({ id: 'log-1' });
    const result = await service.stop('u1', {});
    expect(tx.timeLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ durationSeconds: 1, note: 'original' }) }));
    expect(tx.task.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { totalDurationSeconds: { increment: 1 } } });
    expect(result).toEqual({ id: 'log-1' });
    jest.useRealTimers();
  });

  it('rejects stopping when no timer exists', async () => {
    client.activeTimer.findUnique.mockResolvedValue(null);
    await expect(service.stop('u1', {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    ['equal timestamps', new Date('2026-01-01T10:00:00Z'), new Date('2026-01-01T10:00:00Z')],
    ['reversed timestamps', new Date('2026-01-01T11:00:00Z'), new Date('2026-01-01T10:00:00Z')],
    ['more than 24 hours', new Date('2026-01-01T10:00:00Z'), new Date('2026-01-02T10:00:01Z')],
  ])('rejects a manual log with %s', async (_label, startedAt, endedAt) => {
    await expect(service.manual('u1', { taskId: 't1', startedAt, endedAt })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a manual log and increments the denormalized total', async () => {
    repository.ownedTask.mockResolvedValue({ id: 't1' });
    tx.timeLog.create.mockResolvedValue({ id: 'log-1' });
    const dto = { taskId: 't1', startedAt: new Date('2026-01-01T10:00:00Z'), endedAt: new Date('2026-01-01T10:30:00Z'), note: 'Review' };
    await service.manual('u1', dto);
    expect(tx.timeLog.create).toHaveBeenCalledWith({ data: { ...dto, userId: 'u1', durationSeconds: 1800 } });
    expect(tx.task.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { totalDurationSeconds: { increment: 1800 } } });
  });

  it('refuses to delete another user’s log', async () => {
    repository.findOwned.mockResolvedValue(null);
    await expect(service.remove('u1', 'foreign')).rejects.toBeInstanceOf(NotFoundException);
  });
});
