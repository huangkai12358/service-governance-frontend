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
        <el-alert
          v-if="isImportedEditor && pendingFlowVisible"
          class="dialog-pending-alert"
          type="success"
          :closable="false"
          show-icon
        >
          <template #title>
            完成 {{ completedImportedCount }} 个 API 的授权，剩余 {{ pendingImportedIds.length }} 个 API 待处理
          </template>
        </el-alert>

        <div class="editor-grid">
          <div class="editor-column">
            <div class="section-head">
              <h3 class="section-title">{{ isImportedEditor ? 'API 列表' : '已选 API' }}</h3>
              <span v-if="isImportedEditor" class="section-meta">本次处理 {{ checkedApiIds.length }} 个，剩余 {{ remainingAfterCurrentCount }} 个</span>
            </div>
            <template v-if="isSingleEditor">
              <div class="single-api-box">
                <div class="option-title">{{ editorData.selected_apis[0]?.api_name }}</div>
                <div class="option-subtitle">{{ editorData.selected_apis[0]?.api_path }}</div>
              </div>
            </template>
            <template v-else-if="isBatchEditor">
              <div class="selected-api-list">
                <div v-for="item in editorData.selected_apis" :key="item.id" class="selected-api-item">
                  <div class="option-title">{{ item.api_name }}</div>
                  <div class="option-subtitle">{{ item.api_path }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <el-input v-model="apiKeyword" clearable placeholder="搜索 API 名称或请求路径" />
              <div class="quick-actions">
                <el-checkbox :model-value="allVisibleApisChecked" :indeterminate="someVisibleApisChecked" @change="toggleAllVisibleApis">
                  全选
                </el-checkbox>
                <el-button link type="primary" @click="clearVisibleApis">全不选</el-button>
              </div>
              <el-checkbox-group v-model="checkedApiIds" class="api-checkbox-list">
                <el-checkbox v-for="item in filteredSelectedApis" :key="item.id" :label="item.id">
                  <span class="option-title">{{ item.api_name }}</span>
                  <span class="option-subtitle">{{ item.api_path }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!filteredSelectedApis.length" class="empty-text">没有匹配的 API</div>
            </template>
          </div>

          <div class="editor-column">
            <div class="section-head">
              <h3 class="section-title">授权给应用</h3>
              <span class="section-meta">已选 {{ checkedAppCodes.length }} 个</span>
            </div>
            <el-input v-model="targetKeyword" clearable placeholder="搜索应用编码或应用名称" />
            <div class="quick-actions">
              <el-checkbox :model-value="allVisibleAppsChecked" :indeterminate="someVisibleAppsChecked" @change="toggleAllVisibleApps">
                全选
              </el-checkbox>
              <el-button link type="primary" @click="clearVisibleApps">全不选</el-button>
            </div>
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
              <el-tag v-if="!isSingleEditor" type="info">本次处理 {{ checkedApiIds.length }} 个 API</el-tag>
              <el-tag type="success">新增 {{ addedApps.length }} 个</el-tag>
              <el-tag v-if="isSingleEditor" type="warning">撤销 {{ revokedApps.length }} 个</el-tag>
            </div>

            <div v-if="!isSingleEditor" class="change-section">
              <div class="change-section-title info-title">本次处理的 API</div>
              <div class="change-tags">
                <el-tag v-for="item in checkedApiItems" :key="item.id" type="info">
                  {{ item.api_name }}（{{ item.api_path }}）
                </el-tag>
                <span v-if="!checkedApiItems.length" class="empty-text">未选择 API</span>
              </div>
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

            <div v-if="isSingleEditor" class="change-section">
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
      </div>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button v-if="isImportedEditor" type="primary" plain @click="submit('continue')">确认并继续</el-button>
        <el-button type="primary" @click="submit(isImportedEditor ? 'finish' : 'default')">
          {{ isImportedEditor ? '确认并完成' : '确认' }}
        </el-button>
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
        <el-table :data="pagedDetailApps" border size="small">
          <el-table-column prop="app_code" label="应用编码" width="180" />
          <el-table-column prop="app_name" label="应用名称" min-width="180" />
        </el-table>
        <div class="pagination-wrap detail-pagination">
          <el-pagination
            v-model:current-page="detailPagination.page"
            v-model:page-size="detailPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="detailData.apps.length"
            @size-change="handleDetailPageSizeChange"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
type EditorMode = 'single' | 'batch' | 'imported';

const route = useRoute();
const router = useRouter();
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
const detailPagination = reactive({ page: 1, pageSize: 10 });
const targetKeyword = ref('');
const apiKeyword = ref('');
const checkedAppCodes = ref<string[]>([]);
const checkedApiIds = ref<number[]>([]);
const originalAppCodes = ref<string[]>([]);
const isResettingSelection = ref(false);
const pendingImportedIds = ref<number[]>([]);
const completedImportedCount = ref(0);
const editorMode = ref<EditorMode>('batch');

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

const pagedDetailApps = computed(() => {
  const apps = detailData.value?.apps || [];
  const start = (detailPagination.page - 1) * detailPagination.pageSize;
  return apps.slice(start, start + detailPagination.pageSize);
});

const filteredApps = computed(() => {
  const keyword = targetKeyword.value.trim();
  return (editorData.value?.apps || []).filter((item) => !keyword || item.app_code.includes(keyword) || item.app_name.includes(keyword));
});

const filteredSelectedApis = computed(() => {
  const keyword = apiKeyword.value.trim();
  return (editorData.value?.selected_apis || []).filter((item) =>
    !keyword || item.api_name.includes(keyword) || item.api_path.includes(keyword)
  );
});

const checkedApiItems = computed(() => {
  const checkedSet = new Set(checkedApiIds.value);
  return (editorData.value?.selected_apis || []).filter((item) => checkedSet.has(item.id));
});
const remainingAfterCurrentCount = computed(() => Math.max(pendingImportedIds.value.length - checkedApiIds.value.length, 0));

const pendingFlowVisible = computed(() => pendingImportedIds.value.length > 0 || completedImportedCount.value > 0);
const isSingleEditor = computed(() => editorMode.value === 'single');
const isBatchEditor = computed(() => editorMode.value === 'batch');
const isImportedEditor = computed(() => editorMode.value === 'imported');

const isImportedFlowEditor = computed(() =>
  Boolean(
    editorMode.value === 'imported' &&
    editorData.value?.selected_apis.length &&
    pendingImportedIds.value.length &&
    editorData.value.selected_apis.every((item) => pendingImportedIds.value.includes(item.id))
  )
);

const appMap = computed(() => new Map((editorData.value?.apps || []).map((item) => [item.app_code, item])));
const addedApps = computed(() => checkedAppCodes.value.filter((code) => !originalAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));
const revokedApps = computed(() => originalAppCodes.value.filter((code) => !checkedAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));
const visibleApiIds = computed(() => filteredSelectedApis.value.map((item) => item.id));
const visibleAppCodes = computed(() => filteredApps.value.map((item) => item.app_code));
const allVisibleApisChecked = computed(() => visibleApiIds.value.length > 0 && visibleApiIds.value.every((id) => checkedApiIds.value.includes(id)));
const someVisibleApisChecked = computed(() => visibleApiIds.value.some((id) => checkedApiIds.value.includes(id)) && !allVisibleApisChecked.value);
const allVisibleAppsChecked = computed(() => visibleAppCodes.value.length > 0 && visibleAppCodes.value.every((code) => checkedAppCodes.value.includes(code)));
const someVisibleAppsChecked = computed(() => visibleAppCodes.value.some((code) => checkedAppCodes.value.includes(code)) && !allVisibleAppsChecked.value);

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
  restorePageSelection();
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

function handleDetailPageSizeChange() {
  detailPagination.page = 1;
}

function getRowKey(row: ReverseAuthListItem) {
  return row.api_id;
}

function syncSelectedRows() {
  selectedRows.value = Array.from(selectedRowMap.value.values());
}

function clearPendingFlow() {
  pendingImportedIds.value = [];
  completedImportedCount.value = 0;
}

function clearBaseQueryAndSelection() {
  Object.assign(query, { app_code: '', app_name: '', api_name: '', api_path: '' });
  pagination.page = 1;
  selectedRowMap.value.clear();
  selectedRows.value = [];
  tableRef.value?.clearSelection();
}

function toggleAllVisibleApis(checked: boolean | string | number) {
  const next = new Set(checkedApiIds.value);
  if (checked) {
    visibleApiIds.value.forEach((id) => next.add(id));
  } else {
    visibleApiIds.value.forEach((id) => next.delete(id));
  }
  checkedApiIds.value = Array.from(next);
}

function clearVisibleApis() {
  toggleAllVisibleApis(false);
}

function toggleAllVisibleApps(checked: boolean | string | number) {
  const next = new Set(checkedAppCodes.value);
  if (checked) {
    visibleAppCodes.value.forEach((code) => next.add(code));
  } else {
    visibleAppCodes.value.forEach((code) => next.delete(code));
  }
  checkedAppCodes.value = Array.from(next);
}

function clearVisibleApps() {
  toggleAllVisibleApps(false);
}

function syncRowMapByIds(ids: number[]) {
  const selectedIdSet = new Set(ids);
  selectedRowMap.value.clear();
  list.value.forEach((item) => {
    if (selectedIdSet.has(item.api_id)) {
      selectedRowMap.value.set(item.api_id, item);
    }
  });
  syncSelectedRows();
  restorePageSelection();
}

function restorePageSelection() {
  nextTick(() => {
    pagedList.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, selectedRowMap.value.has(row.api_id));
    });
  });
}

