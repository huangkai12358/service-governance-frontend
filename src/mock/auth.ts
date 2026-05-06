import { apis, apps, singleAppAuthorizations } from './base';
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

interface ReverseAuthorizationSavePayload {
  selected_apis: Array<{
    id: number;
    api_path: string;
    app_code: string;
  }>;
  checked_app_codes: string[];
  original_app_codes: string[];
}

function buildApiOptionFromPath(apiPath: string, appCode: string, fallbackId: number) {
  const matched = apis.find((item) => item.app_code === appCode && item.api_path === apiPath)
    || apis.find((item) => item.api_path === apiPath);
  return {
    id: matched?.id ?? fallbackId,
    api_name: matched?.api_name ?? '兼容旧版本 API',
    api_path: apiPath,
    app_code: appCode,
    version: matched?.version ?? '-'
  };
}

function getCurrentVersionApis(calleeAppCode: string) {
  const app = apps.find((item) => item.app_code === calleeAppCode);
  return apis.filter((item) =>
    item.app_code === calleeAppCode &&
    item.is_deleted === 0 &&
    (!app?.current_version || item.version === app.current_version)
  );
}

function buildAuthorizationEditorData(calleeAppCode: string, checkedApiPaths: string[] = []): AuthorizationEditorData {
  const currentApis = getCurrentVersionApis(calleeAppCode);
  const currentPathSet = new Set(currentApis.map((item) => item.api_path));
  const legacyApis = checkedApiPaths
    .filter((path) => !currentPathSet.has(path))
    .map((path, index) => buildApiOptionFromPath(path, calleeAppCode, -(index + 1)));

  return {
    current_apis: currentApis.map((item) => ({ id: item.id, api_name: item.api_name, api_path: item.api_path, app_code: item.app_code, version: item.version })),
    legacy_apis: legacyApis,
    checked_api_ids: [
      ...currentApis.filter((item) => checkedApiPaths.includes(item.api_path)).map((item) => item.id),
      ...legacyApis.map((item) => item.id)
    ]
  };
}

function buildAppOptions() {
  return apps
    .filter((item) => item.is_deleted === 0)
    .map((item) => ({ app_code: item.app_code, app_name: item.app_name }));
}

export async function fetchSingleAppAuthList(query: { caller_app_code?: string; caller_app_name?: string; callee_app_code?: string; callee_app_name?: string }) {
  const list = singleAppAuthorizations.filter((item) => {
    return item.api_paths.length > 0 &&
      (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.caller_app_name || item.caller_app_name.includes(query.caller_app_name)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code)) &&
      (!query.callee_app_name || item.callee_app_name.includes(query.callee_app_name));
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
    data: buildAuthorizationEditorData('')
  };
  return wait(success(dialogData));
}

export async function fetchSingleAppAuthorizationOptions(calleeAppCode: string, callerAppCode?: string) {
  const checkedApiPaths = singleAppAuthorizations.find((item) =>
    item.caller_app_code === callerAppCode && item.callee_app_code === calleeAppCode
  )?.api_paths || [];
  const data = buildAuthorizationEditorData(calleeAppCode, checkedApiPaths);
  return wait(success(data));
}

export async function fetchExistingSingleAppAuthorization(callerAppCode: string, calleeAppCode: string) {
  const current = singleAppAuthorizations.find((item) =>
    item.caller_app_code === callerAppCode && item.callee_app_code === calleeAppCode
  ) || null;
  return wait(success(current));
}

export function calcAuthorizationDelta(originalApiIds: number[], nextApiIds: number[], sourceApis: Array<{ id: number; api_path: string }>): AuthorizationDelta {
  const originalApiPaths = originalApiIds
    .map((id) => sourceApis.find((item) => item.id === id)?.api_path)
    .filter((item): item is string => Boolean(item));
  const nextApiPaths = nextApiIds
    .map((id) => sourceApis.find((item) => item.id === id)?.api_path)
    .filter((item): item is string => Boolean(item));
  return {
    added_api_paths: nextApiPaths.filter((item) => !originalApiPaths.includes(item)),
    revoked_api_paths: originalApiPaths.filter((item) => !nextApiPaths.includes(item))
  };
}

