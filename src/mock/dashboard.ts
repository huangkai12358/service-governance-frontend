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

/* ===================== 拓扑图数据接口 ===================== */

// 应用编码 → 应用名称的映射表
const appNameMap = new Map(apps.map((app) => [app.app_code, app.app_name]));

/**
 * 拓扑图节点类型定义
 */
export interface TopologyNode {
  name: string;         // 应用编码（唯一标识）
  label: string;        // 应用名称（显示用）
  value: number;        // 连接度数（关联的授权关系条数）
  category: number;     // 分类索引（用于颜色分组）
}

/**
 * 拓扑图连线类型定义
 */
export interface TopologyLink {
  source: string;       // 调用方应用编码
  target: string;       // 被调用方应用编码
  value: number;        // 授权的 API 数量
  apiPaths: string[];   // 授权的 API 路径列表
  apiDetails?: { name: string; path: string }[]; // API 详细信息，包括名称和路径
}

/**
 * 拓扑图分类定义（用于图例和颜色分组）
 */
export interface TopologyCategory {
  name: string;
}

/**
 * 拓扑图完整数据结构
 */
export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
  categories: TopologyCategory[];
}

/**
 * 构建 API 授权拓扑图数据
 * 数据来源：singleAppAuthorizations（模拟 app_api_auth 表）
 * 展示所有已配置的合法调用关系，鼠标悬浮可查看具体 API 列表
 */
function buildAuthTopology(): TopologyData {
  // 聚合同一对 caller→callee 之间的所有授权 API
  const linkMap = new Map<string, { count: number; apiDetails: { name: string; path: string }[] }>();
  
  // 预先建立 API 路径到名称的映射，以便快速查找
  const apiPathToName = new Map<string, string>();
  apis.forEach(api => apiPathToName.set(api.api_path, api.api_name));

  singleAppAuthorizations.forEach((auth) => {
    const key = `${auth.caller_app_code}→${auth.callee_app_code}`;
    const details = auth.api_paths.map(path => ({
      name: apiPathToName.get(path) || '未知接口',
      path
    }));

    const existing = linkMap.get(key);
    if (existing) {
      // 同一对应用间可能有多条授权记录，合并 API 详情
      existing.count += auth.api_paths.length;
      existing.apiDetails.push(...details);
    } else {
      linkMap.set(key, { count: auth.api_paths.length, apiDetails: [...details] });
    }
  });

  // 统计每个节点的连接度数（出度 + 入度）
  const degreeMap = new Map<string, number>();
  linkMap.forEach((_, key) => {
    const [source, target] = key.split('→');
    degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
    degreeMap.set(target, (degreeMap.get(target) || 0) + 1);
  });

  // 收集所有涉及的应用编码（不做截断，展示全量）
  const allAppCodes = [...degreeMap.keys()];

  // 每个应用独立分类，确保每个节点拥有不同颜色
  const categories: TopologyCategory[] = allAppCodes.map((code) => ({
    name: appNameMap.get(code) || code
  }));

  // 构建节点数组（全量应用），category 索引与 allAppCodes 下标一一对应
  const nodes: TopologyNode[] = allAppCodes.map((code, index) => ({
    name: code,
    label: appNameMap.get(code) || code,
    value: degreeMap.get(code) || 0,
    category: index
  }));

  // 构建连线数组（全量授权关系）
  const links: TopologyLink[] = [];
  linkMap.forEach((data, key) => {
    const [source, target] = key.split('→');
    links.push({
      source,
      target,
      value: data.count,
      apiPaths: data.apiDetails.map(d => d.path),
      apiDetails: data.apiDetails
    });
  });

  return { nodes, links, categories };
}

/**
 * 获取拓扑图数据的统一接口
 * 返回全量 API 授权关系的拓扑图数据
 */
export async function fetchTopologyData() {
  const data = buildAuthTopology();
  return wait(success(data));
}
