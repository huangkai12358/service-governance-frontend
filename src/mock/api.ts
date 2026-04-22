import type { PageQuery } from '@/types/common';
import { apiGroups, apis, apps } from './base';
import { paginate, success, wait } from '@/utils/mock';

export interface ApiListQuery extends PageQuery {
  app_code?: string;
  app_name?: string;
  api_name?: string;
  api_path?: string;
  api_version_id?: string;
}

export async function fetchApiList(query: ApiListQuery) {
  const filtered = apis.filter((item) => item.is_deleted === 0).filter((item) => {
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name)) &&
      (!query.api_name || item.api_name.includes(query.api_name)) &&
      (!query.api_path || item.api_path.includes(query.api_path)) &&
      (!query.api_version_id || item.api_version_id.includes(query.api_version_id));
  });
  return wait(success(paginate(filtered, query)));
}

export async function fetchApiOptions() {
  return wait(success({
    apps: apps.filter((item) => item.is_deleted === 0),
    apiGroups: apiGroups.filter((item) => item.is_deleted === 0)
  }));
}

export async function fetchApiDetail(id: string) {
  const detail = apis.find((item) => item.id === id);
  return wait(success(detail || null));
}

export async function saveApi() {
  return wait(success(true, '保存成功'));
}

export async function deleteApi() {
  return wait(success(true, '删除成功'));
}
