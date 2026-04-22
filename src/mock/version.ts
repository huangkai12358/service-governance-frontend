import { versionDetails, versionHistories } from './base';
import { success, wait } from '@/utils/mock';

export interface VersionListQuery {
  app_code?: string;
  app_name?: string;
  api_version_id?: string;
}

export async function fetchVersionList(query: VersionListQuery) {
  const list = versionHistories.filter((item) => {
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name)) &&
      (!query.api_version_id || item.api_version_id.includes(query.api_version_id));
  });
  return wait(success(list));
}

export async function fetchVersionDetail(id: string) {
  return wait(success(versionDetails.find((item) => item.version.id === id) || null));
}

export async function rollbackVersion() {
  return wait(success(true, '回滚成功'));
}
