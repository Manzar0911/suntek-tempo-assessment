import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from './api';

describe('API request transport', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends JSON requests with credentials and unwraps successful data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { id: 't1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await request<{ id: string }>('/tasks', { method: 'POST', body: '{"title":"Focus"}' });

    expect(result).toEqual({ id: 't1' });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1/tasks', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('preserves caller-provided headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);
    await request('/auth/me', { headers: { 'X-Trace-Id': 'trace-1' } });
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json', 'X-Trace-Id': 'trace-1' });
  });

  it('surfaces the API error message from a failed envelope', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ success: false, error: { message: 'Timer already running.', code: 'CONFLICT' } }),
    }));
    await expect(request('/timelogs/start')).rejects.toThrow('Timer already running.');
  });

  it('falls back to the status code for an empty or malformed error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new Error('invalid json')) }));
    await expect(request('/tasks')).rejects.toThrow('Request failed (502)');
  });

  it('rejects a malformed success response even when HTTP status is 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ data: [] }) }));
    await expect(request('/tasks')).rejects.toThrow('Request failed (200)');
  });
});
