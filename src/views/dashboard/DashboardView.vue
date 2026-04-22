<template>
  <div class="page-container">
    <div class="page-title">
      <h2>首页</h2>
      <p>服务治理管理平台概览，聚合展示 API、APP、分组、授权和导入动态。</p>
    </div>
    <div class="stat-grid">
      <el-card v-for="item in cards" :key="item.label" class="panel-card" shadow="never">
        <div class="stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.tip }}</small>
        </div>
      </el-card>
    </div>
    <div class="summary-grid">
      <el-card class="panel-card" shadow="never">
        <h3 class="section-title">最近 SmartDoc 导入</h3>
        <el-timeline>
          <el-timeline-item v-for="item in data?.imports" :key="item.id" :timestamp="item.time">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
      <el-card class="panel-card" shadow="never">
        <h3 class="section-title">最近权限变更</h3>
        <el-timeline>
          <el-timeline-item v-for="item in data?.auths" :key="item.id" :timestamp="item.time">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
    <el-card class="panel-card" shadow="never">
      <h3 class="section-title">最近远程调用记录</h3>
      <el-table :data="data?.calls || []" border>
        <el-table-column prop="title" label="摘要" min-width="260" />
        <el-table-column prop="description" label="描述" min-width="320" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ActivityRecord, OverviewStats } from '@/types/business';
import { fetchDashboard } from '@/mock/dashboard';

type DashboardData = {
  stats: OverviewStats;
  imports: ActivityRecord[];
  auths: ActivityRecord[];
  calls: ActivityRecord[];
};

const data = ref<DashboardData | null>(null);

const cards = computed(() => {
  if (!data.value) return [];
  const stats = data.value.stats;
  return [
    { label: 'API总数', value: stats.api_total, tip: '已纳管 API 资产' },
    { label: 'APP总数', value: stats.app_total, tip: '已纳管应用' },
    { label: 'API分组数', value: stats.api_group_total, tip: 'API 分组资源集合' },
    { label: 'APP分组数', value: stats.app_group_total, tip: 'APP 分组资源集合' },
    { label: '授权关系数', value: stats.auth_relation_total, tip: '单应用授权关系' },
    { label: 'SmartDoc导入次数', value: stats.smartdoc_import_total, tip: '历史导入次数' },
    { label: '今日远程调用数', value: stats.today_call_total, tip: '进入鉴权链路的调用' }
  ];
});

onMounted(async () => {
  const { data: res } = await fetchDashboard();
  data.value = res;
});
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card span,
.stat-card small,
.summary-grid p {
  color: var(--sg-subtext);
}

.stat-card strong {
  font-size: 28px;
}
</style>
