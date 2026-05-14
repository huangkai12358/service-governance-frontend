import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchReverseApiNameOptions,
  fetchReverseApiPathOptions,
  fetchReverseAppCodeOptions,
  fetchReverseAppNameOptions,
  fetchReverseAuthApiList,
  fetchReverseAuthEditor,
  fetchReverseAuthorizedTargetDetail,
  saveReverseAuthorization
} from '@/api/authorization';
import { request } from '@/utils/request';

vi.mock('@/utils/request', () => ({
  request: vi.fn()
}));

const mockedRequest = vi.mocked(request);

describe('authorization api', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('查询反向授权列表时转换筛选条件和列表字段', async () => {
    mockedRequest.mockResolvedValue({
      records: [
        {
          apiId: 18,
          apiName: '创建订单',
          apiPath: '/orders',
          apiMethod: 'POST',
          appCode: 'order-service',
          appName: '订单中心',
          authorizedAppCount: 3
        }
      ],
      total: 1,
      current: 3,
      size: 10
    });

    const result = await fetchReverseAuthApiList({
      page: 3,
      pageSize: 10,
      app_code: 'order',
      app_name: '订单',
      api_name: '创建',
      api_path: '/orders'
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/authorization/reverse/list', {
      method: 'POST',
      body: JSON.stringify({
        pageNum: 3,
        pageSize: 10,
        appCode: 'order',
        appName: '订单',
        apiName: '创建',
        path: '/orders'
      })
    });
    expect(result.data.list[0]).toEqual({
      api_id: 18,
      app_code: 'order-service',
      app_name: '订单中心',
      api_name: '创建订单',
      api_path: '/orders',
      api_method: 'POST',
      authorized_app_count: 3
    });
  });

  it('打开反向授权编辑器时组合应用选项、选中应用和 API 明细', async () => {
    mockedRequest
      .mockResolvedValueOnce({
        apps: [
          { appCode: 'user-service', appName: '用户中心' },
          { app_code: 'pay-gateway', app_name: '支付网关' }
        ]
      })
      .mockResolvedValueOnce({
        api: {
          apiId: 18,
          apiName: '创建订单',
          apiPath: '/orders',
          apiMethod: 'POST',
          appCode: 'order-service',
          appName: '订单中心'
        },
        apps: [{ appCode: 'user-service' }]
      });

    const result = await fetchReverseAuthEditor([18]);

    expect(mockedRequest).toHaveBeenCalledTimes(2);
    expect(result.data).toEqual({
      selected_apis: [
        {
          id: 18,
          api_name: '创建订单',
          api_path: '/orders',
          api_method: 'POST',
          app_code: 'order-service',
          app_name: '订单中心'
        }
      ],
      apps: [
        { app_code: 'user-service', app_name: '用户中心' },
        { app_code: 'pay-gateway', app_name: '支付网关' }
      ],
      checked_app_codes: ['user-service']
    });
  });

  it('查询反向授权详情缺少 API 时返回稳定的空详情', async () => {
    mockedRequest.mockResolvedValue({
      api: null,
      apps: [{ app_code: 'risk-engine', app_name: '风控引擎' }]
    });

    const result = await fetchReverseAuthorizedTargetDetail(99);

    expect(result.data).toEqual({
      api: {
        id: 99,
        app_code: '',
        app_name: '',
        api_name: '',
        api_path: '',
        api_method: 'GET'
      },
      apps: [{ app_code: 'risk-engine', app_name: '风控引擎' }]
    });
  });

  it('保存反向授权时转换选中 API 和应用编码', async () => {
    mockedRequest.mockResolvedValue(true);

    const result = await saveReverseAuthorization({
      selected_apis: [{ id: 18, api_path: '/orders', app_code: 'order-service' }],
      checked_app_codes: ['user-service'],
      original_app_codes: ['pay-gateway']
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/authorization/reverse/save', {
      method: 'POST',
      body: JSON.stringify({
        selectedApis: [{ apiId: 18, apiPath: '/orders', appCode: 'order-service' }],
        checkedAppCodes: ['user-service'],
        originalAppCodes: ['pay-gateway']
      })
    });
    expect(result).toEqual({
      code: 0,
      message: '保存成功'
    });
  });

  it('查询反向授权筛选候选项时提交统一关键字请求体', async () => {
    mockedRequest
      .mockResolvedValueOnce(['account-service-01'])
      .mockResolvedValueOnce(['账户服务01'])
      .mockResolvedValueOnce(['账户账单创建01'])
      .mockResolvedValueOnce(['/api/account/01/bills/create-01']);

    await expect(fetchReverseAppCodeOptions('account')).resolves.toEqual(['account-service-01']);
    await expect(fetchReverseAppNameOptions('账户')).resolves.toEqual(['账户服务01']);
    await expect(fetchReverseApiNameOptions('账户账单')).resolves.toEqual(['账户账单创建01']);
    await expect(fetchReverseApiPathOptions('/api/account')).resolves.toEqual(['/api/account/01/bills/create-01']);

    expect(mockedRequest).toHaveBeenNthCalledWith(1, '/api/authorization/reverse/app-code-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'account' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(2, '/api/authorization/reverse/app-name-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '账户' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(3, '/api/authorization/reverse/api-name-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '账户账单' })
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(4, '/api/authorization/reverse/api-path-options', {
      method: 'POST',
      body: JSON.stringify({ keyword: '/api/account' })
    });
  });
});
