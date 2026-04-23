<template>
  <div class="page-container">
    <div class="page-title">
      <h2>历史版本管理</h2>
      <p>按应用编码、应用名称和版本号查询历史版本，并支持回滚预览。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
      <el-form-item label="版本号"><el-input v-model="query.version" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <el-table :data="pagedList" border>
        <el-table-column prop="app_code" label="应用编码" width="160" />
        <el-table-column prop="app_name" label="应用名称" width="140" />
        <el-table-column prop="app_description" label="应用说明" min-width="220" />
        <el-table-column prop="version" label="版本号" width="140" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row.id)">详情</el-button>
            <el-button link type="danger" @click="showRollback(row.id)">回滚</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="list.length"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-drawer v-model="detailVisible" title="版本详情" size="680px">
      <el-table v-if="detail" :data="detail.apis" border>
        <el-table-column prop="api_name" label="API 名称" min-width="160" />
        <el-table-column prop="api_path" label="请求路径" min-width="240" />
        <el-table-column prop="api_method" label="请求方法" width="110" />
      </el-table>
    </el-drawer>

    <el-dialog v-model="rollbackVisible" title="回滚预览" width="min(1100px, calc(100vw - 32px))" class="rollback-dialog">
      <div v-if="detail" class="rollback-grid">
        <div class="rollback-block">
          <h3 class="section-title">新增 API</h3>
          <el-table :data="detail.rollback_preview.additions" border class="rollback-table">
            <el-table-column prop="api_name" label="API 名称" min-width="180" />
            <el-table-column prop="api_path" label="请求路径" min-width="260" />
          </el-table>
        </div>
        <div class="rollback-block">
          <h3 class="section-title">修改 API</h3>
          <el-table :data="detail.rollback_preview.modifications" border class="rollback-table">
            <el-table-column label="API 名称" min-width="140">
              <template #default="{ row }">{{ row.after.api_name }}</template>
            </el-table-column>
            <el-table-column label="请求路径" min-width="180">
              <template #default="{ row }">{{ row.after.api_path }}</template>
            </el-table-column>
            <el-table-column label="变化字段" min-width="120">
              <template #default="{ row }">{{ row.changed_fields.join('、') }}</template>
            </el-table-column>
            <el-table-column label="变更前" min-width="220">
              <template #default="{ row }">{{ row.before.api_name }} / {{ row.before.api_method }} / {{ row.before.api_description }}</template>
            </el-table-column>
            <el-table-column label="变更后" min-width="220">
              <template #default="{ row }">{{ row.after.api_name }} / {{ row.after.api_method }} / {{ row.after.api_description }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div class="rollback-block">
          <h3 class="section-title">删除 API</h3>
          <el-table :data="detail.rollback_preview.deletions" border class="rollback-table">
            <el-table-column prop="api_name" label="API 名称" min-width="180" />
            <el-table-column prop="api_path" label="请求路径" min-width="260" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="rollbackVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRollback">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { fetchVersionDetail, fetchVersionList, rollbackVersion } from '@/mock/version';

const query = reactive({ app_code: '', app_name: '', version: '' });
const list = ref<any[]>([]);
const detail = ref<any>(null);
const detailVisible = ref(false);
const rollbackVisible = ref(false);
const pagination = reactive({ page: 1, pageSize: 10 });

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchVersionList(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { app_code: '', app_name: '', version: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

async function showDetail(id: string) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  detailVisible.value = true;
}

async function showRollback(id: string) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  rollbackVisible.value = true;
}

async function confirmRollback() {
  const { message } = await rollbackVersion();
  ElMessage.success(message);
  rollbackVisible.value = false;
}

onMounted(loadData);
</script>

<style scoped>
.rollback-grid {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.rollback-block {
  min-width: 0;
}

.rollback-table {
  width: 100%;
}

.rollback-dialog :deep(.el-dialog) {
  max-width: calc(100vw - 32px);
}

.rollback-dialog :deep(.el-dialog__body) {
  overflow-x: hidden;
}

.rollback-dialog :deep(.rollback-table .cell) {
  white-space: normal;
  word-break: break-word;
}
</style>
