import { request } from '@/utils/request';
import type { AuthServiceSettings, AuthServiceMode } from '@/types/business';

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

function mapAuthServiceSettings(data: AuthServiceSettingsBackendResponse): AuthServiceSettings {
  return {
    mode: data.mode,
    updated_at: data.updatedAt || ''
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
