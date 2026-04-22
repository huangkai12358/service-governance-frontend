<template>
  <div class="page-container">
    <div class="page-title">
      <h2>授权管理</h2>
      <p>按调用方、被调用应用和资源维度配置授权，支持批量授权与批量撤销。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <div class="auth-layout">
        <div class="auth-column">
          <h3 class="section-title">调用方选择</h3>
          <el-radio-group v-model="callerId" class="column-list">
            <el-radio v-for="item in panel?.callers" :key="item.id" :label="item.id">
              {{ item.name }} <el-tag size="small" style="margin-left:8px">{{ item.type === 'APP' ? '应用' : '应用组' }}</el-tag>
            </el-radio>
          </el-radio-group>
        </div>
        <div class="auth-column">
          <h3 class="section-title">被调用方应用</h3>
          <el-radio-group v-model="calleeId" class="column-list">
            <el-radio v-for="item in panel?.callees" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
          </el-radio-group>
        </div>
        <div class="auth-column wide">
          <div class="resource-header">
            <h3 class="section-title">可授权资源</h3>
            <el-segmented v-model="grantMode" :options="grantOptions" />
          </div>
          <el-tree
            ref="treeRef"
            show-checkbox
            node-key="id"
            :data="grantMode === 'api' ? panel?.apiTree || [] : panel?.groupTree || []"
            default-expand-all
          />
        </div>
      </div>
      <div class="table-toolbar" style="margin-top: 20px">
        <div class="right-actions">
          <el-button type="primary" @click="saveGrant">批量授权</el-button>
          <el-button type="danger" plain @click="revokeGrant">批量撤销</el-button>
        </div>
      </div>
      <el-table :data="panel?.selectedGrants || []" border>
        <el-table-column prop="callerName" label="调用方" min-width="140" />
        <el-table-column prop="calleeAppName" label="被调用方" min-width="140" />
        <el-table-column prop="resourceName" label="授权资源" min-width="160" />
        <el-table-column prop="resourceType" label="资源类型" width="100" />
        <el-table-column prop="time" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ElTree } from 'element-plus';
import { fetchAuthorizationPanel, revokeAuthorization, saveAuthorization } from '@/mock/auth';

const panel = ref<any>(null);
const treeRef = ref<InstanceType<typeof ElTree>>();
const callerId = ref('');
const calleeId = ref('');
const grantMode = ref<'api' | 'group'>('api');
const grantOptions = [
  { label: '按API授权', value: 'api' },
  { label: '按API分组授权', value: 'group' }
];

async function loadData() {
  const { data } = await fetchAuthorizationPanel();
  panel.value = data;
  callerId.value = data.callers[0]?.id;
  calleeId.value = data.callees[0]?.id;
}

async function saveGrant() {
  const checked = treeRef.value?.getCheckedKeys() || [];
  if (!checked.length) {
    ElMessage.warning('请先选择可授权资源');
    return;
  }
  const { message } = await saveAuthorization();
  ElMessage.success(message);
}

async function revokeGrant() {
  await ElMessageBox.confirm('确认撤销当前勾选的授权关系吗？', '撤销确认', { type: 'warning' });
  const { message } = await revokeAuthorization();
  ElMessage.success(message);
}

onMounted(loadData);
</script>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: 280px 280px 1fr;
  gap: 16px;
}

.auth-column {
  min-height: 360px;
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 14px;
}

.wide {
  overflow: auto;
}

.column-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
