import { authConfigLogs, smartDocImportLogs } from './base';
import { success, wait } from '@/utils/mock';

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
  const list = authConfigLogs.filter((item) => {
    const inTime = !query.time_range?.length || (item.log_time >= query.time_range[0] && item.log_time <= query.time_range[1]);
    return (!query.auth_log_id || String(item.auth_log_id).includes(query.auth_log_id)) &&
      (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.caller_app_name || item.caller_app_name.includes(query.caller_app_name)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code)) &&
      (!query.callee_app_name || item.callee_app_name.includes(query.callee_app_name)) &&
      (!query.api_name || item.api_name.includes(query.api_name)) &&
      (!query.api_path || item.api_path.includes(query.api_path)) &&
      (!query.operation_type || item.operation_type === query.operation_type) &&
      inTime;
  }).sort((a, b) => b.log_time.localeCompare(a.log_time));
  return wait(success(list));
}

export async function fetchSmartDocImportLogs(query: {
  api_version_id?: string;
  app_code?: string;
  app_name?: string;
  version?: string;
  time_range?: string[];
}) {
  const list = smartDocImportLogs.filter((item) => {
    const inTime = !query.time_range?.length || (item.create_time >= query.time_range[0] && item.create_time <= query.time_range[1]);
    return (!query.api_version_id || String(item.api_version_id).includes(query.api_version_id)) &&
      (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name)) &&
      (!query.version || item.version.includes(query.version)) &&
      inTime;
  }).sort((a, b) => b.create_time.localeCompare(a.create_time));
  return wait(success(list));
}
