import { request } from '@/utils/request';
import type { PageResult } from '@/types/common';

export interface AuthConfigLogQuery {
  page: number;
  pageSize: number;
  auth_log_id?: string;
  caller_app_code?: string;
  caller_app_name?: string;
  callee_app_code?: string;
  callee_app_name?: string;
  api_name?: string;
  api_path?: string;
  operation_type?: '新增' | '撤销' | '修改' | '';
  start_time?: string;
  end_time?: string;
}

export interface AuthConfigLogItem {
  auth_log_id: number;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  api_name: string;
  api_path: string;
  operation_type: '新增' | '撤销' | '修改';
  log_time: string;
}

export interface SmartDocImportLogQuery {
  page: number;
  pageSize: number;
  app_code?: string;
  app_name?: string;
  version?: string;
}

export interface SmartDocImportLogItem {
  api_version_id: number;
  app_code: string;
  app_name: string;
  version: string;
  file_name: string;
  file_path: string;
  remark: string;
  importer_name: string;
  create_time: string;
}

interface SmartDocImportLogBackendItem {
  apiVersionId: number;
  appCode: string | null;
  appName: string | null;
  version: string | null;
  fileName: string | null;
  filePath: string | null;
  remark: string | null;
  importerName: string | null;
  createTime: string | null;
}

interface SmartDocImportLogBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: SmartDocImportLogBackendItem[];
}

interface AuthConfigLogBackendItem {
  authLogId: number;
  callerAppCode: string | null;
  callerAppName: string | null;
  calleeAppCode: string | null;
  calleeAppName: string | null;
  apiName: string | null;
  apiPath: string | null;
  operationType: '新增' | '撤销' | '修改' | null;
  logTime: string | null;
}

interface AuthConfigLogBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: AuthConfigLogBackendItem[];
}

function formatDateTime(value: string | null | undefined) {
  return value ? value.replace('T', ' ') : '-';
}

function mapSmartDocImportLogItem(item: SmartDocImportLogBackendItem): SmartDocImportLogItem {
  return {
    api_version_id: item.apiVersionId,
    app_code: item.appCode || '',
    app_name: item.appName || '',
    version: item.version || '',
    file_name: item.fileName || '',
    file_path: item.filePath || '',
    remark: item.remark || '',
    importer_name: item.importerName || '',
    create_time: formatDateTime(item.createTime)
  };
}

/**
 * 将后端返回的权限配置历史记录转换为前端稳定使用的结构。
 */
function mapAuthConfigLogItem(item: AuthConfigLogBackendItem): AuthConfigLogItem {
  return {
    auth_log_id: item.authLogId,
    caller_app_code: item.callerAppCode || '',
    caller_app_name: item.callerAppName || '',
    callee_app_code: item.calleeAppCode || '',
    callee_app_name: item.calleeAppName || '',
    api_name: item.apiName || '',
    api_path: item.apiPath || '',
    operation_type: item.operationType || '新增',
    log_time: formatDateTime(item.logTime)
  };
}

/**
 * 分页查询权限配置历史记录。
 */
export async function fetchAuthConfigLogPage(
  query: AuthConfigLogQuery
): Promise<PageResult<AuthConfigLogItem>> {
  const data = await request<AuthConfigLogBackendResponse>('/api/logs/auth-config/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      authLogId: query.auth_log_id || undefined,
      callerAppCode: query.caller_app_code || undefined,
      callerAppName: query.caller_app_name || undefined,
      calleeAppCode: query.callee_app_code || undefined,
      calleeAppName: query.callee_app_name || undefined,
      apiName: query.api_name || undefined,
      apiPath: query.api_path || undefined,
      operationType: query.operation_type === '新增'
        ? 0
        : query.operation_type === '撤销'
          ? 1
          : query.operation_type === '修改'
            ? 2
            : undefined,
      startTime: query.start_time || undefined,
      endTime: query.end_time || undefined
    })
  });

  return {
    list: data.records.map(mapAuthConfigLogItem),
    total: data.total,
    page: data.pageNum,
    pageSize: data.pageSize
  };
}

export async function fetchAuthConfigCallerAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/caller-app-code-options?keyword=${encodeURIComponent(keyword)}`);
}

export async function fetchAuthConfigCallerAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/caller-app-name-options?keyword=${encodeURIComponent(keyword)}`);
}

export async function fetchAuthConfigCalleeAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/callee-app-code-options?keyword=${encodeURIComponent(keyword)}`);
}

export async function fetchAuthConfigCalleeAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/callee-app-name-options?keyword=${encodeURIComponent(keyword)}`);
}

export async function fetchAuthConfigApiNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/api-name-options?keyword=${encodeURIComponent(keyword)}`);
}

export async function fetchAuthConfigApiPathOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/auth-config/api-path-options?keyword=${encodeURIComponent(keyword)}`);
}

/**
 * 查询 SmartDoc 导入历史页面使用的应用编码候选项。
 */
export async function fetchSmartDocImportAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/smartdoc-import/app-code-options?keyword=${encodeURIComponent(keyword)}`);
}

/**
 * 查询 SmartDoc 导入历史页面使用的应用名称候选项。
 */
export async function fetchSmartDocImportAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/smartdoc-import/app-name-options?keyword=${encodeURIComponent(keyword)}`);
}

/**
 * 分页查询 SmartDoc 导入历史记录。
 */
export async function fetchSmartDocImportLogPage(
  query: SmartDocImportLogQuery
): Promise<PageResult<SmartDocImportLogItem>> {
  const data = await request<SmartDocImportLogBackendResponse>('/api/logs/smartdoc-import/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      appCode: query.app_code || undefined,
      appName: query.app_name || undefined,
      version: query.version || undefined
    })
  });

  return {
    list: data.records.map(mapSmartDocImportLogItem),
    total: data.total,
    page: data.pageNum,
    pageSize: data.pageSize
  };
}

/**
 * 查询 SmartDoc 导入历史页面使用的版本号候选项。
 */
export async function fetchSmartDocImportVersionOptions(keyword: string): Promise<string[]> {
  return request<string[]>(`/api/logs/smartdoc-import/version-options?keyword=${encodeURIComponent(keyword)}`);
}
