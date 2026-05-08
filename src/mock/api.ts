import { post } from '@/api/client';
import type { PageQuery } from '@/types/common';

export interface ApiListQuery extends PageQuery {
  app_code?: string;
  app_name?: string;
  api_name?: string;
  api_path?: string;
  version?: string;
}

function toApiItem(item: any) {
  return {
    id: item.apiId ?? item.api_id ?? item.id,
    app_id: item.appId ?? item.app_id,
    app_code: item.appCode ?? item.app_code,
    app_name: item.appName ?? item.app_name,
    api_name: item.apiName ?? item.api_name,
    api_path: item.path ?? item.apiPath ?? item.api_path,
    api_method: item.method ?? item.apiMethod ?? item.api_method,
    version: item.version,
    api_description: item.description ?? item.apiDescription ?? item.api_description,
    create_time: item.createTime ?? item.create_time,
    update_time: item.updateTime ?? item.update_time,
    is_deleted: item.isDeleted ?? item.is_deleted ?? 0
  };
}

export async function fetchApiList(query: ApiListQuery) {
  const response = await post<any>('/api/apis/list', {
    pageNum: query.page,
    pageSize: query.pageSize,
    appCode: query.app_code,
    appName: query.app_name,
    apiName: query.api_name,
    path: query.api_path,
    version: query.version
  });
  return {
    ...response,
    data: {
      list: (response.data?.records || []).map(toApiItem),
      total: response.data?.total || 0,
      page: response.data?.pageNum || query.page,
      pageSize: response.data?.pageSize || query.pageSize
    }
  };
}

export async function fetchApiOptions() {
  const response = await post<any>('/api/app/options', {});
  return {
    ...response,
    data: {
      apps: (response.data?.apps || []).map((item: any) => ({
        id: item.id ?? item.ID ?? item.app_id,
        app_code: item.app_code ?? item.APP_CODE ?? item.appCode,
        app_name: item.app_name ?? item.APP_NAME ?? item.appName
      }))
    }
  };
}

export async function fetchApiDetail(id: number) {
  const response = await post<any>('/api/apis/detail', { apiId: id });
  return { ...response, data: toApiItem(response.data) };
}

export async function saveApi(payload?: any) {
  if (!payload) {
    return post<boolean>('/api/apis/add', {});
  }
  if (payload.id) {
    return post<any>('/api/apis/update', {
      id: payload.id,
      appId: payload.app_id,
      apiName: payload.api_name,
      path: payload.api_path,
      method: payload.api_method,
      description: payload.api_description
    });
  }
  const options = await fetchApiOptions();
  const app = options.data.apps.find((item: any) => item.app_code === payload.app_code);
  return post<any>('/api/apis/add', {
    appId: app?.id,
    apiName: payload.api_name,
    path: payload.api_path,
    method: payload.api_method,
    description: payload.api_description
  });
}

export async function deleteApi() {
  return post<boolean>('/api/apis/delete', {});
}
