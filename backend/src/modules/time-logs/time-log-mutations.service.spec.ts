import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimeLogMutationsService } from './time-log-mutations.service';

describe('TimeLogMutationsService', () => {
  const tx = { timeLog: { update: jest.fn() }, task: { update: jest.fn() } };
  const prisma = {
    timeLog: { findFirst: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  };
  const service = new TimeLogMutationsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) => Promise.resolve(callback(tx)));
  });

  it('looks up the log by both id and authenticated user id', async () => {
    prisma.timeLog.findFirst.mockResolvedValue(null);
    await expect(service.update('u1', 'foreign', { note: 'No access' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.timeLog.findFirst).toHaveBeenCalledWith({ where: { id: 'foreign', userId: 'u1' } });
  });

  it('rejects invalid and overlong corrected ranges', async () => {
    prisma.timeLog.findFirst.mockResolvedValue({ taskId: 't1', startedAt: new Date('2026-01-01T10:00:00Z'), endedAt: new Date('2026-01-01T11:00:00Z'), durationSeconds: 3600 });
    await expect(service.update('u1', 'l1', { endedAt: new Date('2026-01-01T09:00:00Z') })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.update('u1', 'l1', { endedAt: new Date('2026-01-02T10:00:01Z') })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('updates the log and applies only the duration delta to its task', async () => {
    prisma.timeLog.findFirst.mockResolvedValue({ taskId: 't1', startedAt: new Date('2026-01-01T10:00:00Z'), endedAt: new Date('2026-01-01T11:00:00Z'), durationSeconds: 3600 });
    tx.timeLog.update.mockResolvedValue({ id: 'l1', durationSeconds: 5400 });
    const endedAt = new Date('2026-01-01T11:30:00Z');
    const result = await service.update('u1', 'l1', { endedAt, note: 'Corrected' });
    expect(tx.timeLog.update).toHaveBeenCalledWith({ where: { id: 'l1' }, data: { startedAt: new Date('2026-01-01T10:00:00Z'), endedAt, durationSeconds: 5400, note: 'Corrected' } });
    expect(tx.task.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { totalDurationSeconds: { increment: 1800 } } });
    expect(result).toEqual({ id: 'l1', durationSeconds: 5400 });
  });
});
