import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));
vi.mock('./api', () => ({ request: requestMock }));

import { workspaceService } from './workspace.service';

describe('workspaceService endpoint mapping', () => {
  beforeEach(() => requestMock.mockReset());

  it('serializes only populated task filters', async () => {
    await workspaceService.tasks({ search: 'brief', status: 'IN_PROGRESS', priority: '' });
    expect(requestMock).toHaveBeenCalledWith('/tasks?search=brief&status=IN_PROGRESS');
  });

  it('maps task mutations to the expected methods and JSON bodies', async () => {
    await workspaceService.createTask({ title: 'Focus', priority: 'HIGH' });
    await workspaceService.updateTask('t1', { status: 'COMPLETED' });
    await workspaceService.deleteTask('t1');
    expect(requestMock).toHaveBeenNthCalledWith(1, '/tasks', { method: 'POST', body: '{"title":"Focus","priority":"HIGH"}' });
    expect(requestMock).toHaveBeenNthCalledWith(2, '/tasks/t1', { method: 'PATCH', body: '{"status":"COMPLETED"}' });
    expect(requestMock).toHaveBeenNthCalledWith(3, '/tasks/t1', { method: 'DELETE' });
  });

  it('maps timer start and stop commands', async () => {
    await workspaceService.start('t1');
    await workspaceService.stop();
    expect(requestMock).toHaveBeenNthCalledWith(1, '/timelogs/start', { method: 'POST', body: '{"taskId":"t1"}' });
    expect(requestMock).toHaveBeenNthCalledWith(2, '/timelogs/stop', { method: 'POST', body: '{}' });
  });

  it('uses the browser timezone offset in daily summaries', async () => {
    const offset = new Date().getTimezoneOffset();
    await workspaceService.summary();
    expect(requestMock).toHaveBeenCalledWith(`/analytics/daily-summary?timezoneOffset=${offset}`);
  });
});
