import type { PageQuery } from '@/types/common';
import { apps } from './base';
import { paginate, success, wait } from '@/utils/mock';

export interface AppListQuery extends PageQuery {
  app_code?: string;
  app_name?: string;
}

export async function fetchAppList(query: AppListQuery) {
  const list = apps.filter((item) => item.is_deleted === 0).filter((item) => {
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name));
  });
  return wait(success(paginate(list, query)));
}

export async function fetchAppDetail(id: string) {
  return wait(success(apps.find((item) => item.id === id) || null));
}

export async function saveApp() {
  return wait(success(true, '保存成功'));
}

export async function deleteApp() {
  return wait(success(true, '删除成功'));
}
