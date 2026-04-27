<template>
  <div class="page-container full-height">
    <!-- API 授权拓扑图区域 -->
    <el-card class="panel-card topology-card" shadow="never">
      <div class="topology-header">
        <div class="topology-title">
          <h3>API授权拓扑图</h3>
          <p class="text-muted">
            当前纳管：{{ stats?.app_total }} 个服务，{{ stats?.api_total }} 个 API，共配置 {{ stats?.auth_relation_total }} 条授权
          </p>
        </div>
        <div class="topology-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索服务名、API名称或路径..."
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <!-- ECharts 渲染容器 -->
      <div ref="chartRef" class="topology-chart" />
    </el-card>

    <!-- 拓扑图详情抽屉：点击节点或连线后右侧滑出 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="480px"
      destroy-on-close
      direction="rtl"
    >
      <!-- 节点详情：展示该应用作为调用方/被调用方的授权关系 -->
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

      <!-- 连线详情：展示该授权关系下的所有 API -->
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
import { onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { fetchTopologyData, fetchDashboard } from '@/mock/dashboard';
import type { TopologyData } from '@/mock/dashboard';
import type { OverviewStats } from '@/types/business';
import * as echarts from 'echarts';

/* ===================== 统计数据逻辑 ===================== */

const stats = ref<OverviewStats | null>(null);

/* ===================== 拓扑图逻辑 ===================== */

// 图表 DOM 引用与 ECharts 实例
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 原始全量数据与搜索条件
const rawTopologyData = ref<TopologyData | null>(null);
const searchQuery = ref('');

// 抽屉相关状态
const drawerVisible = ref(false);
const drawerType = ref<'node' | 'edge'>('node');
const drawerTitle = ref('');
const drawerNodeData = ref<any>(null);
const drawerEdgeData = ref<any>(null);

/**
 * 基于 HSL 色环为每个节点生成独立颜色
 * 在色环上均匀取点，使用黄金角（137.5°）分布，避免相邻节点颜色过于接近
 */
function generateNodeColor(index: number, total: number): string {
  // 使用黄金角分布让相邻索引的颜色差异最大化
  const hue = (index * 137.508) % 360;
  return `hsl(${Math.round(hue)}, 45%, 55%)`;
}

/**
 * 根据拓扑数据构建 ECharts 配置项
 * 核心逻辑：将 mock 层返回的 nodes / links / categories 转换为完整的 ECharts Graph option
 */
function buildChartOption(topology: TopologyData): echarts.EChartsOption {
  // 计算节点大小范围：度数越大，节点越大
  const maxDegree = Math.max(...topology.nodes.map((n) => n.value), 1);
  const minSize = 12;
  const maxSize = 35;

  // 计算连线粗细范围
  const maxWeight = Math.max(...topology.links.map((l) => l.value), 1);

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      // 悬浮时仅展示简要信息，点击后详情通过抽屉展示
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const nodeCode = params.name;
          const asCallerCount = topology.links.filter((l) => l.source === nodeCode).length;
          const asCalleeCount = topology.links.filter((l) => l.target === nodeCode).length;
          return `<div style="font-weight:600;font-size:14px;margin-bottom:4px">${params.data.displayName || nodeCode}</div>`
            + `<div style="color:#64748b;font-size:12px">应用编码：${nodeCode}</div>`
            + `<div style="color:#64748b;font-size:12px">作为调用方：${asCallerCount} 个服务 | 作为被调用方：${asCalleeCount} 个服务</div>`;
        }
        if (params.dataType === 'edge') {
          const linkData = params.data;
          const sourceLabel = topology.nodes.find((n) => n.name === linkData.source)?.label || linkData.source;
          const targetLabel = topology.nodes.find((n) => n.name === linkData.target)?.label || linkData.target;
          return `<div style="font-weight:600;font-size:14px;margin-bottom:4px">${sourceLabel} → ${targetLabel}</div>`
            + `<div style="color:#64748b;font-size:12px">授权 API 数量：${linkData.apiDetails?.length || 0} 个</div>`;
        }
        return '';
      }
    },
    // 节点数量较多时隐藏图例，避免界面拥挤
    legend: { show: false },
    // 动画配置
    animationDuration: 1200,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'API 授权拓扑',
        type: 'graph',
        layout: 'force',
        // 增加初始缩放比例，使全貌可见
        zoom: 0.6,
        // 力导向布局参数：调小斥力和边长，增加引力，让所有节点尽量聚集在视野中心
        force: {
          repulsion: 150,
          gravity: 0.1,
          edgeLength: [80, 160],
          friction: 0.6,
          layoutAnimation: false // 禁用动画，使得图表在渲染后直接处于静止状态
        },
        roam: true,         // 启用平移和缩放
        draggable: true,    // 节点可拖拽
        // 节点数据
        data: topology.nodes.map((node) => ({
          name: node.name,
          displayName: node.label,
          value: node.value,
          category: node.category,
          // 根据连接度数计算节点大小
          symbolSize: minSize + ((node.value / maxDegree) * (maxSize - minSize)),
          // 节点标签配置：所有节点都显示应用名
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
        // 连线数据
        links: topology.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
          apiPaths: link.apiPaths,
          apiDetails: link.apiDetails,
          lineStyle: {
            // 连线粗细根据授权 API 数量映射（最小 0.5px，最大 5px）
            width: 0.5 + (link.value / maxWeight) * 4.5,
            color: 'rgba(29, 78, 216, 0.3)',
            curveness: 0.2,    // 曲线弧度，避免双向线重叠
            opacity: 0.65
          }
        })),
        // 连线箭头：从调用方指向被调用方
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 7],
        // 分类定义：每个应用独立颜色，通过 HSL 色环均匀分布
        categories: topology.categories.map((cat, index) => ({
          name: cat.name,
          itemStyle: { color: generateNodeColor(index, topology.categories.length) }
        })),
        // 悬浮交互：聚焦当前节点的相邻节点和连线，其余变暗
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
  if (!chartInstance || !rawTopologyData.value) return;

  let displayData = rawTopologyData.value;
  const query = searchQuery.value.trim().toLowerCase();

  if (query) {
    // 1. 找到直接匹配的应用节点（通过应用名称或编码）
    const matchedNodes = new Set(
      displayData.nodes
        .filter((n) => n.name.toLowerCase().includes(query) || n.label.toLowerCase().includes(query))
        .map((n) => n.name)
    );

    // 2. 找到包含匹配 API 的连线，或者两端有匹配节点的连线
    const matchedLinks = displayData.links.filter((link) => {
      // 匹配 API 名称或路径
      const apiMatched = link.apiDetails?.some((api: any) =>
        api.name.toLowerCase().includes(query) || api.path.toLowerCase().includes(query)
      );
      const nodeMatched = matchedNodes.has(link.source) || matchedNodes.has(link.target);
      return apiMatched || nodeMatched;
    });

    // 3. 根据保留下来的连线反推需要保留的节点
    const keepNodeCodes = new Set<string>();
    matchedLinks.forEach((link) => {
      keepNodeCodes.add(link.source);
      keepNodeCodes.add(link.target);
    });

    // 将匹配到的孤立节点也保留进去
    matchedNodes.forEach((code) => keepNodeCodes.add(code));

    // 重新构造用于展示的数据
    displayData = {
      ...displayData,
      nodes: displayData.nodes.filter((n) => keepNodeCodes.has(n.name)),
      links: matchedLinks
    };
  }

  const option = buildChartOption(displayData);
  chartInstance.clear(); // 清空历史状态与内部坐标缓存，避免搜索后产生连线错位的 Bug
  chartInstance.setOption(option, { notMerge: true });
}