async function openEditor(apiIds: number[], preserveExisting = true, mode: EditorMode = 'batch') {
  const { data } = await fetchReverseAuthEditor(apiIds);
  editorMode.value = mode;
  editorData.value = data;
  checkedApiIds.value = data.selected_apis.map((item) => item.id);
  checkedAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  originalAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  targetKeyword.value = '';
  apiKeyword.value = '';
  visible.value = true;
}

async function openBatchEditor() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择至少一个 API');
    return;
  }
  await openEditor(selectedRows.value.map((item) => item.api_id), false, 'batch');
}

async function openRowEditor(row: ReverseAuthListItem) {
  await openEditor([row.api_id], true, 'single');
}

async function openDetailDrawer(row: ReverseAuthListItem) {
  const { data } = await fetchReverseAuthorizedTargetDetail(row.api_id);
  detailData.value = data;
  detailPagination.page = 1;
  detailVisible.value = true;
}

async function submit(mode: 'continue' | 'finish' | 'default') {
  if (!checkedApiIds.value.length) {
    ElMessage.warning('请至少选择一个 API');
    return;
  }
  if (!checkedAppCodes.value.length && !originalAppCodes.value.length) {
    ElMessage.warning('请至少选择一个应用');
    return;
  }

  const selectedApiItems = checkedApiItems.value;
  const { code, message } = await saveReverseAuthorization({
    selected_apis: selectedApiItems.map((item) => ({
      id: item.id,
      api_path: item.api_path,
      app_code: item.app_code
    })),
    checked_app_codes: checkedAppCodes.value,
    original_app_codes: originalAppCodes.value
  });

  if (code !== 0) {
    ElMessage.error(message);
    return;
  }

  const handledIds = selectedApiItems.map((item) => item.id);
  const isImportedFlow = isImportedFlowEditor.value;
  ElMessage.success(message);
  await loadData();

  if (mode === 'continue' && isImportedFlow) {
    completedImportedCount.value += handledIds.length;
    pendingImportedIds.value = pendingImportedIds.value.filter((id) => !handledIds.includes(id));
    syncRowMapByIds(pendingImportedIds.value);

    if (!pendingImportedIds.value.length) {
      visible.value = false;
      editorData.value = null;
      const totalHandled = completedImportedCount.value;
      clearPendingFlow();
      clearBaseQueryAndSelection();
      await loadData();
      ElMessage.success(`新增 API 已全部处理完成，共完成 ${totalHandled} 个`);
      await router.replace({ path: '/auth/api-reverse' });
      return;
    }

    await openEditor(pendingImportedIds.value, false, 'imported');
    return;
  }

  visible.value = false;
  editorData.value = null;
  if (isImportedFlow) {
    clearPendingFlow();
    clearBaseQueryAndSelection();
    await loadData();
    await router.replace({ path: '/auth/api-reverse' });
  }
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
  pendingImportedIds.value = ids;
  completedImportedCount.value = 0;
  syncRowMapByIds(ids);
  await openEditor(ids, false, 'imported');
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-pending-alert {
  margin-bottom: 0;
}

.editor-grid {
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

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  color: var(--sg-text);
  font-size: 15px;
  font-weight: 700;
}

.section-meta {
  color: var(--sg-subtext);
  font-size: 12px;
}

.single-api-box {
  padding: 12px 14px;
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  background: #f8fafc;
}

.selected-api-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.selected-api-item {
  padding: 12px 14px;
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  background: #f8fafc;
}

.api-checkbox-list,
.target-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.api-checkbox-list :deep(.el-checkbox),
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
  flex-wrap: wrap;
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

.info-title {
  color: #2563eb;
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

.quick-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0 4px;
}

.detail-summary {
  margin-bottom: 20px;
}

.detail-pagination {
  margin-top: 16px;
}
</style>
