import { request } from '@/utils/request';
import type { PageResult } from '@/types/common';

export interface AppManageQuery {
  page: number;
  pageSize: number;
  app_code?: string;
  app_name?: string;
}

export interface AppManageItem {
  id: number;
  app_code: string;
  app_name: string;
  has_pwd1: boolean;
  has_pwd2: boolean;
  app_description: string;
  create_time: string;
  update_time: string;
}

export interface AppManageDetail extends AppManageItem {}

export interface AppManagePayload {
  id?: number;
  app_code: string;
  app_name: string;
  app_description?: string;
  primary_password?: string;
  secondary_password?: string;
  app_password?: string;
  delete_pwd1?: boolean;
  delete_pwd2?: boolean;
}

export interface AppOption {
  id: number;
  app_code: string;
  app_name: string;
}

interface AppBackendItem {
  appId: number;
  appCode: string;
  appName: string;
  appDescription?: string | null;
  description?: string | null;
  primaryPassword?: string | null;
  secondaryPassword?: string | null;
  createTime: string | null;
  updateTime: string | null;
}

interface AppListBackendResponse {
  total: number;
  pageNum?: number;
  pageSize?: number;
  current?: number;
  size?: number;
  records: AppBackendItem[];
}

interface AppOptionBackendItem {
  appId: number;
  appCode: string;
  appName: string;
}

function formatDateTime(value: string | null | undefined) {
  return value ? value.replace('T', ' ') : '-';
}

function mapAppItem(item: AppBackendItem): AppManageItem {
  return {
    id: item.appId,
    app_code: item.appCode,
    app_name: item.appName,
    has_pwd1: Boolean(item.primaryPassword),
    has_pwd2: Boolean(item.secondaryPassword),
    app_description: item.appDescription || item.description || '',
    create_time: formatDateTime(item.createTime),
    update_time: formatDateTime(item.updateTime)
  };
}

export async function fetchAppList(query: AppManageQuery): Promise<PageResult<AppManageItem>> {
  const data = await request<AppListBackendResponse>('/api/app/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      appCode: query.app_code || undefined,
      appName: query.app_name || undefined
    })
  });

  return {
    list: data.records.map(mapAppItem),
    total: data.total,
    page: data.pageNum ?? data.current ?? query.page,
    pageSize: data.pageSize ?? data.size ?? query.pageSize
  };
}

export async function fetchAppDetail(appId: number): Promise<AppManageDetail> {
  const data = await request<AppBackendItem>('/api/app/detail', {
    method: 'POST',
    body: JSON.stringify({ appId })
  });
  return mapAppItem(data);
}

export async function fetchAppOptions(): Promise<AppOption[]> {
  const data = await request<{ apps: AppOptionBackendItem[] }>('/api/app/options', {
    method: 'POST',
    body: JSON.stringify({})
  });
  return data.apps.map((item) => ({
    id: item.appId,
    app_code: item.appCode,
    app_name: item.appName
  }));
}

export async function saveApp(payload: AppManagePayload) {
  const isEdit = Boolean(payload.id);
  const data = await request<{ appId?: number } | null>(isEdit ? '/api/app/update' : '/api/app/add', {
    method: 'POST',
    body: JSON.stringify(isEdit
      ? {
          appId: payload.id,
          appName: payload.app_name,
          appPwd: payload.app_password || undefined,
          deletePwd1: Boolean(payload.delete_pwd1),
          deletePwd2: Boolean(payload.delete_pwd2),
          description: payload.app_description || undefined
        }
      : {
          appCode: payload.app_code,
          appName: payload.app_name,
          appPwd1: payload.primary_password,
          appPwd2: payload.secondary_password || undefined,
          description: payload.app_description || undefined
        })
  });

  return {
    data,
    message: isEdit ? '保存成功' : '新增成功'
  };
}

export async function deleteApp(appId: number) {
  await request('/api/app/delete', {
    method: 'POST',
    body: JSON.stringify({ appId })
  });

  return {
    message: '删除成功'
  };
}
