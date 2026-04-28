import { apiGroups, apis, appGroupAuthorizations, appGroups, apps, singleAppAuthorizations } from './base';
import { success, wait } from '@/utils/mock';
import type {
  AuthorizationDelta,
  AuthorizationEditorData,
  SingleAppAuthorization,
  SingleAppAuthorizationDialogData,
  SingleAppAuthorizationEditorPayload
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

export async function fetchAppGroupAuthList(query: { app_group_name?: string }) {
  const list = appGroupAuthorizations.filter((item) => !query.app_group_name || item.app_group_name.includes(query.app_group_name));
  return wait(success({ list, apiGroups, apis, appGroups }));
}

export async function saveAppGroupAuthorization() {
  return wait(success(true, '操作成功'));
}
