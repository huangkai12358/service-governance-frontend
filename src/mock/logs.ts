import { remoteLogs } from './base';
import { success, wait } from '@/utils/mock';
import type { PageQuery } from '@/types/common';

interface LogQuery extends PageQuery {
  callerApp?: string;
  calleeApp?: string;
  checkResult?: string;
  timeRange?: string[];
}

export async function fetchRemoteLogs(query: LogQuery) {
  const filtered = remoteLogs.filter((item) => {
    const matchTime = !query.timeRange?.length || (item.time >= query.timeRange[0] && item.time <= query.timeRange[1]);
    return (!query.callerApp || item.callerApp.includes(query.callerApp)) &&
      (!query.calleeApp || item.calleeApp.includes(query.calleeApp)) &&
      (!query.checkResult || item.checkResult === query.checkResult) &&
      matchTime;
  });
  const start = (query.page - 1) * query.pageSize;
  return wait(success({
    list: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize
  }));
}
