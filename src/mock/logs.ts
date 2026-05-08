import { post } from '@/api/client';

export async function fetchRemoteCallLogs(query: {
  call_decision_log_id?: string;
  caller_app_code?: string;
  caller_app_name?: string;
  callee_app_code?: string;
  callee_app_name?: string;
  result?: string;
  time_range?: string[];
}) {
  return post<any[]>('/api/logs/remote-call/list', query);
}
