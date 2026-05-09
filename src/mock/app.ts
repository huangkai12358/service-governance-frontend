import { post } from '@/api/client';
import type { PageQuery } from '@/types/common';
import type { AppEditorPayload, AppPasswordPayload } from '@/types/business';

export interface AppListQuery extends PageQuery {
  app_code?: string;
  app_name?: string;
}

export async function fetchAppList(query: AppListQuery) {
  const response = await post<any>('/api/app/list', {
    pageNum: query.page,
    pageSize: query.pageSize,
    appCode: query.app_code,
    appName: query.app_name
  });
  return {
    ...response,
    data: {
      list: (response.data?.records || []).map(toAppSnake),
      total: response.data?.total || 0
    }
  };
}

export async function fetchAppDetail(id: number) {
  const response = await post<any>('/api/app/detail', { appId: id });
  return {
    ...response,
    data: {
      ...toAppSnake(response.data || {}),
      apis: (response.data?.apis || []).map((item: any) => ({
        id: item.apiId || item.id,
        api_name: item.apiName || item.api_name,
        api_path: item.apiPath || item.api_path,
        api_method: item.apiMethod || item.api_method
      }))
    }
  };
}

export async function saveApp(payload: AppEditorPayload) {
  if (payload.id) {
    return post<boolean>('/api/app/update', payload);
  }
  return post<boolean>('/api/app/add', payload);
}

export async function addAppPassword(payload: AppPasswordPayload) {
  const detail = await fetchAppDetail(payload.id!);
  const app = detail.data || {};
  const nextPrimary = app.primary_password || payload.password;
  const nextSecondary = app.primary_password ? payload.password : (app.secondary_password || '');
  return post<boolean>('/api/app/update', {
    appId: payload.id,
    appName: app.app_name,
    appPwd: nextPrimary,
    secondary_password: nextSecondary,
    description: app.app_description || ''
  });
}

export async function removeAppPassword(payload: AppPasswordPayload) {
  const detail = await fetchAppDetail(payload.id!);
  const app = detail.data || {};
  const primary = app.primary_password || '';
  const secondary = app.secondary_password || '';
  const nextPrimary = payload.target === 'primary' ? secondary : primary;
  return post<boolean>('/api/app/update', {
    appId: payload.id,
    appName: app.app_name,
    appPwd: nextPrimary,
    secondary_password: '',
    description: app.app_description || ''
  });
}

export async function deleteApp(id?: number) {
  return post<boolean>('/api/app/delete', { appId: id });
}

function toAppSnake(item: any) {
  return {
    id: item.appId || item.id,
    app_code: item.appCode || item.app_code,
    app_name: item.appName || item.app_name,
    app_description: item.appDescription || item.app_description,
    current_version: item.currentVersion || item.current_version,
    primary_password: item.primaryPassword || item.primary_password,
    secondary_password: item.secondaryPassword || item.secondary_password,
    create_time: item.createTime || item.create_time,
    update_time: item.updateTime || item.update_time,
    is_deleted: item.isDeleted || item.is_deleted
  };
}
