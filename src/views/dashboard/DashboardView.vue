<template>
  <div class="page-container">
    <div class="page-title">
      <h2>控制台概览</h2>
      <p>聚合展示当前服务治理资产规模、授权动态与最近调用态势。</p>
    </div>
    <div class="stat-grid">
      <el-card v-for="card in statCards" :key="card.label" class="panel-card" shadow="never">
        <div class="stat-card">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.tip }}</small>
        </div>
      </el-card>
    </div>
    <div class="summary-grid">
      <el-card class="panel-card" shadow="never">
        <h3 class="section-title">最近导入记录</h3>
        <el-timeline>
          <el-timeline-item v-for="item in dashboard?.imports" :key="item.id" :timestamp="item.time">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
      <el-card class="panel-card" shadow="never">
        <h3 class="section-title">最近权限变更记录</h3>
        <el-timeline>
          <el-timeline-item v-for="item in dashboard?.authChanges" :key="item.id" :timestamp="item.time" type="success">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
    <el-card class="panel-card" shadow="never">
      <h3 class="section-title">最近调用日志</h3>
      <el-table :data="dashboard?.recentLogs || []">
        <el-table-column prop="title" label="日志摘要" min-width="280" />
        <el-table-column prop="description" label="内容" min-width="320" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchDashboard } from '@/mock/dashboard';
import type { ActivityRecord, OverviewStats } from '@/types/business';

type DashboardData = {
  stats: OverviewStats;
  imports: ActivityRecord[];
  authChanges: ActivityRecord[];
  recentLogs: ActivityRecord[];
};

const dashboard = ref<DashboardData | null>(null);

const statCards = computed(() => {
  if (!dashboard.value) return [];
  const s = dashboard.value.stats;
  return [
    { label: 'API总数', value: s.apiCount, tip: '已纳管接口总量' },
    { label: '应用总数', value: s.appCount, tip: '被治理应用节点' },
    { label: '应用分组数', value: s.appGroupCount, tip: '调用方组织单元' },
    { label: 'API分组数', value: s.apiGroupCount, tip: '授权资源集合' },
    { label: '授权关系数', value: s.grantCount, tip: '有效授权配置' },
    { label: '今日远程调用次数', value: s.todayCalls.toLocaleString(), tip: '已进入鉴权链路' },
    { label: '今日鉴权失败次数', value: s.todayAuthFail, tip: '需重点排查失败流量' }
  ];
});

onMounted(async () => {
  const { data } = await fetchDashboard();
  dashboard.value = data;
});
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card span {
  color: var(--sg-subtext);
}

.stat-card strong {
  font-size: 30px;
}

.stat-card small,
.summary-grid p {
  color: var(--sg-subtext);
}
</style>