// 监听搜索输入（带防抖）
let searchTimeout: any;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    renderChart();
  }, 300);
});

/**
 * 加载拓扑图数据并渲染 ECharts
 */
async function loadTopology() {
  if (!chartInstance) return;
  chartInstance.showLoading({ text: '拓扑数据加载中...' });

  const { data: topologyData } = await fetchTopologyData();
  rawTopologyData.value = topologyData;
  chartInstance.hideLoading();

  renderChart();
}

/**
 * 构建节点抽屉数据：汇总该应用作为调用方和被调用方的所有授权关系
 */
function buildNodeDrawerData(nodeCode: string, displayName: string, topology: TopologyData) {
  // 该应用作为调用方：找出所有 source === nodeCode 的连线
  const callerLinks = topology.links.filter((l) => l.source === nodeCode);
  const callerList = callerLinks.map((l) => {
    const targetNode = topology.nodes.find((n) => n.name === l.target);
    return {
      appName: targetNode ? `${targetNode.label}（${l.target}）` : l.target,
      apiCount: l.value
    };
  });
  const callerApiTotal = callerLinks.reduce((sum, l) => sum + l.value, 0);

  // 该应用作为被调用方：找出所有 target === nodeCode 的连线
  const calleeLinks = topology.links.filter((l) => l.target === nodeCode);
  const calleeList = calleeLinks.map((l) => {
    const sourceNode = topology.nodes.find((n) => n.name === l.source);
    return {
      appName: sourceNode ? `${sourceNode.label}（${l.source}）` : l.source,
      apiCount: l.value
    };
  });
  const calleeApiTotal = calleeLinks.reduce((sum, l) => sum + l.value, 0);

  return {
    nodeCode,
    displayName,
    callerList,
    callerApiTotal,
    calleeList,
    calleeApiTotal
  };
}

