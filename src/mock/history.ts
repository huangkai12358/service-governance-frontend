import { post } from '@/api/client';

export async function fetchAuthConfigLogs(query: {
  auth_log_id?: string;
  caller_app_code?: string;
  caller_app_name?: string;
  callee_app_code?: string;
  callee_app_name?: string;
  api_name?: string;
  api_path?: string;
  operation_type?: string;
  time_range?: string[];
}) {
  return post<any[]>('/api/logs/permission/list', query);
}

export async function fetchSmartDocImportLogs(query: {
  api_version_id?: string;
  app_code?: string;
  app_name?: string;
  version?: string;
  time_range?: string[];
}) {
  return post<any[]>('/api/logs/import/list', query);
}
