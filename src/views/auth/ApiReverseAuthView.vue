<template>
  <div class="page-container">
    <div class="page-title">
      <h2>API 反向授权</h2>
      <p>按 API 资源反向分配调用方应用。适合将新增 API 批量授权给指定应用。</p>
    </div>

    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="所属应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="所属应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
      <el-form-item label="API 名称"><el-input v-model="query.api_name" clearable /></el-form-item>
      <el-form-item label="请求路径"><el-input v-model="query.api_path" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" :disabled="!selectedRows.length" @click="openBatchEditor">批量授权</el-button>
        <span class="toolbar-tip">已选择 {{ selectedRows.length }} 个 API</span>
      </div>

      <el-table
        ref="tableRef"
        :data="pagedList"
        :row-key="getRowKey"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="52" reserve-selection />
        <el-table-column prop="app_code" label="所属应用编码" width="170" />
        <el-table-column prop="app_name" label="所属应用名称" width="190" />
        <el-table-column prop="api_name" label="API 名称" min-width="180" />
        <el-table-column prop="api_path" label="请求路径" min-width="280" show-overflow-tooltip />
        <el-table-column prop="api_method" label="请求方法" width="100" />
        <el-table-column prop="authorized_app_count" label="已授权应用数" width="120" align="center" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openRowEditor(row)">授权</el-button>
            <el-button link @click="openDetailDrawer(row)">已授权应用</el-button>
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

    <el-dialog v-model="visible" title="API 反向授权" width="1180px">
      <div v-if="editorData" class="reverse-editor">
        <div class="editor-column">
          <h3 class="section-title">已选 API</h3>
          <el-table :data="editorData.selected_apis" border size="small" max-height="440">
            <el-table-column prop="app_code" label="所属应用编码" width="140" />
            <el-table-column prop="api_name" label="API 名称" min-width="160" />
            <el-table-column prop="api_path" label="请求路径" min-width="240" show-overflow-tooltip />
            <el-table-column prop="api_method" label="请求方法" width="100" />
          </el-table>
        </div>

        <div class="editor-column">
          <h3 class="section-title">授权给应用</h3>
          <el-input v-model="targetKeyword" clearable placeholder="搜索应用编码或应用名称" />
          <el-checkbox-group v-model="checkedAppCodes" class="target-checkbox-list">
            <el-checkbox v-for="item in filteredApps" :key="item.app_code" :label="item.app_code">
              <span class="option-title">{{ item.app_name }}</span>
              <span class="option-subtitle">{{ item.app_code }}</span>
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="editor-column">
          <h3 class="section-title">变更预览</h3>
          <div class="change-summary">
            <span>总计</span>
            <el-tag>共 {{ checkedAppCodes.length }} 个应用</el-tag>
            <el-tag type="success">新增 {{ addedApps.length }} 个</el-tag>
            <el-tag type="warning">撤销 {{ revokedApps.length }} 个</el-tag>
          </div>

          <div class="change-section">
            <div class="change-section-title success-title">新增授权</div>
            <div class="change-tags">
              <el-tag v-for="item in addedApps" :key="item.app_code" type="success">
                {{ item.app_name }}（{{ item.app_code }}）
              </el-tag>
              <span v-if="!addedApps.length" class="empty-text">无新增授权</span>
            </div>
          </div>

          <div class="change-section">
            <div class="change-section-title warning-title">撤销授权</div>
            <div class="change-tags">
              <el-tag v-for="item in revokedApps" :key="item.app_code" type="warning">
                {{ item.app_name }}（{{ item.app_code }}）
              </el-tag>
              <span v-if="!revokedApps.length" class="empty-text">无撤销授权</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="已授权应用" size="640px">
      <template v-if="detailData">
        <el-descriptions :column="2" border class="detail-summary">
          <el-descriptions-item label="所属应用编码">{{ detailData.api.app_code }}</el-descriptions-item>
          <el-descriptions-item label="所属应用名称">{{ detailData.api.app_name }}</el-descriptions-item>
          <el-descriptions-item label="API 名称">{{ detailData.api.api_name }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ detailData.api.api_method }}</el-descriptions-item>
          <el-descriptions-item label="请求路径" :span="2">{{ detailData.api.api_path }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="detailData.apps" border size="small">
          <el-table-column prop="app_code" label="应用编码" width="180" />
          <el-table-column prop="app_name" label="应用名称" min-width="180" />
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { ElTable } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import {
  fetchReverseAuthApiList,
  fetchReverseAuthEditor,
  fetchReverseAuthorizedTargetDetail,
  saveReverseAuthorization
} from '@/mock/auth';
import type { ReverseAuthorizedTargetDetail, ReverseAuthEditorData, ReverseAuthListItem } from '@/types/business';

const route = useRoute();
const query = reactive({ app_code: '', app_name: '', api_name: '', api_path: '' });
const list = ref<ReverseAuthListItem[]>([]);
const selectedRows = ref<ReverseAuthListItem[]>([]);
const selectedRowMap = ref(new Map<number, ReverseAuthListItem>());
const tableRef = ref<InstanceType<typeof ElTable>>();
const visible = ref(false);
const detailVisible = ref(false);
const editorData = ref<ReverseAuthEditorData | null>(null);
const detailData = ref<ReverseAuthorizedTargetDetail | null>(null);
const pagination = reactive({ page: 1, pageSize: 10 });
const targetKeyword = ref('');
const checkedAppCodes = ref<string[]>([]);
const originalAppCodes = ref<string[]>([]);
const isResettingSelection = ref(false);

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

const filteredApps = computed(() => {
  const keyword = targetKeyword.value.trim();
  return (editorData.value?.apps || []).filter((item) => !keyword || item.app_code.includes(keyword) || item.app_name.includes(keyword));
});

const appMap = computed(() => new Map((editorData.value?.apps || []).map((item) => [item.app_code, item])));
const addedApps = computed(() => checkedAppCodes.value.filter((code) => !originalAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));
const revokedApps = computed(() => originalAppCodes.value.filter((code) => !checkedAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));

async function loadData() {
  const { data } = await fetchReverseAuthApiList(query);
  list.value = data;
  const visibleIds = new Set(data.map((item) => item.api_id));
  Array.from(selectedRowMap.value.keys()).forEach((id) => {
    if (!visibleIds.has(id)) {
      selectedRowMap.value.delete(id);
    }
  });
  syncSelectedRows();
}

function resetQuery() {
  isResettingSelection.value = true;
  Object.assign(query, { app_code: '', app_name: '', api_name: '', api_path: '' });
  pagination.page = 1;
  selectedRowMap.value.clear();
  selectedRows.value = [];
  tableRef.value?.clearSelection();
  loadData();
  nextTick(() => {
    isResettingSelection.value = false;
  });
}

function handleSelectionChange(rows: ReverseAuthListItem[]) {
  if (isResettingSelection.value) {
    return;
  }
  const currentPageIds = new Set(pagedList.value.map((item) => item.api_id));
  currentPageIds.forEach((id) => selectedRowMap.value.delete(id));

  if (!rows.length) {
    syncSelectedRows();
    return;
  }

  const existingBaseAppCode = selectedRows.value[0]?.app_code;
  const baseAppCode = existingBaseAppCode || rows[0].app_code;
  const validRows = rows.filter((item) => item.app_code === baseAppCode);

  if (validRows.length !== rows.length) {
    ElMessage.warning('批量授权只允许选择同一个被调用应用下的 API');
    nextTick(() => {
      rows.filter((item) => item.app_code !== baseAppCode).forEach((item) => tableRef.value?.toggleRowSelection(item, false));
    });
  }

  validRows.forEach((item) => selectedRowMap.value.set(item.api_id, item));
  syncSelectedRows();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

function getRowKey(row: ReverseAuthListItem) {
  return row.api_id;
}

function syncSelectedRows() {
  selectedRows.value = Array.from(selectedRowMap.value.values());
}

function restorePageSelection() {
  nextTick(() => {
    pagedList.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, selectedRowMap.value.has(row.api_id));
    });
  });
}

