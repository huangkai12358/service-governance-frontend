import type { ApiChangeRecord, ApiItem } from '@/types/business';
import { apiGroups, apiList, appList, authorizationRecords } from './base';
import { paginate, success, wait } from '@/utils/mock';
import type { PageQuery } from '@/types/common';

export interface ApiQuery extends PageQuery {
  name?: string;
  path?: string;
  appId?: string;
  version?: string;
  status?: string;
}

export async function fetchApiList(query: ApiQuery) {
  const filtered = apiList.filter((item) => {
    return (!query.name || item.name.includes(query.name)) &&
      (!query.path || item.path.includes(query.path)) &&
      (!query.appId || item.appId === query.appId) &&
      (!query.version || item.version.includes(query.version)) &&
      (!query.status || item.status === query.status);
  });
  return wait(success(paginate(filtered, query)));
}

export async function fetchApiOptions() {
  return wait(success({
    apps: appList.map((item) => ({ label: item.name, value: item.id })),
    apiGroups: apiGroups.map((item) => ({ label: `${item.appName} / ${item.name}`, value: item.id }))
  }));
}

export async function fetchApiDetail(id: string) {
  const target = apiList.find((item) => item.id === id) as ApiItem;
  const changes: ApiChangeRecord[] = [
    { id: 'c1', operator: '张磊', action: 'SmartDoc导入', content: '描述字段更新为“提交订单主流程接口”', time: '2026-04-20 10:32:00' },
    { id: 'c2', operator: '系统管理员', action: '授权同步', content: '新增 3 条授权关系关联此 API', time: '2026-04-19 11:00:00' }
  ];
  const grants = authorizationRecords.filter((item) => item.resourceId === id || item.path === target.path).slice(0, 6);
  return wait(success({ target, changes, grants }));
}

export async function saveApi(payload: Partial<ApiItem>) {
  return wait(success({ id: payload.id || `api-${Date.now()}` }, payload.id ? '更新成功' : '新增成功'));
}

export async function removeApi(id: string) {
  return wait(success(id, '删除成功'));
}
