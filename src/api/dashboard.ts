import { request } from '@/utils/request';
import type { ActivityRecord, AuthServiceSettings, AuthServiceMode, OverviewStats } from '@/types/business';

interface AuthServiceSettingsBackendResponse {
  mode: AuthServiceMode;
  updatedAt: string | null;
}

export interface DashboardTopologyNode {
  name: string;
  label: string;
  value: number;
  category: number;
}

export interface DashboardTopologyApiDetail {
  name: string;
  path: string;
}

export interface DashboardTopologyLink {
  source: string;
  target: string;
  value: number;
  apiPaths: string[];
  apiDetails: DashboardTopologyApiDetail[];
}

export interface DashboardTopologyCategory {
  name: string;
}

export interface DashboardTopologyData {
  nodes: DashboardTopologyNode[];
  links: DashboardTopologyLink[];
  categories: DashboardTopologyCategory[];
}

interface DashboardOverviewBackendResponse {
  stats?: {
    appTotal?: number;
    apiTotal?: number;
    authRelationTotal?: number;
    smartDocImportTotal?: number;
    todayCallTotal?: number;
  };
  authServiceSettings?: AuthServiceSettingsBackendResponse;
  imports?: ActivityRecord[];
  auths?: ActivityRecord[];
  calls?: ActivityRecord[];
}

function mapAuthServiceSettings(data: AuthServiceSettingsBackendResponse): AuthServiceSettings {
  return {
    mode: data.mode,
    updated_at: data.updatedAt || ''
  };
}

function mapOverviewStats(data: DashboardOverviewBackendResponse['stats'] = {}): OverviewStats {
  return {
    app_total: data.appTotal ?? 0,
    api_total: data.apiTotal ?? 0,
    auth_relation_total: data.authRelationTotal ?? 0,
    smartdoc_import_total: data.smartDocImportTotal ?? 0,
    today_call_total: data.todayCallTotal ?? 0
  };
}

export async function fetchDashboard() {
  const data = await request<DashboardOverviewBackendResponse>('/api/dashboard/overview', {
    method: 'POST',
    body: JSON.stringify({})
  });

  return {
    stats: mapOverviewStats(data.stats),
    authServiceSettings: data.authServiceSettings ? mapAuthServiceSettings(data.authServiceSettings) : null,
    imports: data.imports || [],
    auths: data.auths || [],
    calls: data.calls || []
  };
}

/**
 * 查询当前鉴权服务模式，供首页权限卡片回显。
 */
export async function fetchAuthServiceSettings(): Promise<AuthServiceSettings> {
  const data = await request<AuthServiceSettingsBackendResponse>('/api/dashboard/auth-settings');
  return mapAuthServiceSettings(data);
}

/**
 * 更新当前鉴权服务模式。
 */
export async function updateAuthServiceSettings(payload: { mode: AuthServiceMode }) {
  const data = await request<AuthServiceSettingsBackendResponse>('/api/dashboard/auth-settings/update', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    data: mapAuthServiceSettings(data),
    message: '鉴权服务设置更新成功'
  };
}

export async function fetchDashboardTopology(): Promise<DashboardTopologyData> {
  return request<DashboardTopologyData>('/api/dashboard/topology', {
    method: 'POST'
  });
}
