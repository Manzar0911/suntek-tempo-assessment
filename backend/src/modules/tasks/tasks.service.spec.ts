import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';

describe('TasksService ownership', () => {
  const repository = { list: jest.fn(), create: jest.fn(), findOwned: jest.fn(), updateOwned: jest.fn(), deleteOwned: jest.fn() };
  const service = new TasksService(repository as never);
  beforeEach(() => jest.clearAllMocks());
  it('always passes the authenticated user id to list', async () => { repository.list.mockResolvedValue([]); await service.list('owner-1', {}); expect(repository.list).toHaveBeenCalledWith('owner-1', {}); });
  it('does not reveal another user task', async () => { repository.findOwned.mockResolvedValue(null); await expect(service.get('owner-1', 'foreign-task')).rejects.toBeInstanceOf(NotFoundException); expect(repository.findOwned).toHaveBeenCalledWith('owner-1', 'foreign-task'); });
  it('scopes deletion by authenticated user', async () => { repository.deleteOwned.mockResolvedValue({ count: 1 }); await service.remove('owner-1', 'task-1'); expect(repository.deleteOwned).toHaveBeenCalledWith('owner-1', 'task-1'); });
});
