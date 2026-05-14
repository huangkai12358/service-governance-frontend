import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeSmartDoc, confirmSmartDocImport } from '@/api/smartdoc';
import { request } from '@/utils/request';

vi.mock('@/utils/request', () => ({
  request: vi.fn()
}));

const mockedRequest = vi.mocked(request);

describe('smartdoc api', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('分析 SmartDoc 时使用 FormData 并转换差异结果', async () => {
    mockedRequest.mockResolvedValue({
      parseId: 'parse-001',
      draft: {
        appCode: 'order-service',
        version: 'v1.0.0',
        remark: null,
        fileName: 'smartdoc.json',
        filePath: '/tmp/smartdoc.json'
      },
      unchangedCount: 2,
      additions: [
        {
          id: null,
          appCode: 'order-service',
          appName: '订单中心',
          apiName: '创建订单',
          apiPath: '/orders',
          apiMethod: 'POST',
          apiDescription: null
        }
      ],
      modifications: [
        {
          id: 8,
          before: {
            id: 8,
            appCode: 'order-service',
            appName: '订单中心',
            apiName: '旧名称',
            apiPath: '/orders',
            apiMethod: 'POST',
            apiDescription: '旧描述'
          },
          after: {
            id: 8,
            appCode: 'order-service',
            appName: '订单中心',
            apiName: '新名称',
            apiPath: '/orders',
            apiMethod: 'POST',
            apiDescription: '新描述'
          },
          changedFields: ['api_name', 'api_description']
        }
      ],
      deprecations: []
    });

    const file = new File(['{}'], 'smartdoc.json', { type: 'application/json' });
    const result = await analyzeSmartDoc({
      file,
      app_code: 'order-service',
      version: 'v1.0.0',
      remark: '导入说明'
    });
    const requestOptions = mockedRequest.mock.calls[0][1];

    expect(mockedRequest.mock.calls[0][0]).toBe('/api/smartdoc/analyze');
    expect(requestOptions?.method).toBe('POST');
    expect(requestOptions?.body).toBeInstanceOf(FormData);
    expect(result.data).toMatchObject({
      parse_id: 'parse-001',
      draft: {
        app_code: 'order-service',
        version: 'v1.0.0',
        remark: '',
        file_name: 'smartdoc.json',
        file_path: '/tmp/smartdoc.json'
      },
      unchanged_count: 2,
      additions: [
        {
          id: 0,
          app_code: 'order-service',
          app_name: '订单中心',
          api_name: '创建订单',
          api_path: '/orders',
          api_method: 'POST',
          api_description: ''
        }
      ],
      modifications: [
        {
          id: 8,
          changed_fields: ['api_name', 'api_description']
        }
      ],
      deprecations: []
    });
  });

  it('确认 SmartDoc 导入时转换提交参数和导入结果', async () => {
    mockedRequest.mockResolvedValue({
      apiVersionId: 12,
      appCode: 'order-service',
      appName: '订单中心',
      version: 'v1.0.0',
      fileName: 'smartdoc.json',
      filePath: '/tmp/smartdoc.json',
      remark: null,
      unchangedCount: 2,
      additionCount: 1,
      modificationCount: 1,
      deprecationCount: 0,
      additions: [
        {
          id: 20,
          appCode: 'order-service',
          appName: '订单中心',
          apiName: '创建订单',
          apiPath: '/orders',
          apiMethod: 'POST',
          apiDescription: '创建订单接口'
        }
      ]
    });

    const result = await confirmSmartDocImport({
      parse_id: 'parse-001',
      app_code: 'order-service',
      version: 'v1.0.0'
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/smartdoc/import/confirm', {
      method: 'POST',
      body: JSON.stringify({
        parseId: 'parse-001',
        appCode: 'order-service',
        version: 'v1.0.0',
        remark: ''
      })
    });
    expect(result).toMatchObject({
      data: {
        api_version_id: 12,
        app_code: 'order-service',
        app_name: '订单中心',
        remark: '',
        addition_count: 1,
        additions: [
          {
            id: 20,
            api_name: '创建订单',
            api_description: '创建订单接口'
          }
        ]
      },
      message: '导入成功'
    });
  });
});
