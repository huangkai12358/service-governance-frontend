import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteApp, fetchAppDetail, fetchAppList, fetchAppOptions, saveApp } from '@/api/appManage';
import { request } from '@/utils/request';

vi.mock('@/utils/request', () => ({
  request: vi.fn()
}));

const mockedRequest = vi.mocked(request);

describe('appManage api', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('查询 APP 列表时转换分页参数和后端字段', async () => {
    mockedRequest.mockResolvedValue({
      records: [
        {
          appId: 7,
          appCode: 'order-service',
          appName: '订单中心',
          appDescription: '订单能力',
          hasPwd1: 1,
          hasPwd2: 0,
          createTime: '2026-05-13T09:30:00',
          updateTime: null
        }
      ],
      total: 1,
      pageNum: 2,
      pageSize: 20
    });

    const result = await fetchAppList({
      page: 2,
      pageSize: 20,
      app_code: 'order',
      app_name: '订单'
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/app/list', {
      method: 'POST',
      body: JSON.stringify({
        pageNum: 2,
        pageSize: 20,
        appCode: 'order',
        appName: '订单'
      })
    });
    expect(result).toEqual({
      list: [
        {
          id: 7,
          app_code: 'order-service',
          app_name: '订单中心',
          has_pwd1: true,
          has_pwd2: false,
          app_description: '订单能力',
          create_time: '2026-05-13 09:30:00',
          update_time: '-'
        }
      ],
      total: 1,
      page: 2,
      pageSize: 20
    });
  });

  it('新增 APP 时把前端密码槽位字段转换为后端字段', async () => {
    mockedRequest.mockResolvedValue({ appId: 9 });

    const result = await saveApp({
      app_code: 'risk-engine',
      app_name: '风控引擎',
      app_description: '风险决策',
      primary_password: 'Risk2026A',
      secondary_password: ''
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/app/add', {
      method: 'POST',
      body: JSON.stringify({
        appCode: 'risk-engine',
        appName: '风控引擎',
        appPwd1: 'Risk2026A',
        appPwd2: undefined,
        description: '风险决策'
      })
    });
    expect(result).toEqual({
      data: { appId: 9 },
      message: '新增成功'
    });
  });

  it('查询 APP 详情时复用列表字段映射逻辑', async () => {
    mockedRequest.mockResolvedValue({
      appId: 8,
      appCode: 'user-service',
      appName: '用户中心',
      description: '用户能力',
      primaryPassword: 'configured',
      secondaryPassword: '',
      createTime: null,
      updateTime: '2026-05-13T10:00:00'
    });

    const result = await fetchAppDetail(8);

    expect(mockedRequest).toHaveBeenCalledWith('/api/app/detail', {
      method: 'POST',
      body: JSON.stringify({ appId: 8 })
    });
    expect(result).toEqual({
      id: 8,
      app_code: 'user-service',
      app_name: '用户中心',
      has_pwd1: true,
      has_pwd2: false,
      app_description: '用户能力',
      create_time: '-',
      update_time: '2026-05-13 10:00:00'
    });
  });

  it('查询 APP 选项时兼容后端数组和对象包裹结构', async () => {
    mockedRequest.mockResolvedValueOnce({
      apps: [{ appId: 1, appCode: 'order-service', appName: '订单中心' }]
    });
    mockedRequest.mockResolvedValueOnce([
      { appId: 2, appCode: 'pay-gateway', appName: '支付网关' }
    ]);

    await expect(fetchAppOptions()).resolves.toEqual([
      { id: 1, app_code: 'order-service', app_name: '订单中心' }
    ]);
    await expect(fetchAppOptions()).resolves.toEqual([
      { id: 2, app_code: 'pay-gateway', app_name: '支付网关' }
    ]);
  });

  it('编辑 APP 时提交新增认证值和删除标记', async () => {
    mockedRequest.mockResolvedValue(null);

    await saveApp({
      id: 5,
      app_code: 'pay-gateway',
      app_name: '支付网关',
      app_password: 'PayGateway2026',
      delete_pwd1: true,
      delete_pwd2: false
    });

    expect(mockedRequest).toHaveBeenCalledWith('/api/app/update', {
      method: 'POST',
      body: JSON.stringify({
        appId: 5,
        appName: '支付网关',
        appPwd: 'PayGateway2026',
        deletePwd1: true,
        deletePwd2: false,
        description: undefined
      })
    });
  });

  it('删除 APP 时提交 appId 并返回成功提示', async () => {
    mockedRequest.mockResolvedValue(null);

    const result = await deleteApp(6);

    expect(mockedRequest).toHaveBeenCalledWith('/api/app/delete', {
      method: 'POST',
      body: JSON.stringify({ appId: 6 })
    });
    expect(result).toEqual({ message: '删除成功' });
  });
});
