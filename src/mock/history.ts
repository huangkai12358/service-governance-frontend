import { authorizationRecords, rollbackRecords, versions } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchAuthHistory() {
  return wait(success(authorizationRecords));
}

export async function fetchVersionHistory() {
  const history = [
    ...versions.map((item) => ({
      id: item.id,
      version: item.version,
      operationType: '导入',
      time: item.importedAt,
      scope: item.scope
    })),
    ...rollbackRecords.map((item) => ({
      id: item.id,
      version: item.version,
      operationType: '回滚',
      time: item.time,
      scope: item.reason
    }))
  ].sort((a, b) => b.time.localeCompare(a.time));
  return wait(success(history));
}
