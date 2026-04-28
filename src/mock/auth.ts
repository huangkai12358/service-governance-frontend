import { apiGroups, apis, apps, singleAppAuthorizations } from './base';
import { success, wait } from '@/utils/mock';
import { getLatestImportedAdditions } from './smartdoc';
import type {
  AuthorizationDelta,
  AuthorizationEditorData,
  SingleAppAuthorization,
  SingleAppAuthorizationDialogData,
  SingleAppAuthorizationEditorPayload,
  ReverseAuthorizedTargetDetail,
  ReverseAuthEditorData,
  ReverseAuthListItem
} from '@/types/business';

function buildAuthorizationEditorData(calleeAppCode: string, checkedApiPaths: string[] = []): AuthorizationEditorData {
  const calleeApis = apis.filter((item) => item.app_code === calleeAppCode && item.is_deleted === 0);
  const calleeGroups = apiGroups.filter((item) => item.app_code === calleeAppCode && item.is_deleted === 0);

  return {
    apis: calleeApis.map((item) => ({ id: item.id, api_name: item.api_name, api_path: item.api_path, app_code: item.app_code })),
    api_groups: calleeGroups.map((item) => ({ id: item.id, api_group_name: item.api_group_name, app_code: item.app_code, api_ids: item.api_ids })),
    checked_api_ids: calleeApis.filter((item) => checkedApiPaths.includes(item.api_path)).map((item) => item.id),
    checked_group_ids: calleeGroups
      .filter((group) => group.api_ids.length > 0 && group.api_ids.every((id) => calleeApis.filter((item) => checkedApiPaths.includes(item.api_path)).map((item) => item.id).includes(id)))
      .map((group) => group.id)
  };
}

function buildAppOptions() {
  return apps
    .filter((item) => item.is_deleted === 0)
    .map((item) => ({ app_code: item.app_code, app_name: item.app_name }));
}

function getApiPathsByIds(apiIds: number[]) {
  return apis.filter((item) => apiIds.includes(item.id)).map((item) => item.api_path);
}

function getApiGroupIdsByIds(apiIds: number[]) {
  return [...new Set(apis.filter((item) => apiIds.includes(item.id)).flatMap((item) => item.api_group_ids))];
}

export async function fetchSingleAppAuthList(query: { caller_app_code?: string; callee_app_code?: string }) {
  const list = singleAppAuthorizations.filter((item) => {
    return item.api_paths.length > 0 &&
      (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code));
  });
  return wait(success(list));
}

export async function fetchSingleAppAuthEditor(id: number) {
  const current = singleAppAuthorizations.find((item) => item.id === id);
  const data = buildAuthorizationEditorData(current?.callee_app_code || '', current?.api_paths || []);
  const dialogData: SingleAppAuthorizationDialogData = {
    current,
    app_options: buildAppOptions(),
    data
  };
  return wait(success(dialogData));
}

export async function fetchSingleAppAuthorizationCreator() {
  const appOptions = buildAppOptions();
  const dialogData: SingleAppAuthorizationDialogData = {
    app_options: appOptions,
    data: buildAuthorizationEditorData(appOptions[0]?.app_code || '')
  };
  return wait(success(dialogData));
}

export async function fetchSingleAppAuthorizationOptions(calleeAppCode: string) {
  const data = buildAuthorizationEditorData(calleeAppCode);
  return wait(success(data));
}

export function calcAuthorizationDelta(originalApiIds: number[], nextApiIds: number[]): AuthorizationDelta {
  const originalPaths = apis.filter((item) => originalApiIds.includes(item.id)).map((item) => item.api_path);
  const nextPaths = apis.filter((item) => nextApiIds.includes(item.id)).map((item) => item.api_path);
  return {
    added_api_paths: nextPaths.filter((item) => !originalPaths.includes(item)),
    revoked_api_paths: originalPaths.filter((item) => !nextPaths.includes(item))
  };
}

export async function saveSingleAppAuthorization(payload: SingleAppAuthorizationEditorPayload & { id?: number }) {
  const selectedApiPaths = getApiPathsByIds(payload.checked_api_ids);
  const selectedApiGroupIds = getApiGroupIdsByIds(payload.checked_api_ids);

  // 编辑场景下允许撤销到空，按约定直接删除整条授权关系。
  if (payload.id) {
    const currentIndex = singleAppAuthorizations.findIndex((item) => item.id === payload.id);
    if (currentIndex === -1) {
      return wait(success(false, '授权关系不存在'));
    }

    if (selectedApiPaths.length === 0) {
      singleAppAuthorizations.splice(currentIndex, 1);
      return wait(success(true, '授权关系已删除'));
    }

    const current = singleAppAuthorizations[currentIndex];
    singleAppAuthorizations[currentIndex] = {
      ...current,
      caller_app_code: payload.caller_app_code,
      caller_app_name: apps.find((item) => item.app_code === payload.caller_app_code)?.app_name || current.caller_app_name,
      callee_app_code: payload.callee_app_code,
      callee_app_name: apps.find((item) => item.app_code === payload.callee_app_code)?.app_name || current.callee_app_name,
      api_paths: selectedApiPaths,
      api_group_ids: selectedApiGroupIds
    };
    return wait(success(true, '权限更新成功'));
  }

  if (selectedApiPaths.length === 0) {
    return wait(success(false, '请至少选择一个 API'));
  }

  const existed = singleAppAuthorizations.find((item) =>
    item.caller_app_code === payload.caller_app_code && item.callee_app_code === payload.callee_app_code
  );

  if (existed) {
    existed.api_paths = selectedApiPaths;
    existed.api_group_ids = selectedApiGroupIds;
    return wait(success(true, '授权关系已更新'));
  }

  const nextRecord: SingleAppAuthorization = {
    id: Math.max(0, ...singleAppAuthorizations.map((item) => item.id)) + 1,
    caller_app_code: payload.caller_app_code,
    caller_app_name: apps.find((item) => item.app_code === payload.caller_app_code)?.app_name || payload.caller_app_code,
    callee_app_code: payload.callee_app_code,
    callee_app_name: apps.find((item) => item.app_code === payload.callee_app_code)?.app_name || payload.callee_app_code,
    api_paths: selectedApiPaths,
    api_group_ids: selectedApiGroupIds
  };
  singleAppAuthorizations.unshift(nextRecord);

  return wait(success(true, '授权关系创建成功'));
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
