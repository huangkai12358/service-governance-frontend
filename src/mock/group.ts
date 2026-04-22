import { apiGroups, appGroups, appList } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchAppGroups() {
  return wait(success({ groups: appGroups, apps: appList }));
}

export async function saveAppGroup() {
  return wait(success(true, '应用分组保存成功'));
}

export async function deleteAppGroup(id: string) {
  return wait(success(id, '应用分组删除成功'));
}

export async function fetchApiGroups() {
  return wait(success({ groups: apiGroups, apps: appList }));
}

export async function saveApiGroup() {
  return wait(success(true, 'API分组保存成功'));
}

export async function deleteApiGroup(id: string) {
  return wait(success(id, 'API分组删除成功'));
}
