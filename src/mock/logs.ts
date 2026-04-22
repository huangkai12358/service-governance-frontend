import { remoteCallLogs } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchRemoteCallLogs(query: {
  call_decision_log_id?: string;
  caller_app_code?: string;
  callee_app_code?: string;
  result?: string;
  time_range?: string[];
}) {
  const list = remoteCallLogs.filter((item) => {
    const inTime = !query.time_range?.length || (item.log_time >= query.time_range[0] && item.log_time <= query.time_range[1]);
    return (!query.call_decision_log_id || item.call_decision_log_id.includes(query.call_decision_log_id)) &&
      (!query.caller_app_code || item.caller_app_code.includes(query.caller_app_code)) &&
      (!query.callee_app_code || item.callee_app_code.includes(query.callee_app_code)) &&
      (!query.result || item.result === query.result) &&
      inTime;
  });
  return wait(success(list));
}
