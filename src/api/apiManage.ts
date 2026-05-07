import { apps as mockApps } from '@/mock/base';
import { request } from '@/utils/request';
import type { HttpMethod } from '@/types/business';
import type { PageResult } from '@/types/common';

export interface ApiManageQuery {
  page: number;
  pageSize: number;
  app_code?: string;
  app_name?: string;
  api_name?: string;
  api_path?: string;
  version?: string;
}

export interface ApiManageItem {
  id: number;
  app_id: number;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  version: string;
  api_description: string;
  create_time: string;
  update_time: string;
}

export interface ApiManagePayload {
  id?: number;
  app_id: number;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  api_description?: string;
}

export interface ApiAppOption {
  id: number;
  app_code: string;
  app_name: string;
}

interface ApiListBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: ApiBackendItem[];
}

interface ApiBackendItem {
  apiId: number;
  appId: number;
  appCode: string;
  appName: string;
  apiName: string;
  path: string;
  method: HttpMethod;
  version: string | null;
  description: string | null;
  createTime: string;
  updateTime: string;
}

function mapApiItem(item: ApiBackendItem): ApiManageItem {
  return {
    id: item.apiId,
    app_id: item.appId,
    app_code: item.appCode,
    app_name: item.appName,
    api_name: item.apiName,
    api_path: item.path,
    api_method: item.method,
    version: item.version || '-',
    api_description: item.description || '',
    create_time: item.createTime,
    update_time: item.updateTime
  };
}

export async function fetchApiList(query: ApiManageQuery): Promise<PageResult<ApiManageItem>> {
  const data = await request<ApiListBackendResponse>('/api/apis/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      appCode: query.app_code || undefined,
      appName: query.app_name || undefined,
      apiName: query.api_name || undefined,
      path: query.api_path || undefined,
      version: query.version || undefined
    })
  });

  return {
    list: data.records.map(mapApiItem),
    total: data.total,
    page: data.pageNum,
    pageSize: data.pageSize
  };
}

export async function fetchApiDetail(id: number): Promise<ApiManageItem | null> {
  const data = await request<ApiBackendItem>(`/api/apis/detail?id=${id}`);
  return data ? mapApiItem(data) : null;
}

export async function saveApi(payload: ApiManagePayload) {
  const isEdit = Boolean(payload.id);
  const data = await request<{ apiId?: number } | null>(isEdit ? '/api/apis/update' : '/api/apis/add', {
    method: 'POST',
    body: JSON.stringify({
      id: payload.id,
      appId: payload.app_id,
      apiName: payload.api_name,
      path: payload.api_path,
      method: payload.api_method,
      description: payload.api_description || ''
    })
  });

  return {
    data,
    message: isEdit ? '保存成功' : '新增成功'
  };
}

export async function fetchApiOptions() {
  const apps: ApiAppOption[] = mockApps
    .filter((item) => item.is_deleted === 0)
    .map((item) => ({
      id: item.id,
      app_code: item.app_code,
      app_name: item.app_name
    }));

  return { apps };
}
