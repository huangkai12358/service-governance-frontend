import { apps, apiGroups, apis, appGroups, dashboardActivities, remoteCallLogs, singleAppAuthorizations, smartDocImportLogs } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchDashboard() {
  return wait(success({
    stats: {
      api_total: apis.filter((item) => item.is_deleted === 0).length,
      app_total: apps.filter((item) => item.is_deleted === 0).length,
      api_group_total: apiGroups.filter((item) => item.is_deleted === 0).length,
      app_group_total: appGroups.filter((item) => item.is_deleted === 0).length,
      auth_relation_total: singleAppAuthorizations.length,
      smartdoc_import_total: smartDocImportLogs.length,
      today_call_total: remoteCallLogs.length
    },
    imports: dashboardActivities.imports,
    auths: dashboardActivities.auths,
    calls: dashboardActivities.calls
  }));
}
