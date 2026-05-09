import { request } from '@/utils/request';
import type {
  HttpMethod,
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

interface AppOptionBackendItem {
  appId?: number;
  id?: number;
  appCode?: string;
  app_code?: string;
  appName?: string;
  app_name?: string;
}

interface ReverseAuthListBackendItem {
  apiId?: number;
  apiName?: string;
  apiPath?: string;
  path?: string;
  apiMethod?: HttpMethod;
  appCode?: string;
  appName?: string;
  authorizedAppCount?: number;
}

interface ReverseAuthListBackendResponse {
  records?: ReverseAuthListBackendItem[];
  total?: number;
  current?: number;
  size?: number;
}

interface ReverseAuthDetailBackendResponse {
  api?: {
    apiId?: number;
    id?: number;
    apiName?: string;
    apiPath?: string;
    apiMethod?: HttpMethod;
    appCode?: string;
    appName?: string;
  } | null;
  apps?: Array<{
    appCode?: string;
    appName?: string;
    app_code?: string;
    app_name?: string;
  }>;
}

export async function fetchReverseAuthApiList(query: {
  app_code?: string;
  app_name?: string;
  api_name?: string;
  api_path?: string;
  page?: number;
  pageSize?: number;
}) {
  const data = await request<ReverseAuthListBackendResponse>('/api/authorization/reverse/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page || 1,
      pageSize: query.pageSize || 10,
      appCode: query.app_code,
      appName: query.app_name,
      apiName: query.api_name,
      path: query.api_path
    })
  });

  return {
    data: {
      list: (data.records || []).map(toReverseAuthListItem),
      total: data.total || 0,
      page: data.current || query.page || 1,
      pageSize: data.size || query.pageSize || 10
    }
  };
}

export async function fetchReverseAuthEditor(apiIds: number[]) {
  const [apps, ...details] = await Promise.all([
    request<AppOptionBackendItem[] | { apps: AppOptionBackendItem[] }>('/api/app/options', {
      method: 'POST',
      body: JSON.stringify({})
    }),
    ...apiIds.map((apiId) =>
      request<ReverseAuthDetailBackendResponse>('/api/authorization/reverse/detail', {
        method: 'POST',
        body: JSON.stringify({ apiId })
      })
    )
  ]);

  const appItems = Array.isArray(apps) ? apps : apps.apps || [];
  const checkedAppCodes = details.length
    ? (details[0].apps || []).map((item) => item.appCode || item.app_code || '').filter(Boolean)
    : [];

  return {
    data: {
      selected_apis: details.map((detail) => toReverseApi(detail.api)).filter(isReverseApi),
      apps: appItems.map(toAppOption),
      checked_app_codes: checkedAppCodes
    } satisfies ReverseAuthEditorData
  };
}

export async function fetchReverseAuthorizedTargetDetail(apiId: number) {
  const data = await request<ReverseAuthDetailBackendResponse>('/api/authorization/reverse/detail', {
    method: 'POST',
    body: JSON.stringify({ apiId })
  });

  const api = toReverseApi(data.api);
  return {
    data: {
      api: api || {
        id: apiId,
        app_code: '',
        app_name: '',
        api_name: '',
        api_path: '',
        api_method: 'GET' as HttpMethod
      },
      apps: (data.apps || []).map((item) => ({
        app_code: item.appCode || item.app_code || '',
        app_name: item.appName || item.app_name || ''
      }))
    } satisfies ReverseAuthorizedTargetDetail
  };
}

export async function saveReverseAuthorization(payload: ReverseAuthorizationSavePayload) {
  await request<boolean>('/api/authorization/reverse/save', {
    method: 'POST',
    body: JSON.stringify({
      selectedApis: payload.selected_apis.map((item) => ({
        apiId: item.id,
        apiPath: item.api_path,
        appCode: item.app_code
      })),
      checkedAppCodes: payload.checked_app_codes,
      originalAppCodes: payload.original_app_codes
    })
  });

  return {
    code: 0,
    message: '保存成功'
  };
}

function toAppOption(item: AppOptionBackendItem) {
  return {
    app_code: item.appCode || item.app_code || '',
    app_name: item.appName || item.app_name || ''
  };
}

function toReverseAuthListItem(item: ReverseAuthListBackendItem): ReverseAuthListItem {
  return {
    api_id: item.apiId || 0,
    app_code: item.appCode || '',
    app_name: item.appName || '',
    api_name: item.apiName || '',
    api_path: item.apiPath || item.path || '',
    api_method: item.apiMethod || 'GET',
    authorized_app_count: item.authorizedAppCount || 0
  };
}

function toReverseApi(item: ReverseAuthDetailBackendResponse['api']) {
  if (!item) return null;
  return {
    id: item.apiId || item.id || 0,
    api_name: item.apiName || '',
    api_path: item.apiPath || '',
    api_method: item.apiMethod || 'GET',
    app_code: item.appCode || '',
    app_name: item.appName || ''
  };
}

function isReverseApi(
  item: ReturnType<typeof toReverseApi>
): item is ReverseAuthEditorData['selected_apis'][number] {
  return Boolean(item);
}
