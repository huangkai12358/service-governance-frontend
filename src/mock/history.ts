import { authConfigLogs, smartDocImportLogs } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchAuthConfigLogs(query: {
  auth_log_id?: string;
  caller_app_code?: string;
  callee_app_code?: string;
  api_name?: string;
  api_path?: string;
  operation_type?: string;
  time_range?: string[];
}) {
  const list = authConfigLogs.filter((item) => {
    const inTime = !query.time_range?.length || (item.log_time >= query.time_range[0] && item.log_time <= query.time_range[1]);
    return (!query.auth_log_id || item.auth_log_id.includes(query.auth_log_id)) &&
      (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code)) &&
      (!query.api_name || item.api_name.includes(query.api_name)) &&
      (!query.api_path || item.api_path.includes(query.api_path)) &&
      (!query.operation_type || item.operation_type === query.operation_type) &&
      inTime;
  });
  return wait(success(list));
}

export async function fetchSmartDocImportLogs(query: {
  app_code?: string;
  api_version_id?: string;
  time_range?: string[];
}) {
  const list = smartDocImportLogs.filter((item) => {
    const inTime = !query.time_range?.length || (item.create_time >= query.time_range[0] && item.create_time <= query.time_range[1]);
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.api_version_id || item.api_version_id.includes(query.api_version_id)) &&
      inTime;
  });
  return wait(success(list));
}
