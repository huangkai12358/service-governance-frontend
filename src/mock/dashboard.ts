import { post } from '@/api/client';
import type { AuthServiceSettings } from '@/types/business';

export interface TopologyNode {
  name: string;
  label: string;
  value: number;
  category: number;
}

export interface TopologyLink {
  source: string;
  target: string;
  value: number;
  apiPaths: string[];
  apiDetails?: { name: string; path: string }[];
}

export interface TopologyCategory {
  name: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
  categories: TopologyCategory[];
}

export async function fetchDashboard() {
  const response = await post<any>('/api/dashboard/overview', {});
  return {
    ...response,
    data: {
      ...response.data,
      stats: toOverviewStats(response.data?.stats || {}),
      auth_service_settings: toAuthSettings(response.data?.authServiceSettings || response.data?.auth_service_settings || {}),
      imports: response.data?.imports || [],
      auths: response.data?.auths || [],
      calls: response.data?.calls || []
    }
  };
}

export async function updateAuthServiceSettings(payload: { mode: AuthServiceSettings['mode'] }) {
  const response = await post<any>('/api/system/auth-mode/update', payload);
  return {
    ...response,
    data: toAuthSettings(response.data || {})
  };
}

export async function fetchTopologyData() {
  return post<TopologyData>('/api/dashboard/topology', {});
}

function toOverviewStats(item: any) {
  return {
    app_total: item.appTotal ?? item.app_total ?? 0,
    api_total: item.apiTotal ?? item.api_total ?? 0,
    auth_relation_total: item.authRelationTotal ?? item.auth_relation_total ?? 0,
    smartdoc_import_total: item.smartDocImportTotal ?? item.smartdoc_import_total ?? 0,
    today_call_total: item.todayCallTotal ?? item.today_call_total ?? 0
  };
}

function toAuthSettings(item: any): AuthServiceSettings {
  return {
    mode: item.mode || item.systemStatus || item.system_status || 'ENABLED',
    updated_at: item.updatedAt || item.updated_at || ''
  };
}
