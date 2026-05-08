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
  operation_type?: '新增' | '删除' | '';
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
  operation_type: '新增' | '删除';
  log_time: string;
}

interface KeywordQuery {
  keyword: string;
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

export interface RemoteCallLogQuery {
  page: number;
  pageSize: number;
  caller_app_code?: string;
  caller_app_name?: string;
  callee_app_code?: string;
  callee_app_name?: string;
  result?: 'SUCCESS' | 'FAIL' | 'BYPASS' | '';
}

export interface RemoteCallLogItem {
  call_decision_log_id: number;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  result: 'SUCCESS' | 'FAIL' | 'BYPASS';
  decision_reason: string;
  log_time: string;
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
  operationType: '新增' | '删除' | null;
  logTime: string | null;
}

interface AuthConfigLogBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: AuthConfigLogBackendItem[];
}

interface RemoteCallLogBackendItem {
  callDecisionLogId: number;
  callerAppCode: string | null;
  callerAppName: string | null;
  calleeAppCode: string | null;
  calleeAppName: string | null;
  result: 'SUCCESS' | 'FAIL' | 'BYPASS' | null;
  decisionReason: string | null;
  logTime: string | null;
}

interface RemoteCallLogBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: RemoteCallLogBackendItem[];
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
 * 将后端返回的远程调用历史记录转换为前端稳定使用的结构。
 */
function mapRemoteCallLogItem(item: RemoteCallLogBackendItem): RemoteCallLogItem {
  return {
    call_decision_log_id: item.callDecisionLogId,
    caller_app_code: item.callerAppCode || '',
    caller_app_name: item.callerAppName || '',
    callee_app_code: item.calleeAppCode || '',
    callee_app_name: item.calleeAppName || '',
    result: item.result || 'SUCCESS',
    decision_reason: item.decisionReason || '',
    log_time: formatDateTime(item.logTime)
  };
}

/**
 * 统一构造日志候选项查询请求体，保持所有日志接口调用风格一致。
 */
function buildKeywordQuery(keyword: string): KeywordQuery {
  return { keyword };
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
        : query.operation_type === '删除'
          ? 1
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
  return request<string[]>('/api/logs/auth-config/caller-app-code-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchAuthConfigCallerAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/auth-config/caller-app-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchAuthConfigCalleeAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/auth-config/callee-app-code-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchAuthConfigCalleeAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/auth-config/callee-app-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchAuthConfigApiNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/auth-config/api-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchAuthConfigApiPathOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/auth-config/api-path-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

/**
 * 查询 SmartDoc 导入历史页面使用的应用编码候选项。
 */
export async function fetchSmartDocImportAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/smartdoc-import/app-code-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

/**
 * 查询 SmartDoc 导入历史页面使用的应用名称候选项。
 */
export async function fetchSmartDocImportAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/smartdoc-import/app-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
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
  return request<string[]>('/api/logs/smartdoc-import/version-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

/**
 * 分页查询远程调用历史记录。
 */
export async function fetchRemoteCallLogPage(
  query: RemoteCallLogQuery
): Promise<PageResult<RemoteCallLogItem>> {
  const data = await request<RemoteCallLogBackendResponse>('/api/logs/remote-call/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      callerAppCode: query.caller_app_code || undefined,
      callerAppName: query.caller_app_name || undefined,
      calleeAppCode: query.callee_app_code || undefined,
      calleeAppName: query.callee_app_name || undefined,
      result: query.result === 'SUCCESS'
        ? 0
        : query.result === 'FAIL'
          ? 1
          : query.result === 'BYPASS'
            ? 2
            : undefined
    })
  });

  return {
    list: data.records.map(mapRemoteCallLogItem),
    total: data.total,
    page: data.pageNum,
    pageSize: data.pageSize
  };
}

export async function fetchRemoteCallCallerAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/remote-call/caller-app-code-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchRemoteCallCallerAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/remote-call/caller-app-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchRemoteCallCalleeAppCodeOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/remote-call/callee-app-code-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}

export async function fetchRemoteCallCalleeAppNameOptions(keyword: string): Promise<string[]> {
  return request<string[]>('/api/logs/remote-call/callee-app-name-options', {
    method: 'POST',
    body: JSON.stringify(buildKeywordQuery(keyword))
  });
}