export async function saveSingleAppAuthorization(payload: SingleAppAuthorizationEditorPayload & { id?: number }) {
  const current = payload.id ? singleAppAuthorizations.find((item) => item.id === payload.id) : undefined;
  const data = buildAuthorizationEditorData(payload.callee_app_code, current?.api_paths || []);
  const selectedApiPaths = getApiPathsFromEditorData(data, payload.checked_api_ids);

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
      api_paths: selectedApiPaths
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
    return wait(success(true, '授权关系已更新'));
  }

  const nextRecord: SingleAppAuthorization = {
    id: Math.max(0, ...singleAppAuthorizations.map((item) => item.id)) + 1,
    caller_app_code: payload.caller_app_code,
    caller_app_name: apps.find((item) => item.app_code === payload.caller_app_code)?.app_name || payload.caller_app_code,
    callee_app_code: payload.callee_app_code,
    callee_app_name: apps.find((item) => item.app_code === payload.callee_app_code)?.app_name || payload.callee_app_code,
    api_paths: selectedApiPaths
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
  const importedAdditions = getLatestImportedAdditions()
    .filter((item) => !apis.some((api) => api.id === item.id))
    .map((item) => ({
      id: item.id,
      app_code: item.app_code,
      app_name: item.app_name,
      api_name: item.api_name,
      api_path: item.api_path,
      api_method: item.api_method,
      is_deleted: 0 as const
    }));
  const sourceApis = [...importedAdditions, ...apis];

  const list: ReverseAuthListItem[] = sourceApis
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
  const importedAdditions = getLatestImportedAdditions()
    .filter((item) => item.id === apiId)
    .map((item) => ({
      id: item.id,
      app_code: item.app_code,
      app_name: item.app_name,
      api_name: item.api_name,
      api_path: item.api_path,
      api_method: item.api_method,
      is_deleted: 0 as const
    }));
  const sourceApis = [
    ...importedAdditions,
    ...apis
  ];
  const api = sourceApis.find((item) => item.id === apiId && item.is_deleted === 0);
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

export async function saveReverseAuthorization(payload: ReverseAuthorizationSavePayload) {
  if (!payload.selected_apis.length) {
    return wait(success(false, '请至少选择一个 API'));
  }

  if (!payload.checked_app_codes.length && !payload.original_app_codes.length) {
    return wait(success(false, '请至少选择一个应用'));
  }

  const calleeAppCode = payload.selected_apis[0].app_code;
  const calleeApp = apps.find((item) => item.app_code === calleeAppCode);
  const selectedPaths = payload.selected_apis.map((item) => item.api_path);
  const unionAppCodes = [...new Set([...payload.checked_app_codes, ...payload.original_app_codes])];

  unionAppCodes.forEach((callerAppCode) => {
    const existedIndex = singleAppAuthorizations.findIndex((item) =>
      item.caller_app_code === callerAppCode && item.callee_app_code === calleeAppCode
    );
    const shouldKeep = payload.checked_app_codes.includes(callerAppCode);

    if (shouldKeep) {
      if (existedIndex >= 0) {
        const record = singleAppAuthorizations[existedIndex];
        record.api_paths = [...new Set([...record.api_paths, ...selectedPaths])];
      } else {
        const callerApp = apps.find((item) => item.app_code === callerAppCode);
        singleAppAuthorizations.unshift({
          id: Math.max(0, ...singleAppAuthorizations.map((item) => item.id)) + 1,
          caller_app_code: callerAppCode,
          caller_app_name: callerApp?.app_name || callerAppCode,
          callee_app_code: calleeAppCode,
          callee_app_name: calleeApp?.app_name || calleeAppCode,
          api_paths: [...selectedPaths]
        });
      }
      return;
    }

    if (existedIndex >= 0) {
      const record = singleAppAuthorizations[existedIndex];
      record.api_paths = record.api_paths.filter((path) => !selectedPaths.includes(path));

      if (!record.api_paths.length) {
        singleAppAuthorizations.splice(existedIndex, 1);
      }
    }
  });

  return wait(success(true, '反向授权保存成功'));
}
function getApiPathsByIds(apiIds: number[], calleeAppCode?: string) {
  const currentPaths = apis.filter((item) => apiIds.includes(item.id)).map((item) => item.api_path);
  const legacyPaths = apiIds
    .filter((id) => id < 0)
    .map((id) => buildApiOptionFromPath('', calleeAppCode || '', id))
    .filter(() => false);
  return [...currentPaths, ...legacyPaths];
}

function getApiPathsFromEditorData(data: AuthorizationEditorData, apiIds: number[]) {
  const source = [...data.current_apis, ...data.legacy_apis];
  return apiIds
    .map((id) => source.find((item) => item.id === id)?.api_path)
    .filter((item): item is string => Boolean(item));
}
