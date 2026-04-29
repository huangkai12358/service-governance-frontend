<template>
  <div class="page-container dashboard-page">
    <div class="page-title">
      <h2>首页概览</h2>
      <p>展示服务治理平台的核心统计与最近动态，API授权拓扑图已拆分到独立页面。</p>
    </div>

    <el-card class="panel-card auth-settings-card" shadow="never">
      <div class="auth-settings-content">
        <div class="auth-settings-main">
          <div class="card-header">鉴权服务设置</div>
          <div class="auth-mode-row">
            <el-tag :type="authModeTagType">{{ authModeLabel }}</el-tag>
            <span class="auth-mode-desc">{{ authModeDescription }}</span>
          </div>
          <div class="auth-update-time">最后更新时间：{{ authSettings?.updated_at || '-' }}</div>
        </div>

        <div class="auth-switches">
          <label class="mode-option" :class="{ active: isEnabledMode }">
            <div class="switch-copy">
              <div class="switch-title">开启鉴权</div>
              <div class="switch-desc">请求将按照授权关系进行正常鉴权</div>
            </div>
            <el-checkbox
              :model-value="isEnabledMode"
              :disabled="updating"
              @change="handleModeChange('ENABLED')"
            />
          </label>

          <label class="mode-option" :class="{ active: isBypassMode }">
            <div class="switch-copy">
              <div class="switch-title">BYPASS</div>
              <div class="switch-desc">默认放开，请求将直接放行，不执行拦截决策</div>
            </div>
            <el-checkbox
              :model-value="isBypassMode"
              :disabled="updating"
              @change="handleModeChange('BYPASS')"
            />
          </label>
        </div>
      </div>
    </el-card>

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
import { ElMessage } from 'element-plus';
import { fetchDashboard, updateAuthServiceSettings } from '@/mock/dashboard';
import type { ActivityRecord, AuthServiceSettings, OverviewStats } from '@/types/business';

const stats = ref<OverviewStats | null>(null);
const authSettings = ref<AuthServiceSettings | null>(null);
const imports = ref<ActivityRecord[]>([]);
const auths = ref<ActivityRecord[]>([]);
const calls = ref<ActivityRecord[]>([]);
const updating = ref(false);

const statCards = computed(() => [
  { label: '应用总数', value: stats.value?.app_total ?? 0 },
  { label: 'API总数', value: stats.value?.api_total ?? 0 },
  { label: 'API分组总数', value: stats.value?.api_group_total ?? 0 },
  { label: '授权关系总数', value: stats.value?.auth_relation_total ?? 0 },
  { label: 'SmartDoc导入次数', value: stats.value?.smartdoc_import_total ?? 0 },
  { label: '今日调用记录', value: stats.value?.today_call_total ?? 0 }
]);

const isEnabledMode = computed(() => authSettings.value?.mode === 'ENABLED');
const isBypassMode = computed(() => authSettings.value?.mode === 'BYPASS');

const authModeLabel = computed(() => {
  return isBypassMode.value ? 'BYPASS 放行' : '正常鉴权';
});

const authModeDescription = computed(() => {
  return isBypassMode.value
    ? '当前模式为默认放开，请求会直接放行，不执行拦截决策。'
    : '当前模式为开启鉴权，请求将按照授权关系进行正常鉴权。';
});

const authModeTagType = computed(() => (isBypassMode.value ? 'warning' : 'success'));

async function syncAuthSettings(nextMode: AuthServiceSettings['mode'], successMessage: string) {
  updating.value = true;
  try {
    const { data, message } = await updateAuthServiceSettings({ mode: nextMode });
    authSettings.value = data;
    ElMessage.success(successMessage || message);
  } finally {
    updating.value = false;
  }
}

async function handleModeChange(nextMode: AuthServiceSettings['mode']) {
  if (authSettings.value?.mode === nextMode) {
    return;
  }
  // 中文注释：两个选择框是互斥关系，切换时直接覆盖为目标模式，确保同一时刻只能选中一个。
  await syncAuthSettings(nextMode, nextMode === 'BYPASS' ? 'BYPASS 已开启' : '正常鉴权已开启');
}

onMounted(async () => {
  const { data } = await fetchDashboard();
  stats.value = data.stats;
  authSettings.value = data.auth_service_settings;
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

.auth-settings-card {
  overflow: hidden;
}

.auth-settings-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.auth-settings-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.auth-mode-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.auth-mode-desc {
  color: var(--sg-text-secondary);
  line-height: 1.7;
}

.auth-update-time {
  color: #94a3b8;
  font-size: 12px;
}

.auth-switches {
  display: flex;
  min-width: 420px;
  flex-direction: column;
  gap: 16px;
}

.mode-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.mode-option.active {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.12);
}

.switch-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.switch-title {
  color: var(--sg-text);
  font-weight: 600;
}

.switch-desc {
  color: var(--sg-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mode-option :deep(.el-checkbox) {
  height: auto;
}

.mode-option :deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border-radius: 4px;
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

@media (max-width: 1200px) {
  .auth-settings-content {
    flex-direction: column;
  }

  .auth-switches {
    min-width: 0;
    width: 100%;
  }
}
</style>
