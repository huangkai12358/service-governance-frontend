import { request } from '@/utils/request';

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

export async function fetchDashboardTopology(): Promise<DashboardTopologyData> {
  return request<DashboardTopologyData>('/api/dashboard/topology', {
    method: 'POST'
  });
}
