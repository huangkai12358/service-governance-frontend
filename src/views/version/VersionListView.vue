<template>
  <div class="page-container">
    <div class="page-title">
      <h2>版本管理</h2>
      <p>查看 SmartDoc 导入形成的版本列表，支持差异详情与版本回滚。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="version" label="版本号" width="160" />
        <el-table-column prop="importedAt" label="导入时间" width="180" />
        <el-table-column prop="summary" label="变更摘要" min-width="260" />
        <el-table-column prop="changeCount" label="变更数量" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><StatusTag :value="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row.id)">查看详情</el-button>
            <el-button link type="primary" @click="showDetail(row.id)">查看差异</el-button>
            <el-button link type="danger" @click="rollback(row)">回滚到此版本</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="drawerVisible" title="版本详情" size="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号">{{ detail.base.version }}</el-descriptions-item>
          <el-descriptions-item label="导入时间">{{ detail.base.importedAt }}</el-descriptions-item>
          <el-descriptions-item label="状态"><StatusTag :value="detail.base.status" /></el-descriptions-item>
          <el-descriptions-item label="影响范围">{{ detail.base.scope }}</el-descriptions-item>
          <el-descriptions-item label="变更摘要" :span="2">{{ detail.base.summary }}</el-descriptions-item>
        </el-descriptions>
        <h3 class="section-title" style="margin-top:24px">变更清单</h3>
        <el-table :data="detail.changeList" border>
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="target" label="对象" width="180" />
          <el-table-column prop="detail" label="详情" min-width="260" />
        </el-table>
        <h3 class="section-title" style="margin-top:24px">回滚记录</h3>
        <VersionTimeline :items="detail.rollbackRecords" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StatusTag from '@/components/StatusTag.vue';
import VersionTimeline from '@/components/VersionTimeline.vue';
import { fetchVersionDetail, fetchVersionList, rollbackVersion } from '@/mock/version';

const list = ref<any[]>([]);
const detail = ref<any>(null);
const drawerVisible = ref(false);

async function loadData() {
  const { data } = await fetchVersionList();
  list.value = data;
}

async function showDetail(id: string) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  drawerVisible.value = true;
}

async function rollback(row: any) {
  await ElMessageBox.confirm(`确认回滚到版本 ${row.version} 吗？`, '回滚确认', { type: 'warning' });
  const { message } = await rollbackVersion(row.id);
  ElMessage.success(message);
}

onMounted(loadData);
</script>
