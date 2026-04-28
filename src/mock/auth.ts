import { apiGroups, apis, apps, singleAppAuthorizations } from './base';
import { success, wait } from '@/utils/mock';
import { getLatestImportedAdditions } from './smartdoc';
import type {
  AuthorizationDelta,
  AuthorizationEditorData,
  ReverseAuthorizedTargetDetail,
  ReverseAuthEditorData,
  ReverseAuthListItem
} from '@/types/business';

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

function buildCallerApiPathMap() {
  const record = new Map<string, Set<string>>();
  singleAppAuthorizations.forEach((item) => {
    if (!record.has(item.caller_app_code)) {
      record.set(item.caller_app_code, new Set());
    }
    item.api_paths.forEach((path) => record.get(item.caller_app_code)?.add(path));
  });
  return record;
}

export async function fetchReverseAuthApiList(query: { app_code?: string; app_name?: string; api_name?: string; api_path?: string }) {
  const callerApiPathMap = buildCallerApiPathMap();
  const list: ReverseAuthListItem[] = apis
    .filter((item) => item.is_deleted === 0)
    .filter((item) => {
      return (!query.app_code || item.app_code.includes(query.app_code)) &&
        (!query.app_name || item.app_name.includes(query.app_name)) &&
        (!query.api_name || item.api_name.includes(query.api_name)) &&
        (!query.api_path || item.api_path.includes(query.api_path));
    })
    .map((api) => ({
      api_id: api.id,
      app_code: api.app_code,
      app_name: api.app_name,
      api_name: api.api_name,
      api_path: api.api_path,
      api_method: api.api_method,
      authorized_app_count: Array.from(callerApiPathMap.values()).filter((paths) => paths.has(api.api_path)).length
    }));
  return wait(success(list));
}

export async function fetchReverseAuthEditor(apiIds: number[]) {
  const selectedApis = apis.filter((item) => apiIds.includes(item.id) && item.is_deleted === 0);
  const importedAdditions = getLatestImportedAdditions();
  const importedApis = importedAdditions
    .filter((item) => apiIds.includes(item.id) && !selectedApis.some((api) => api.id === item.id))
    .map((item) => ({
      id: item.id,
      api_name: item.api_name,
      api_path: item.api_path,
      api_method: item.api_method,
      app_code: item.app_code,
      app_name: item.app_name
    }));
  const mergedSelectedApis = [
    ...selectedApis.map((item) => ({
      id: item.id,
      api_name: item.api_name,
      api_path: item.api_path,
      api_method: item.api_method,
      app_code: item.app_code,
      app_name: item.app_name
    })),
    ...importedApis
  ];
  const selectedPaths = mergedSelectedApis.map((item) => item.api_path);
  const callerApiPathMap = buildCallerApiPathMap();
  const checkedAppCodes = Array.from(callerApiPathMap.entries())
    .filter(([, paths]) => selectedPaths.every((path) => paths.has(path)))
    .map(([appCode]) => appCode);

  const data: ReverseAuthEditorData = {
    selected_apis: mergedSelectedApis,
    apps: apps
      .filter((item) => item.is_deleted === 0)
      .map((item) => ({ app_code: item.app_code, app_name: item.app_name })),
    checked_app_codes: checkedAppCodes
  };

  return wait(success(data));
}

export async function fetchReverseAuthorizedTargetDetail(apiId: number) {
  const api = apis.find((item) => item.id === apiId && item.is_deleted === 0);
  const authApps = !api ? [] : Array.from(
    new Map(
      singleAppAuthorizations
        .filter((item) => item.api_paths.includes(api.api_path))
        .map((item) => [item.caller_app_code, { app_code: item.caller_app_code, app_name: item.caller_app_name }] as const)
    ).values()
  );

  const data: ReverseAuthorizedTargetDetail | null = !api ? null : {
    api: {
      id: api.id,
      app_code: api.app_code,
      app_name: api.app_name,
      api_name: api.api_name,
      api_path: api.api_path,
      api_method: api.api_method
    },
    apps: authApps
  };

  return wait(success(data));
}

export async function saveReverseAuthorization() {
  return wait(success(true, '反向授权保存成功'));
}
