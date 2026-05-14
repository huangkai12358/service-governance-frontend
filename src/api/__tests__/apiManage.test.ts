import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchApiAppCodeOptions,
  fetchApiAppNameOptions,
  fetchApiNameOptions,
  fetchApiPathOptions,
  fetchApiVersionOptions
} from '@/api/apiManage';
import { request } from '@/utils/request';

vi.mock('@/utils/request', () => ({
  request: vi.fn()
}));

const mockedRequest = vi.mocked(request);

describe('apiManage api', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('查询 API 列表筛选候选项时提交统一关键字请求体', async () => {
    mockedRequest
      .mockResolvedValueOnce(['auth-service'])
      .mockResolvedValueOnce(['服务治理'])
      .mockResolvedValueOnce(['查询首页概览'])
      .mockResolvedValueOnce(['/api/dashboard/overview'])
      .mockResolvedValueOnce(['code']);

    await expect(fetchApiAppCodeOptions('auth')).resolves.toEqual(['auth-service']);
    await expect(fetchApiAppNameOptions('服务')).resolves.toEqual(['服务治理']);
    await expect(fetchApiNameOptions('查询')).resolves.toEqual(['查询首页概览']);
    await expect(fetchApiPathOptions('/api/dash')).resolves.toEqual(['/api/dashboard/overview']);
    await expect(fetchApiVersionOptions('co')).resolves.toEqual(['code']);

    expect(mockedRequest).toHaveBeenNthCalledWith(1, '/api/apis/app-code-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'auth' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(2, '/api/apis/app-name-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '服务' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(3, '/api/apis/api-name-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '查询' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(4, '/api/apis/api-path-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '/api/dash' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(5, '/api/apis/version-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'co' })
    });
  });
});