/**
 * 初始化 ECharts 实例
 */
function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  // 点击节点或连线时打开右侧抽屉展示详情
  chartInstance.on('click', (params) => {
    if (!rawTopologyData.value) return;

    if (params.dataType === 'node') {
      const nodeCode = params.name;
      const displayName = (params.data as any)?.displayName || nodeCode;
      drawerType.value = 'node';
      drawerTitle.value = displayName;
      drawerNodeData.value = buildNodeDrawerData(nodeCode, displayName, rawTopologyData.value);
      drawerEdgeData.value = null;
      drawerVisible.value = true;
    } else if (params.dataType === 'edge') {
      const linkData = params.data as any;
      const sourceLabel = rawTopologyData.value.nodes.find((n) => n.name === linkData.source)?.label || linkData.source;
      const targetLabel = rawTopologyData.value.nodes.find((n) => n.name === linkData.target)?.label || linkData.target;
      drawerType.value = 'edge';
      drawerTitle.value = `${sourceLabel} → ${targetLabel}`;
      drawerEdgeData.value = {
        sourceName: `${sourceLabel}（${linkData.source}）`,
        targetName: `${targetLabel}（${linkData.target}）`,
        apiDetails: linkData.apiDetails || []
      };
      drawerNodeData.value = null;
      drawerVisible.value = true;
    }
  });

  // 监听画布背景（空白处）的点击事件，关闭抽屉
  chartInstance.getZr().on('click', (event) => {
    if (!event.target) {
      drawerVisible.value = false;
    }
  });

  loadTopology();
}

/**
 * 窗口大小变化时自适应图表尺寸
 */
function handleResize() {
  chartInstance?.resize();
}

/* ===================== 生命周期 ===================== */

onMounted(async () => {
  // 加载统计数据
  const { data: res } = await fetchDashboard();
  if (res) {
    stats.value = res.stats;
  }

  // 初始化拓扑图
  await nextTick();
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 销毁 ECharts 实例，防止内存泄漏
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<style scoped>
.full-height {
  height: calc(100vh - 54px); /* 减去外层 layout 的所有垂直 padding */
}

/* 拓扑图卡片样式 */
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

/* ECharts 容器 */
.topology-chart {
  width: 100%;
  height: calc(100vh - 140px); /* 给定绝对高度，避免 el-card 内部 flex 失效导致高度为 0 */
}

/* 抽屉内分区样式 */
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
