import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { request, RequestError } from '@/utils/request';
import { getStoredUser, setSessionToken, setStoredUser } from '@/utils/storage';

describe('request util', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('默认使用 JSON 请求头并自动携带 sessionToken', async () => {
    setSessionToken('session-001');
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ code: 0, message: 'ok', data: { ok: true } })
    } as Response);

    const result = await request<{ ok: boolean }>('/api/app/list', {
      method: 'POST',
      body: JSON.stringify({})
    });
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers;

    expect(result).toEqual({ ok: true });
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/app/list');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('sessionToken')).toBe('session-001');
  });

  it('FormData 请求体不自动设置 JSON 请求头', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ code: 200, message: 'ok', data: null })
    } as Response);

    await request('/api/smartdoc/analyze', {
      method: 'POST',
      body: new FormData()
    });
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers;

    expect(headers.has('Content-Type')).toBe(false);
  });

  it('业务失败时抛出包含后端错误码的 RequestError', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ code: 50001, message: '保存失败', data: null })
    } as Response);

    await expect(request('/api/app/update')).rejects.toMatchObject({
      name: 'Error',
      code: 50001,
      message: '保存失败'
    } satisfies Partial<RequestError>);
  });

  it('登录态过期时清理本地会话信息', async () => {
    window.history.pushState({}, '', '/login');
    setSessionToken('session-001');
    setStoredUser('admin');
    expect(getStoredUser()).toBe('admin');
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ code: 40102, message: '登录已过期', data: null })
    } as Response);

    await expect(request('/api/app/list')).rejects.toBeInstanceOf(RequestError);

    expect(localStorage.getItem('sg_session_token')).toBeNull();
    expect(localStorage.getItem('sg_user')).toBeNull();
  });
});
