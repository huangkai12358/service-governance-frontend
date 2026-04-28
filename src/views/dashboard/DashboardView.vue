<template>
  <div class="page-container dashboard-page">
    <div class="page-title">
      <h2>首页概览</h2>
      <p>展示服务治理平台的核心统计与最近动态，API授权拓扑图已拆分到独立页面。</p>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col v-for="item in statCards" :key="item.label" :xs="24" :sm="12" :lg="8" :xl="6">
        <el-card class="panel-card stat-card" shadow="never">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card class="panel-card activity-card" shadow="never">
          <template #header>
            <div class="card-header">最近导入</div>
          </template>
          <div v-if="imports.length" class="activity-list">
            <div v-for="item in imports" :key="item.id" class="activity-item">
              <div class="activity-title">{{ item.title }}</div>
              <div class="activity-desc">{{ item.description }}</div>
              <div class="activity-time">{{ item.time }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="72" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="panel-card activity-card" shadow="never">
          <template #header>
            <div class="card-header">最近授权变更</div>
          </template>
          <div v-if="auths.length" class="activity-list">
            <div v-for="item in auths" :key="item.id" class="activity-item">
              <div class="activity-title">{{ item.title }}</div>
              <div class="activity-desc">{{ item.description }}</div>
              <div class="activity-time">{{ item.time }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="72" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="panel-card activity-card" shadow="never">
          <template #header>
            <div class="card-header">最近调用决策</div>
          </template>
          <div v-if="calls.length" class="activity-list">
            <div v-for="item in calls" :key="item.id" class="activity-item">
              <div class="activity-title">{{ item.title }}</div>
              <div class="activity-desc">{{ item.description }}</div>
              <div class="activity-time">{{ item.time }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="72" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchDashboard } from '@/mock/dashboard';
import type { ActivityRecord, OverviewStats } from '@/types/business';

const stats = ref<OverviewStats | null>(null);
const imports = ref<ActivityRecord[]>([]);
const auths = ref<ActivityRecord[]>([]);
const calls = ref<ActivityRecord[]>([]);

const statCards = computed(() => [
  { label: '应用总数', value: stats.value?.app_total ?? 0 },
  { label: 'API总数', value: stats.value?.api_total ?? 0 },
  { label: 'API分组总数', value: stats.value?.api_group_total ?? 0 },
  { label: '授权关系总数', value: stats.value?.auth_relation_total ?? 0 },
  { label: 'SmartDoc导入次数', value: stats.value?.smartdoc_import_total ?? 0 },
  { label: '今日调用记录', value: stats.value?.today_call_total ?? 0 }
]);

onMounted(async () => {
  const { data } = await fetchDashboard();
  stats.value = data.stats;
  imports.value = data.imports;
  auths.value = data.auths;
  calls.value = data.calls;
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  row-gap: 16px;
}

.stat-card {
  min-height: 116px;
}

.stat-label {
  color: var(--sg-text-secondary);
  font-size: 14px;
}

.stat-value {
  margin-top: 14px;
  color: var(--sg-text);
  font-size: 30px;
  font-weight: 700;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--sg-text);
}

.activity-card {
  height: 100%;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  padding: 14px 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  background: #f8fafc;
}

.activity-title {
  color: var(--sg-text);
  font-weight: 600;
}

.activity-desc {
  margin-top: 6px;
  color: var(--sg-text-secondary);
  line-height: 1.6;
}

.activity-time {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}
</style>
