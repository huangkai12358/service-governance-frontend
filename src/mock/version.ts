import { apps, versionDetails, versionHistories } from './base';
import { success, wait } from '@/utils/mock';

export interface VersionListQuery {
  app_code?: string;
  app_name?: string;
  version?: string;
}

export async function fetchVersionList(query: VersionListQuery) {
  const list = versionHistories.filter((item) => {
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name)) &&
      (!query.version || item.version.includes(query.version));
  }).sort((a, b) => b.create_time.localeCompare(a.create_time))
    .map((item) => ({
      ...item,
      app_description: apps.find((app) => app.app_code === item.app_code)?.app_description || '-'
    }));
  return wait(success(list));
}

export async function fetchVersionDetail(id: number) {
  return wait(success(versionDetails.find((item) => item.version.id === id) || null));
}
