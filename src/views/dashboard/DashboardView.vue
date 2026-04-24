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
      // 允许鼠标进入 tooltip 内容区（方便查看长 API 列表）
      enterable: true,
      confine: true,
      extraCssText: 'max-width: 420px; max-height: 320px; overflow-y: auto; white-space: normal;',
      /**
       * Tooltip 内容格式化：
       * - 节点：显示应用名、编码、作为调用方/被调用方的授权详情
       * - 连线：显示调用方→被调用方、授权 API 数量、具体 API 路径列表
       */
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const nodeCode = params.name;
          // 统计该节点作为调用方和被调用方的连线数
          const asCallerCount = topology.links.filter((l) => l.source === nodeCode).length;
          const asCalleeCount = topology.links.filter((l) => l.target === nodeCode).length;
          const asCallerApiCount = topology.links.filter((l) => l.source === nodeCode).reduce((sum, l) => sum + l.value, 0);
          const asCalleeApiCount = topology.links.filter((l) => l.target === nodeCode).reduce((sum, l) => sum + l.value, 0);
          return `<div style="font-weight:600;font-size:14px;margin-bottom:6px">${params.data.displayName || nodeCode}</div>`
            + `<div style="color:#64748b;font-size:12px;margin-bottom:2px">应用编码：<span style="color:#374151">${nodeCode}</span></div>`
            + `<div style="color:#64748b;font-size:12px;margin-bottom:2px">作为调用方：调用 <strong style="color:#1d4ed8">${asCallerCount}</strong> 个应用，共 <strong style="color:#1d4ed8">${asCallerApiCount}</strong> 个 API</div>`
            + `<div style="color:#64748b;font-size:12px">作为被调用方：被 <strong style="color:#0f766e">${asCalleeCount}</strong> 个应用调用，共 <strong style="color:#0f766e">${asCalleeApiCount}</strong> 个 API</div>`;
        }
        if (params.dataType === 'edge') {
          const linkData = params.data;
          // 查找节点的显示名称
          const sourceLabel = topology.nodes.find((n) => n.name === linkData.source)?.label || linkData.source;
          const targetLabel = topology.nodes.find((n) => n.name === linkData.target)?.label || linkData.target;
          // 构建 API 详情列表的 HTML
          const apiDetails = linkData.apiDetails || [];
          const apiListHtml = apiDetails.length > 0
            ? apiDetails.map((api: any) => `<div style="font-size:12px;color:#374151;padding:2px 0;border-bottom:1px solid #f1f5f9">📄 ${api.name} <span style="color:#94a3b8">(${api.path})</span></div>`).join('')
            : '<div style="color:#94a3b8;font-size:12px">无具体 API 信息</div>';

          return `<div style="font-weight:600;margin-bottom:6px">${sourceLabel} → ${targetLabel}</div>`
            + `<div style="color:#64748b;font-size:12px;margin-bottom:8px">授权 API 数量：<strong style="color:#1d4ed8">${apiDetails.length}</strong></div>`
            + `<div style="font-size:12px;font-weight:600;margin-bottom:4px;color:#475569">授权 API 列表：</div>`
            + `<div style="max-height:200px;overflow-y:auto">${apiListHtml}</div>`;
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
          apiDetails: link.apiDetails, // 传递完整的 API 详情（包含名称和路径）给 Tooltip 使用
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
 * 初始化 ECharts 实例
 */
function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  // 实现点击固定 Tooltip 功能
  chartInstance.on('click', (params) => {
    if (params.dataType === 'node' || params.dataType === 'edge') {
      // 当点击节点或连线时，关闭鼠标移入移出的触发，强制永久显示当前内容
      chartInstance?.setOption({
        tooltip: {
          triggerOn: 'none',
          alwaysShowContent: true
        }
      });
      // 强制触发 Tooltip 显示在当前点击的元素上（通过鼠标坐标触发，避免 edge 的 dataIndex 被误认为 node）
      chartInstance?.dispatchAction({
        type: 'showTip',
        x: params.event?.offsetX,
        y: params.event?.offsetY
      });
    }
  });

  // 监听画布背景（空白处）的点击事件，取消固定状态
  chartInstance.getZr().on('click', (event) => {
    if (!event.target) {
      chartInstance?.setOption({
        tooltip: {
          triggerOn: 'mousemove|click',
          alwaysShowContent: false
        }
      });
      chartInstance?.dispatchAction({ type: 'hideTip' });
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
</style>
