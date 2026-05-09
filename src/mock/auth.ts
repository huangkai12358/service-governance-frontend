import { post } from '@/api/client';
import type {
  AuthorizationDelta,
  AuthorizationEditorData,
  HttpMethod,
  ReverseAuthListItem,
  SingleAppAuthorizationEditorPayload
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

export async function fetchSingleAppAuthList(query: {
  caller_app_code?: string;
  caller_app_name?: string;
  callee_app_code?: string;
  callee_app_name?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await post<any>('/api/authorization/single-app/list', toCamelQuery(query));
  return {
    ...response,
    data: {
      list: (response.data?.records || []).map(toSingleAppSnake),
      total: response.data?.total || 0,
      page: response.data?.current || query.page || 1,
      pageSize: response.data?.size || query.pageSize || 10
    }
  };
}

export async function fetchSingleAppAuthEditor(id: number) {
  const callerAppId = Math.floor(id / 1000000);
  const calleeAppId = id % 1000000;
  const [detail, apps] = await Promise.all([
    post<any>('/api/authorization/single-app/detail', { callerAppId, calleeAppId }),
    post<any>('/api/app/options', {})
  ]);
  return {
    ...detail,
    data: {
      current: toSingleAppSnake(detail.data),
      app_options: toAppOptions(readAppOptionItems(apps.data)),
      data: toEditorData(detail.data)
    }
  };
}

export async function fetchSingleAppAuthorizationCreator() {
  const apps = await post<any>('/api/app/options', {});
  return {
    ...apps,
    data: {
      app_options: toAppOptions(readAppOptionItems(apps.data)),
      data: { current_apis: [], legacy_apis: [], checked_api_ids: [] }
    }
  };
}

export async function fetchSingleAppAuthorizationOptions(calleeAppCode: string, callerAppCode?: string) {
  const apps = await post<any>('/api/app/options', {});
  const appOptions = toAppOptions(readAppOptionItems(apps.data));
  const callee = appOptions.find((item) => item.app_code === calleeAppCode);
  const caller = appOptions.find((item) => item.app_code === callerAppCode);
  const apiList = await post<any>('/api/apis/list', {
    pageNum: 1,
    pageSize: 100,
    appCode: calleeAppCode
  });
  let checkedIds: number[] = [];
  if (caller?.id && callee?.id) {
    const detail = await post<any>('/api/authorization/single-app/detail', {
      callerAppId: caller.id,
      calleeAppId: callee.id
    });
    checkedIds = detail.data?.checkedApiIds || [];
  }
  return {
    code: 0,
    message: 'success',
    data: {
      current_apis: (apiList.data?.records || []).map(toEditorApi),
      legacy_apis: [],
      checked_api_ids: checkedIds
    }
  };
}

export async function fetchExistingSingleAppAuthorization(callerAppCode: string, calleeAppCode: string) {
  const apps = await post<any>('/api/app/options', {});
  const appOptions = toAppOptions(readAppOptionItems(apps.data));
  const caller = appOptions.find((item) => item.app_code === callerAppCode);
  const callee = appOptions.find((item) => item.app_code === calleeAppCode);
  if (!caller?.id || !callee?.id) {
    return { code: 0, message: 'success', data: null };
  }
  const detail = await post<any>('/api/authorization/single-app/detail', {
    callerAppId: caller.id,
    calleeAppId: callee.id
  });
  return {
    ...detail,
    data: (detail.data?.checkedApiIds || []).length ? { ...toSingleAppSnake(detail.data), id: caller.id * 1000000 + callee.id } : null
  };
}

export function calcAuthorizationDelta(
  originalApiIds: number[],
  nextApiIds: number[],
  sourceApis: Array<{ id: number; api_path: string }>
): AuthorizationDelta {
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
  let callerAppId = (payload as any).callerAppId;
  let calleeAppId = (payload as any).calleeAppId;
  if (!callerAppId || !calleeAppId) {
    const apps = await post<any>('/api/app/options', {});
    const appOptions = toAppOptions(readAppOptionItems(apps.data));
    callerAppId = appOptions.find((item) => item.app_code === (payload as any).caller_app_code)?.id;
    calleeAppId = appOptions.find((item) => item.app_code === (payload as any).callee_app_code)?.id;
  }
  return post<boolean>('/api/authorization/single-app/save', {
    callerAppId,
    calleeAppId,
    apiIds: (payload as any).checked_api_ids || (payload as any).apiIds || []
  });
}

export async function fetchReverseAuthApiList(query: {
  app_code?: string;
  app_name?: string;
  api_name?: string;
  api_path?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await post<any>('/api/authorization/reverse/list', toCamelQuery(query));
  return {
    ...response,
    data: {
      list: (response.data?.records || []).map(toReverseSnake),
      total: response.data?.total || 0,
      page: response.data?.current || query.page || 1,
      pageSize: response.data?.size || query.pageSize || 10
    }
  };
}

export async function fetchReverseAuthEditor(apiIds: number[]) {
  const detailPayload = apiIds.length === 1 ? { apiId: apiIds[0] } : { apiIds };
  const [apps, detail] = await Promise.all([
    post<any>('/api/app/options', {}),
    post<any>('/api/authorization/reverse/detail', detailPayload)
  ]);
  const selected = (detail.data?.selectedApis || detail.data?.selected_apis || [detail.data?.api])
    .map(toReverseApiSnake)
    .filter(isReverseApi);
  const checked = detail.data?.apps?.map((item: any) => item.appCode || item.app_code) || [];
  return {
    code: 0,
    message: 'success',
    data: {
      selected_apis: selected,
      apps: toAppOptions(readAppOptionItems(apps.data)),
      checked_app_codes: checked
    }
  };
}

export async function fetchReverseAuthBatchEditor(rows: ReverseAuthListItem[]) {
  const apps = await post<any>('/api/app/options', {});
  return {
    code: 0,
    message: 'success',
    data: {
      selected_apis: rows.map((item) => ({
        id: item.api_id,
        api_name: item.api_name,
        api_path: item.api_path,
        api_method: item.api_method,
        app_code: item.app_code,
        app_name: item.app_name
      })),
      apps: toAppOptions(readAppOptionItems(apps.data)),
      checked_app_codes: []
    }
  };
}

export async function fetchReverseAuthorizedTargetDetail(apiId: number) {
  const response = await post<any>('/api/authorization/reverse/detail', { apiId });
  const api = toReverseApiSnake(response.data?.api);
  return {
    ...response,
    data: {
      api: api || {
        id: apiId,
        api_name: '',
        api_path: '',
        api_method: 'GET' as HttpMethod,
        app_code: '',
        app_name: ''
      },
      apps: (response.data?.apps || []).map((item: any) => ({
        app_code: item.appCode || item.app_code,
        app_name: item.appName || item.app_name
      }))
    }
  };
}

export async function saveReverseAuthorization(payload: ReverseAuthorizationSavePayload) {
  return post<boolean>('/api/authorization/reverse/save', {
    selected_apis: payload.selected_apis.map((item) => ({
      apiId: item.id,
      apiPath: item.api_path,
      appCode: item.app_code
    })),
    checkedAppCodes: payload.checked_app_codes,
    originalAppCodes: payload.original_app_codes
  });
}

function toCamelQuery(query: Record<string, any>) {
  return {
    pageNum: query.pageNum || query.page || 1,
    pageSize: query.pageSize || 1000,
    callerAppCode: query.caller_app_code,
    callerAppName: query.caller_app_name,
    calleeAppCode: query.callee_app_code,
    calleeAppName: query.callee_app_name,
    appCode: query.app_code,
    appName: query.app_name,
    apiName: query.api_name,
    path: query.api_path
  };
}

function toAppOptions(items: any[]) {
  return items.map((item) => ({
    id: item.appId || item.id,
    app_code: item.appCode || item.app_code,
    app_name: item.appName || item.app_name
  }));
}

function readAppOptionItems(data: any) {
  // 兼容当前后端直接返回数组，以及旧 mock 结构 { apps: [] }。
  if (Array.isArray(data)) {
    return data;
  }
  return data?.apps || [];
}

function toEditorApi(item: any) {
  return {
    id: item.apiId || item.id,
    api_name: item.apiName || item.api_name,
    api_path: item.path || item.apiPath || item.api_path,
    app_code: item.appCode || item.app_code,
    version: item.version || '-'
  };
}

function toEditorData(item: any): AuthorizationEditorData {
  return {
    current_apis: (item?.currentApis || []).map(toEditorApi),
    legacy_apis: (item?.legacyApis || []).map(toEditorApi),
    checked_api_ids: item?.checkedApiIds || []
  };
}

function toSingleAppSnake(item: any) {
  return {
    id: item.id || (item.callerAppId && item.calleeAppId ? item.callerAppId * 1000000 + item.calleeAppId : undefined),
    caller_app_id: item.callerAppId,
    callee_app_id: item.calleeAppId,
    caller_app_code: item.callerAppCode,
    caller_app_name: item.callerAppName,
    callee_app_code: item.calleeAppCode,
    callee_app_name: item.calleeAppName,
    current_version: item.calleeCurrentVersion,
    api_paths: item.apiPaths || [],
    api_rows: (item.apiRows || []).map(toAuthorizedApiRow),
    current_api_count: item.currentApiCount || 0,
    legacy_api_count: item.legacyApiCount || 0
  };
}

function toAuthorizedApiRow(item: any) {
  return {
    api_name: item.apiName || item.api_name,
    api_path: item.apiPath || item.api_path,
    version: item.version || '-'
  };
}

function toReverseSnake(item: any) {
  return {
    api_id: item.apiId,
    api_name: item.apiName,
    path: item.apiPath || item.path,
    api_path: item.apiPath || item.path,
    api_method: item.apiMethod || item.api_method || item.method,
    app_code: item.appCode,
    app_name: item.appName,
    authorized_app_count: item.authorizedAppCount || 0
  };
}

function toReverseApiSnake(item: any) {
  if (!item) return null;
  return {
    id: item.apiId || item.id,
    api_name: item.apiName || item.api_name,
    api_path: item.apiPath || item.api_path,
    api_method: item.apiMethod || item.api_method,
    app_code: item.appCode || item.app_code,
    app_name: item.appName || item.app_name
  };
}

function isReverseApi(item: ReturnType<typeof toReverseApiSnake>): item is {
  id: number;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  app_code: string;
  app_name: string;
} {
  return Boolean(item);
}
