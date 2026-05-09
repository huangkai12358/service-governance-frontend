<template>
  <div class="page-container full-height">
    <el-card class="panel-card topology-card" shadow="never">
      <div class="topology-header">
        <div class="topology-title">
          <h3>API 授权拓扑图</h3>
          <p class="text-muted">
            当前纳管：{{ stats?.app_total ?? 0 }} 个服务，{{ stats?.api_total ?? 0 }} 个 API，共配置
            {{ stats?.auth_relation_total ?? 0 }} 个授权 API 关系
          </p>
        </div>
        <div class="topology-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索服务名、API 名称或路径..."
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <div ref="chartRef" class="topology-chart" />
    </el-card>

    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="480px"
      destroy-on-close
      direction="rtl"
    >
      <template v-if="drawerType === 'node' && drawerNodeData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="应用编码">{{ drawerNodeData.nodeCode }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-section">
          <div class="drawer-section-title">
            作为调用方
            <el-tag type="info" size="small">
              {{ drawerNodeData.callerList.length }} 个服务 / {{ drawerNodeData.callerApiTotal }} 个 API
            </el-tag>
          </div>
          <el-table :data="drawerNodeData.callerList" size="small" border>
            <el-table-column prop="appName" label="被调用服务" min-width="180" show-overflow-tooltip />
            <el-table-column prop="apiCount" label="授权 API 数" width="110" align="center" />
          </el-table>
        </div>

        <div class="drawer-section">
          <div class="drawer-section-title">
            作为被调用方
            <el-tag type="info" size="small">
              {{ drawerNodeData.calleeList.length }} 个服务 / {{ drawerNodeData.calleeApiTotal }} 个 API
            </el-tag>
          </div>
          <el-table :data="drawerNodeData.calleeList" size="small" border>
            <el-table-column prop="appName" label="调用方服务" min-width="180" show-overflow-tooltip />
            <el-table-column prop="apiCount" label="授权 API 数" width="110" align="center" />
          </el-table>
        </div>
      </template>

      <template v-if="drawerType === 'edge' && drawerEdgeData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="调用方">{{ drawerEdgeData.sourceName }}</el-descriptions-item>
          <el-descriptions-item label="被调用方">{{ drawerEdgeData.targetName }}</el-descriptions-item>
          <el-descriptions-item label="授权 API 数量">{{ drawerEdgeData.apiDetails.length }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-section">
          <div class="drawer-section-title">授权 API 列表</div>
          <el-table :data="drawerEdgeData.apiDetails" size="small" border>
            <el-table-column prop="name" label="API 名称" min-width="140" show-overflow-tooltip />
            <el-table-column prop="path" label="API 路径" min-width="200" show-overflow-tooltip />
          </el-table>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { fetchDashboardTopology, type DashboardTopologyData } from '@/api/dashboard';
import type { OverviewStats } from '@/types/business';

interface NodeDrawerItem {
  appName: string;
  apiCount: number;
}

interface NodeDrawerData {
  nodeCode: string;
  displayName: string;
  callerList: NodeDrawerItem[];
  callerApiTotal: number;
  calleeList: NodeDrawerItem[];
  calleeApiTotal: number;
}

interface EdgeDrawerData {
  sourceName: string;
  targetName: string;
  apiDetails: Array<{ name: string; path: string }>;
}

const stats = ref<OverviewStats | null>(null);
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const rawTopologyData = ref<DashboardTopologyData | null>(null);
const searchQuery = ref('');

const drawerVisible = ref(false);
const drawerType = ref<'node' | 'edge'>('node');
const drawerTitle = ref('');
const drawerNodeData = ref<NodeDrawerData | null>(null);
const drawerEdgeData = ref<EdgeDrawerData | null>(null);

/** 控制每个节点在原有大小计算结果上的整体缩放比例。 */
const NODE_SYMBOL_SIZE_SCALE = 0.4;
/** 控制拓扑图首次渲染时的默认缩放比例。 */
const INITIAL_TOPOLOGY_ZOOM = 1.0;
/** 控制节点之间的排斥强度，数值越大节点间距越松散。 */
const TOPOLOGY_FORCE_REPULSION = 260;
/** 控制节点向中心聚拢的强度，数值越小整体越不容易挤在中心。 */
const TOPOLOGY_FORCE_GRAVITY = 0.08;
/** 控制授权关系连线两端节点的期望距离。 */
const TOPOLOGY_FORCE_EDGE_LENGTH: [number, number] = [150, 220];
/** 控制授权关系连线的最小宽度。 */
const TOPOLOGY_LINK_MIN_WIDTH = 0.25;
/** 控制授权关系连线的最大宽度。 */
const TOPOLOGY_LINK_MAX_WIDTH = 2.6;

function generateNodeColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${Math.round(hue)}, 45%, 55%)`;
}

/**
 * 按照节点 API 数量占比计算图形尺寸，并通过统一缩放系数控制整体节点大小。
 */
function calculateNodeSymbolSize(nodeValue: number, maxNodeValue: number, minSize: number, maxSize: number): number {
  const baseSize = minSize + ((nodeValue / maxNodeValue) * (maxSize - minSize));
  return baseSize * NODE_SYMBOL_SIZE_SCALE;
}

/**
 * 按照授权 API 数量占比计算连线宽度，并限制在统一的细线范围内。
 */
function calculateLinkLineWidth(linkValue: number, maxLinkValue: number): number {
  return TOPOLOGY_LINK_MIN_WIDTH
    + ((linkValue / maxLinkValue) * (TOPOLOGY_LINK_MAX_WIDTH - TOPOLOGY_LINK_MIN_WIDTH));
}

function buildChartOption(topology: DashboardTopologyData): echarts.EChartsOption {
  const maxDegree = Math.max(...topology.nodes.map((n) => n.value), 1);
  const minSize = 12;
  const maxSize = 35;
  const maxWeight = Math.max(...topology.links.map((l) => l.value), 1);

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const nodeCode = params.name;
          const asCallerCount = topology.links.filter((l) => l.source === nodeCode).length;
          const asCalleeCount = topology.links.filter((l) => l.target === nodeCode).length;
          return `<div style="font-weight:600;font-size:14px;margin-bottom:4px">${params.data.displayName || nodeCode}</div>`
            + `<div style="color:#64748b;font-size:12px">点击节点查看授权详情</div>`
            + `<div style="color:#64748b;font-size:12px">作为调用方：${asCallerCount} 个服务 | 作为被调方：${asCalleeCount} 个服务</div>`;
        }
        if (params.dataType === 'edge') {
          const linkData = params.data;
          const sourceLabel = topology.nodes.find((n) => n.name === linkData.source)?.label || linkData.source;
          const targetLabel = topology.nodes.find((n) => n.name === linkData.target)?.label || linkData.target;
          return `<div style="font-weight:600;font-size:14px;margin-bottom:4px">${sourceLabel} -> ${targetLabel}</div>`
            + `<div style="color:#64748b;font-size:12px">点击连线查看授权 API 列表（共 ${linkData.apiDetails?.length || 0} 个）</div>`;
        }
        return '';
      }
    },
    legend: { show: false },
    animationDuration: 1200,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'API 授权拓扑',
        type: 'graph',
        layout: 'force',
        zoom: INITIAL_TOPOLOGY_ZOOM,
        force: {
          repulsion: TOPOLOGY_FORCE_REPULSION,
          gravity: TOPOLOGY_FORCE_GRAVITY,
          edgeLength: TOPOLOGY_FORCE_EDGE_LENGTH,
          friction: 0.6,
          layoutAnimation: false
        },
        roam: true,
        draggable: true,
        data: topology.nodes.map((node) => ({
          name: node.name,
          displayName: node.label,
          value: node.value,
          category: node.category,
          symbolSize: calculateNodeSymbolSize(node.value, maxDegree, minSize, maxSize),
          label: {
            show: true,
            position: 'bottom' as const,
            formatter: node.label,
            fontSize: 11,
            color: '#374151'
          },
          itemStyle: {
            borderWidth: 0,
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.15)'
          }
        })),
        links: topology.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
          apiPaths: link.apiPaths,
          apiDetails: link.apiDetails,
          lineStyle: {
            width: calculateLinkLineWidth(link.value, maxWeight),
            color: 'rgba(29, 78, 216, 0.3)',
            curveness: 0.2,
            opacity: 0.65
          }
        })),
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 7],
        categories: topology.categories.map((cat, index) => ({
          name: cat.name,
          itemStyle: { color: generateNodeColor(index) }
        })),
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3, opacity: 1 },
          itemStyle: { borderWidth: 3 }
        }
      }
    ]
  };
}

function renderChart() {
  if (!chartInstance || !rawTopologyData.value) {
    return;
  }

  let displayData = rawTopologyData.value;
  const query = searchQuery.value.trim().toLowerCase();

  if (query) {
    const matchedNodes = new Set(
      displayData.nodes
        .filter((n) => n.name.toLowerCase().includes(query) || n.label.toLowerCase().includes(query))
        .map((n) => n.name)
    );

    const matchedLinks = displayData.links.filter((link) => {
      const apiMatched = link.apiDetails.some((api) =>
        api.name.toLowerCase().includes(query) || api.path.toLowerCase().includes(query)
      );
      const nodeMatched = matchedNodes.has(link.source) || matchedNodes.has(link.target);
      return apiMatched || nodeMatched;
    });

    const keepNodeCodes = new Set<string>();
    matchedLinks.forEach((link) => {
      keepNodeCodes.add(link.source);
      keepNodeCodes.add(link.target);
    });
    matchedNodes.forEach((code) => keepNodeCodes.add(code));

    displayData = {
      ...displayData,
      nodes: displayData.nodes.filter((n) => keepNodeCodes.has(n.name)),
      links: matchedLinks
    };
  }

  chartInstance.clear();
  chartInstance.setOption(buildChartOption(displayData), { notMerge: true });
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    renderChart();
  }, 300);
});

function buildStats(topology: DashboardTopologyData): OverviewStats {
  return {
    app_total: topology.nodes.length,
    api_total: topology.nodes.reduce((sum, node) => sum + node.value, 0),
    auth_relation_total: topology.links.reduce((sum, link) => sum + link.value, 0),
    smartdoc_import_total: 0,
    today_call_total: 0
  };
}

async function loadTopology() {
  if (!chartInstance) {
    return;
  }

  chartInstance.showLoading({ text: '拓扑数据加载中...' });
  try {
    const topologyData = await fetchDashboardTopology();
    rawTopologyData.value = topologyData;
    stats.value = buildStats(topologyData);
    renderChart();
  } finally {
    chartInstance.hideLoading();
  }
}

function buildNodeDrawerData(nodeCode: string, displayName: string, topology: DashboardTopologyData): NodeDrawerData {
  const callerLinks = topology.links.filter((l) => l.source === nodeCode);
  const callerList = callerLinks.map((l) => {
    const targetNode = topology.nodes.find((n) => n.name === l.target);
    return {
      appName: targetNode ? `${targetNode.label}（${l.target}）` : l.target,
      apiCount: l.value
    };
  });

  const calleeLinks = topology.links.filter((l) => l.target === nodeCode);
  const calleeList = calleeLinks.map((l) => {
    const sourceNode = topology.nodes.find((n) => n.name === l.source);
    return {
      appName: sourceNode ? `${sourceNode.label}（${l.source}）` : l.source,
      apiCount: l.value
    };
  });

  return {
    nodeCode,
    displayName,
    callerList,
    callerApiTotal: callerLinks.reduce((sum, l) => sum + l.value, 0),
    calleeList,
    calleeApiTotal: calleeLinks.reduce((sum, l) => sum + l.value, 0)
  };
}

function initChart() {
  if (!chartRef.value) {
    return;
  }

  chartInstance = echarts.init(chartRef.value);
  chartInstance.on('click', (params) => {
    if (!rawTopologyData.value) {
      return;
    }

    if (params.dataType === 'node') {
      const nodeCode = params.name;
      const displayName = (params.data as { displayName?: string })?.displayName || nodeCode;
      drawerType.value = 'node';
      drawerTitle.value = displayName;
      drawerNodeData.value = buildNodeDrawerData(nodeCode, displayName, rawTopologyData.value);
      drawerEdgeData.value = null;
      drawerVisible.value = true;
      return;
    }

    if (params.dataType === 'edge') {
      const linkData = params.data as {
        source: string;
        target: string;
        apiDetails?: Array<{ name: string; path: string }>;
      };
      const sourceLabel = rawTopologyData.value.nodes.find((n) => n.name === linkData.source)?.label || linkData.source;
      const targetLabel = rawTopologyData.value.nodes.find((n) => n.name === linkData.target)?.label || linkData.target;
      drawerType.value = 'edge';
      drawerTitle.value = `${sourceLabel} -> ${targetLabel}`;
      drawerEdgeData.value = {
        sourceName: `${sourceLabel}（${linkData.source}）`,
        targetName: `${targetLabel}（${linkData.target}）`,
        apiDetails: linkData.apiDetails || []
      };
      drawerNodeData.value = null;
      drawerVisible.value = true;
    }
  });

  chartInstance.getZr().on('click', (event) => {
    if (!event.target) {
      drawerVisible.value = false;
    }
  });

  void loadTopology();
}

function handleResize() {
  chartInstance?.resize();
}

onMounted(async () => {
  await nextTick();
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<style scoped>
.full-height {
  height: calc(100vh - 54px);
}

.topology-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.topology-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 16px;
  border-bottom: 1px solid var(--sg-border);
  margin-bottom: 8px;
}

.topology-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--sg-text);
}

.topology-title p {
  margin: 4px 0 0;
  font-size: 13px;
}

.topology-chart {
  width: 100%;
  height: calc(100vh - 140px);
}

.drawer-section {
  margin-top: 16px;
}

.drawer-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sg-text);
}
</style>