async function openEditor(apiIds: number[], preserveExisting = true) {
  const { data } = await fetchReverseAuthEditor(apiIds);
  editorData.value = data;
  checkedAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  originalAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  targetKeyword.value = '';
  visible.value = true;
}

async function openBatchEditor() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择至少一个 API');
    return;
  }
  await openEditor(selectedRows.value.map((item) => item.api_id), false);
}

async function openRowEditor(row: ReverseAuthListItem) {
  await openEditor([row.api_id], true);
}

async function openDetailDrawer(row: ReverseAuthListItem) {
  const { data } = await fetchReverseAuthorizedTargetDetail(row.api_id);
  detailData.value = data;
  detailVisible.value = true;
}

async function submit() {
  const { message } = await saveReverseAuthorization();
  ElMessage.success(message);
  visible.value = false;
}

async function tryOpenFromRoute() {
  const idsParam = route.query.api_ids;
  const appCodeParam = route.query.app_code;
  if (typeof appCodeParam === 'string' && appCodeParam) {
    query.app_code = appCodeParam;
  }
  if (typeof idsParam !== 'string' || !idsParam) return;
  const ids = idsParam.split(',').map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  if (!ids.length) return;
  await openEditor(ids);
}

onMounted(async () => {
  await loadData();
  await tryOpenFromRoute();
});

watch(() => route.fullPath, async () => {
  await loadData();
  await tryOpenFromRoute();
});

watch(
  () => [pagination.page, pagination.pageSize, pagedList.value.length],
  () => {
    restorePageSelection();
  }
);
</script>

<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.toolbar-tip {
  color: var(--sg-subtext);
  font-size: 13px;
}

.reverse-editor {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.92fr;
  gap: 16px;
}

.editor-column {
  min-height: 360px;
  max-height: 540px;
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  margin: 0;
  color: var(--sg-text);
  font-size: 15px;
  font-weight: 700;
}

.target-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.target-checkbox-list :deep(.el-checkbox) {
  height: auto;
  align-items: flex-start;
  margin-right: 0;
  padding: 6px 0;
}

.option-title {
  display: block;
  color: var(--sg-text);
  font-weight: 600;
}

.option-subtitle {
  display: block;
  color: var(--sg-subtext);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.change-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: #f1f5f9;
  color: var(--sg-text);
  font-weight: 600;
}

.change-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.change-section-title {
  font-size: 13px;
  font-weight: 700;
}

.success-title {
  color: #16a34a;
}

.warning-title {
  color: #d97706;
}

.change-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  min-height: 96px;
  max-height: 170px;
  overflow: auto;
  padding: 10px;
  border-radius: 10px;
  background: #f8fafc;
}

.empty-text {
  color: var(--sg-subtext);
}

.detail-summary {
  margin-bottom: 20px;
}
</style>
