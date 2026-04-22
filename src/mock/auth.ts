import type { AuthorizationPanelData } from '@/types/business';
import { apiGroups, apiList, appGroups, appList, authorizationRecords } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchAuthorizationPanel() {
  const data: AuthorizationPanelData = {
    callers: [
      ...appList.map((item) => ({ id: item.id, name: item.name, type: 'APP' as const })),
      ...appGroups.map((item) => ({ id: item.id, name: item.name, type: 'APP_GROUP' as const }))
    ],
    callees: appList,
    apiTree: appList.map((app) => ({
      id: app.id,
      label: app.name,
      children: apiList.filter((item) => item.appId === app.id).map((item) => ({ id: item.id, label: `${item.name} ${item.path}` }))
    })),
    groupTree: appList.map((app) => ({
      id: app.id,
      label: app.name,
      children: apiGroups.filter((item) => item.appId === app.id).map((item) => ({ id: item.id, label: item.name }))
    })),
    selectedGrants: authorizationRecords
  };
  return wait(success(data));
}

export async function saveAuthorization() {
  return wait(success(true, '授权关系保存成功'));
}

export async function revokeAuthorization() {
  return wait(success(true, '授权关系撤销成功'));
}
