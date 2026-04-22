import { apiGroups, apis, appGroups, apps } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchApiGroupList(query: { api_group_name?: string; app_code?: string }) {
  const list = apiGroups.filter((item) => item.is_deleted === 0).filter((item) => {
    return (!query.api_group_name || item.api_group_name.includes(query.api_group_name)) &&
      (!query.app_code || item.app_code.includes(query.app_code));
  });
  return wait(success({ list, apps, apis }));
}

export async function fetchAppGroupList(query: { app_group_name?: string }) {
  const list = appGroups.filter((item) => item.is_deleted === 0).filter((item) => {
    return !query.app_group_name || item.app_group_name.includes(query.app_group_name);
  });
  return wait(success({ list, apps }));
}

export async function saveApiGroup() {
  return wait(success(true, '保存成功'));
}

export async function saveAppGroup() {
  return wait(success(true, '保存成功'));
}

export async function deleteApiGroup() {
  return wait(success(true, '删除成功'));
}

export async function deleteAppGroup() {
  return wait(success(true, '删除成功'));
}
