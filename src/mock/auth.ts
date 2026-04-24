import { apiGroups, apis, appGroupAuthorizations, appGroups, singleAppAuthorizations } from './base';
import { success, wait } from '@/utils/mock';
import type { AuthorizationDelta, AuthorizationEditorData } from '@/types/business';

export async function fetchSingleAppAuthList(query: { caller_app_code?: string; callee_app_code?: string }) {
  const list = singleAppAuthorizations.filter((item) => {
    return (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code));
  });
  return wait(success(list));
}

export async function fetchSingleAppAuthEditor(id: number) {
  const current = singleAppAuthorizations.find((item) => item.id === id);
  const calleeApis = apis.filter((item) => item.app_code === current?.callee_app_code && item.is_deleted === 0);
  const calleeGroups = apiGroups.filter((item) => item.app_code === current?.callee_app_code && item.is_deleted === 0);
  const data: AuthorizationEditorData = {
    apis: calleeApis.map((item) => ({ id: item.id, api_name: item.api_name, api_path: item.api_path, app_code: item.app_code })),
    api_groups: calleeGroups.map((item) => ({ id: item.id, api_group_name: item.api_group_name, app_code: item.app_code, api_ids: item.api_ids })),
    checked_api_ids: calleeApis.filter((item) => current?.api_paths.includes(item.api_path)).map((item) => item.id),
    checked_group_ids: current?.api_group_ids || []
  };
  return wait(success({ current, data }));
}

export function calcAuthorizationDelta(originalApiIds: number[], nextApiIds: number[]): AuthorizationDelta {
  const originalPaths = apis.filter((item) => originalApiIds.includes(item.id)).map((item) => item.api_path);
  const nextPaths = apis.filter((item) => nextApiIds.includes(item.id)).map((item) => item.api_path);
  return {
    added_api_paths: nextPaths.filter((item) => !originalPaths.includes(item)),
    revoked_api_paths: originalPaths.filter((item) => !nextPaths.includes(item))
  };
}

export async function saveSingleAppAuthorization() {
  return wait(success(true, '权限更新成功'));
}

export async function fetchAppGroupAuthList(query: { app_group_name?: string }) {
  const list = appGroupAuthorizations.filter((item) => !query.app_group_name || item.app_group_name.includes(query.app_group_name));
  return wait(success({ list, apiGroups, apis, appGroups }));
}

export async function saveAppGroupAuthorization() {
  return wait(success(true, '操作成功'));
}
