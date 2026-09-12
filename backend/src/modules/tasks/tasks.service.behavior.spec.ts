import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../common/enums/task.enums';
import { TasksService } from './tasks.service';

describe('TasksService behavior', () => {
  const repository = { list: jest.fn(), create: jest.fn(), findOwned: jest.fn(), updateOwned: jest.fn(), deleteOwned: jest.fn() };
  const service = new TasksService(repository as never);
  beforeEach(() => jest.clearAllMocks());

  it('records completion time when a task is created completed', async () => {
    repository.create.mockImplementation((_userId, data) => Promise.resolve(data));
    const result = await service.create('u1', { title: 'Done', status: TaskStatus.COMPLETED });
    expect(repository.create).toHaveBeenCalledWith('u1', expect.objectContaining({ description: null, completedAt: expect.any(Date) }));
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it('preserves omitted fields and clears blank descriptions on update', async () => {
    repository.findOwned.mockResolvedValue({ id: 't1', completedAt: null });
    repository.updateOwned.mockResolvedValue({ count: 1 });
    await service.update('u1', 't1', { description: '' });
    expect(repository.updateOwned).toHaveBeenCalledWith('u1', 't1', expect.objectContaining({ description: null, completedAt: undefined }));
  });

  it('preserves the original completion timestamp on repeated completed updates', async () => {
    const completedAt = new Date('2026-01-01T12:00:00Z');
    repository.findOwned.mockResolvedValue({ id: 't1', completedAt });
    repository.updateOwned.mockResolvedValue({ count: 1 });
    await service.update('u1', 't1', { status: TaskStatus.COMPLETED });
    expect(repository.updateOwned).toHaveBeenCalledWith('u1', 't1', expect.objectContaining({ completedAt }));
  });

  it('clears completion time when a completed task is reopened', async () => {
    repository.findOwned.mockResolvedValue({ id: 't1', completedAt: new Date() });
    repository.updateOwned.mockResolvedValue({ count: 1 });
    await service.update('u1', 't1', { status: TaskStatus.PENDING });
    expect(repository.updateOwned).toHaveBeenCalledWith('u1', 't1', expect.objectContaining({ completedAt: null }));
  });

  it('returns not found when deleting a missing or foreign task', async () => {
    repository.deleteOwned.mockResolvedValue({ count: 0 });
    await expect(service.remove('u1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([['urgent client response', 'HIGH'], ['archive whenever convenient', 'LOW'], ['prepare weekly notes', 'MEDIUM']])('infers %s as %s priority', (prompt, expected) => {
    expect(service.enhance({ prompt }).priority).toBe(expected);
  });

  it('normalizes whitespace, terminal punctuation, and excessively long suggestions', () => {
    const enhanced = service.enhance({ prompt: `  ${'write a clear project brief '.repeat(5)}!!!  ` });
    expect(enhanced.title).toHaveLength(76);
    expect(enhanced.title.endsWith('...')).toBe(true);
    expect(enhanced.description).not.toMatch(/\s{2,}/);
    expect(enhanced.source).toBe('smart-local');
  });
});
