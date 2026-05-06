<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <h2>单个应用授权</h2>
        <p>按调用方应用编码和被调用方应用编码管理单应用 API 授权关系。</p>
      </div>
    </div>

    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="调用方应用名称"><el-input v-model="query.caller_app_name" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用名称"><el-input v-model="query.callee_app_name" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新增 / 修改授权</el-button>
        <el-button type="primary" @click="exportToExcel">导出为 Excel</el-button>
      </div>
      <template v-if="list.length">
        <el-table :data="pagedList" border>
          <el-table-column prop="caller_app_code" label="调用方应用编码" min-width="150" />
          <el-table-column prop="caller_app_name" label="调用方应用名称" min-width="120" />
          <el-table-column prop="callee_app_code" label="被调用方应用编码" min-width="150" />
          <el-table-column prop="callee_app_name" label="被调用方应用名称" min-width="120" />
          <el-table-column label="被调用方应用当前版本号" align="center">
            <template #default="{ row }">
              {{ getCurrentVersion(row) }}
            </template>
          </el-table-column>
          <el-table-column label="授权 API 数（当前）" align="center">
            <template #default="{ row }">
              {{ splitAuthorizedApiRows(row).current.length }}
            </template>
          </el-table-column>
          <el-table-column label="授权 API 数（废弃）" align="center">
            <template #default="{ row }">
              {{ splitAuthorizedApiRows(row).legacy.length }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" header-align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="openApiDetail(row)">详情</el-button>
              <el-button link type="primary" @click="openEditor(row.id)">授权配置</el-button>
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
      </template>

      <el-empty v-else :description="emptyDescription"></el-empty>
    </el-card>

    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="1280px"
      align-center
      append-to-body
      lock-scroll
      class="auth-dialog"
    >
      <div v-if="editorData" class="auth-dialog-layout">
        <div class="selection-panel">
          <div class="selection-title">授权对象</div>
          <el-form label-position="top" class="selection-form">
            <el-form-item label="调用方应用">
              <el-select
                v-model="form.caller_app_code"
                filterable
                default-first-option
                placeholder="请选择调用方应用"
                :disabled="lockAppPair"
                @change="handleCallerChange"
              >
                <el-option
                  v-for="app in callerAppOptions"
                  :key="app.app_code"
                  :label="`${app.app_name}（${app.app_code}）`"
                  :value="app.app_code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="被调用方应用">
              <el-select
                v-model="form.callee_app_code"
                filterable
                default-first-option
                placeholder="请选择被调用方应用"
                :disabled="lockAppPair"
                @change="handleCalleeChange"
              >
                <el-option
                  v-for="app in calleeAppOptions"
                  :key="app.app_code"
                  :label="`${app.app_name}（${app.app_code}）`"
                  :value="app.app_code"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="selection-tip">
            <span>已勾选 {{ checkedApiIds.length }} 个 API</span>
            <span class="text-muted">若最终撤销至 0 个 API，保存后将在表格中删除该授权关系</span>
          </div>
        </div>

        <div class="auth-editor">
          <div class="editor-column">
            <h3 class="section-title">API 列表</h3>
            <el-input v-model="apiKeyword" clearable :placeholder="apiKeywordPlaceholder" />
            <el-tabs v-model="editorTab">
              <el-tab-pane :label="`当前版本（${filteredCurrentApis.length}）`" name="current">
                <el-checkbox-group v-model="checkedApiIds" class="api-checkbox-list">
                  <el-checkbox v-for="item in filteredCurrentApis" :key="item.id" :label="item.id">
                    <span class="option-title">{{ item.api_name }}</span>
                    <span class="option-subtitle">{{ item.api_path }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </el-tab-pane>
              <el-tab-pane :label="`兼容旧版本（${filteredLegacyApis.length}）`" name="legacy">
                <el-checkbox-group v-model="checkedApiIds" class="api-checkbox-list">
                  <el-checkbox v-for="item in filteredLegacyApis" :key="item.id" :label="item.id">
                    <span class="option-title">{{ item.api_name }}</span>
                    <span class="option-subtitle">{{ item.api_path }}</span>
                    <span class="option-meta">版本号：{{ item.version }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="editor-column">
            <h3 class="section-title">变更预览</h3>
            <div class="change-summary">
              <span>总计</span>
              <el-tag>共 {{ checkedApiIds.length }} 个</el-tag>
              <el-tag type="success">新增 {{ delta.added_api_paths.length }} 个</el-tag>
              <el-tag type="warning">撤销 {{ delta.revoked_api_paths.length }} 个</el-tag>
            </div>
            <div class="change-section">
              <div class="change-section-title success-title">新增权限</div>
              <div class="change-tags">
                <el-tag v-for="item in addedApiDetails" :key="item.api_path" type="success">
                  {{ item.api_name }}（{{ item.api_path }}）
                </el-tag>
                <span v-if="!delta.added_api_paths.length" class="empty-text">无新增权限</span>
              </div>
            </div>
            <div class="change-section">
              <div class="change-section-title warning-title">撤销权限</div>
              <div class="change-tags">
                <el-tag v-for="item in revokedApiDetails" :key="item.api_path" type="warning">
                  {{ item.api_name }}（{{ item.api_path }}）
                </el-tag>
                <span v-if="!delta.revoked_api_paths.length" class="empty-text">无撤销权限</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="apiDetailVisible" title="已授权 API 详情" size="720px">
      <div class="api-detail-panel">
        <el-descriptions v-if="currentApiDetail" :column="1" border>
          <el-descriptions-item label="调用方应用">{{ currentApiDetail.caller_app_name }}（{{ currentApiDetail.caller_app_code }}）</el-descriptions-item>
          <el-descriptions-item label="被调用方应用">{{ currentApiDetail.callee_app_name }}（{{ currentApiDetail.callee_app_code }}）</el-descriptions-item>
          <el-descriptions-item label="被调用方应用当前版本号">{{ currentDetailVersion }}</el-descriptions-item>
          <el-descriptions-item label="已授权 API 数量">{{ currentApiDetail.api_paths.length }} 个</el-descriptions-item>
        </el-descriptions>

        <el-input v-model="apiDetailKeyword" clearable placeholder="搜索请求路径" />

        <el-tabs v-model="apiDetailTab">
          <el-tab-pane :label="`当前版本（${filteredCurrentApiDetailRows.length}）`" name="current">
            <el-table :data="pagedCurrentApiDetailRows" border>
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="api_name" label="API 名称" min-width="180" />
              <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="`兼容旧版本（${filteredLegacyApiDetailRows.length}）`" name="legacy">
            <el-table :data="pagedLegacyApiDetailRows" border>
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="api_name" label="API 名称" min-width="180" />
              <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
              <el-table-column prop="version" label="版本号" width="120" />              
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="apiDetailPagination.page"
            v-model:page-size="apiDetailPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="apiDetailTab === 'current' ? filteredCurrentApiDetailRows.length : filteredLegacyApiDetailRows.length"
            @size-change="handleApiDetailPageSizeChange"
          />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { apis, apps } from '@/mock/base';
import {
  calcAuthorizationDelta,
  fetchExistingSingleAppAuthorization,
  fetchSingleAppAuthEditor,
  fetchSingleAppAuthList,
  fetchSingleAppAuthorizationCreator,
  fetchSingleAppAuthorizationOptions,
  saveSingleAppAuthorization
} from '@/mock/auth';
import type { AuthorizationAppOption, AuthorizationEditorData, SingleAppAuthorization } from '@/types/business';

const query = reactive({ caller_app_code: '', caller_app_name: '', callee_app_code: '', callee_app_name: '' });
const list = ref<SingleAppAuthorization[]>([]);
const visible = ref(false);
const dialogTitle = ref('授权配置');
const appOptions = ref<AuthorizationAppOption[]>([]);
const editorData = ref<AuthorizationEditorData | null>(null);
const editingId = ref<number>();
const lockAppPair = ref(false);
const originalApiIds = ref<number[]>([]);
const checkedApiIds = ref<number[]>([]);
const pagination = reactive({ page: 1, pageSize: 10 });
const apiKeyword = ref('');
const editorTab = ref('current');
const form = reactive({ caller_app_code: '', callee_app_code: '' });
const apiDetailVisible = ref(false);
const currentApiDetail = ref<SingleAppAuthorization | null>(null);
const apiDetailKeyword = ref('');
const apiDetailTab = ref('current');
const apiDetailPagination = reactive({ page: 1, pageSize: 10 });

const allEditorApis = computed(() => [
  ...(editorData.value?.current_apis || []),
  ...(editorData.value?.legacy_apis || [])
]);
const delta = computed(() => calcAuthorizationDelta(originalApiIds.value, checkedApiIds.value, allEditorApis.value));
const addedApiDetails = computed(() => {
  const source = allEditorApis.value;
  return delta.value.added_api_paths.map((path) => {
    const target = source.find((item) => item.api_path === path);
    return {
      api_name: target?.api_name || path,
      api_path: path
    };
  });
});
const revokedApiDetails = computed(() => {
  const source = allEditorApis.value;
  return delta.value.revoked_api_paths.map((path) => {
    const target = source.find((item) => item.api_path === path);
    return {
      api_name: target?.api_name || path,
      api_path: path
    };
  });
});
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});
const filteredCurrentApis = computed(() => {
  const keyword = apiKeyword.value.trim();
  const source = editorData.value?.current_apis || [];
  return source.filter((api) => !keyword || api.api_name.includes(keyword) || api.api_path.includes(keyword));
});
const filteredLegacyApis = computed(() => {
  const keyword = apiKeyword.value.trim();
  const source = editorData.value?.legacy_apis || [];
  return source.filter((api) => !keyword || api.api_name.includes(keyword) || api.api_path.includes(keyword) || api.version.includes(keyword));
});
const apiKeywordPlaceholder = computed(() =>
  editorTab.value === 'legacy' ? '搜索 API 名称、请求路径或版本号' : '搜索 API 名称或请求路径'
);
const callerAppOptions = computed(() =>
  appOptions.value.filter((item) => item.app_code !== form.callee_app_code)
);
const calleeAppOptions = computed(() =>
  appOptions.value.filter((item) => item.app_code !== form.caller_app_code)
);
const hasQueryCondition = computed(() => Boolean(query.caller_app_code || query.caller_app_name || query.callee_app_code || query.callee_app_name));
const emptyDescription = computed(() =>
  hasQueryCondition.value ? '未找到匹配的授权关系' : '当前没有授权关系，可点击“新增 / 修改授权”开始配置'
);
const currentApiDetailRows = computed(() => splitAuthorizedApiRows(currentApiDetail.value).current);
const legacyApiDetailRows = computed(() => splitAuthorizedApiRows(currentApiDetail.value).legacy);
const filteredCurrentApiDetailRows = computed(() => {
  const keyword = apiDetailKeyword.value.trim();
  return currentApiDetailRows.value.filter((item) => !keyword || item.api_name.includes(keyword) || item.api_path.includes(keyword));
});
const filteredLegacyApiDetailRows = computed(() => {
  const keyword = apiDetailKeyword.value.trim();
  return legacyApiDetailRows.value.filter((item) => !keyword || item.api_name.includes(keyword) || item.api_path.includes(keyword));
});
const currentDetailVersion = computed(() => getCurrentVersion(currentApiDetail.value));
const pagedCurrentApiDetailRows = computed(() => {
  const start = (apiDetailPagination.page - 1) * apiDetailPagination.pageSize;
  return filteredCurrentApiDetailRows.value.slice(start, start + apiDetailPagination.pageSize);
});
const pagedLegacyApiDetailRows = computed(() => {
  const start = (apiDetailPagination.page - 1) * apiDetailPagination.pageSize;
  return filteredLegacyApiDetailRows.value.slice(start, start + apiDetailPagination.pageSize);
});

async function loadData() {
  const { data } = await fetchSingleAppAuthList(query);
  list.value = data;
  if (pagination.page > Math.max(1, Math.ceil(list.value.length / pagination.pageSize))) {
    pagination.page = 1;
  }
}

function resetQuery() {
  Object.assign(query, { caller_app_code: '', caller_app_name: '', callee_app_code: '', callee_app_name: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

function handleApiDetailPageSizeChange() {
  apiDetailPagination.page = 1;
}

function resetEditorState() {
  originalApiIds.value = [];
  checkedApiIds.value = [];
  apiKeyword.value = '';
  editingId.value = undefined;
  lockAppPair.value = false;
  editorTab.value = 'current';
}

function openApiDetail(row: SingleAppAuthorization) {
  currentApiDetail.value = row;
  apiDetailKeyword.value = '';
  apiDetailPagination.page = 1;
  apiDetailTab.value = splitAuthorizedApiRows(row).current.length ? 'current' : 'legacy';
  apiDetailVisible.value = true;
}

function applyEditorData(data: AuthorizationEditorData, checkedIds?: number[]) {
  editorData.value = data;
  const nextCheckedIds = checkedIds ? [...checkedIds] : [...data.checked_api_ids];
  originalApiIds.value = [...nextCheckedIds];
  checkedApiIds.value = [...nextCheckedIds];
  apiKeyword.value = '';
  editorTab.value = data.current_apis.length ? 'current' : 'legacy';
}

async function openCreateDialog() {
  resetEditorState();
  dialogTitle.value = '新增 / 修改授权';

  const { data } = await fetchSingleAppAuthorizationCreator();
  appOptions.value = data.app_options;
  form.caller_app_code = '';
  form.callee_app_code = '';
  applyEditorData(data.data, []);

  visible.value = true;
}

async function openEditor(id: number) {
  resetEditorState();
  dialogTitle.value = '授权配置';
  editingId.value = id;
  lockAppPair.value = true;

  const { data } = await fetchSingleAppAuthEditor(id);
  appOptions.value = data.app_options;
  form.caller_app_code = data.current?.caller_app_code || '';
  form.callee_app_code = data.current?.callee_app_code || '';
  applyEditorData(data.data);
  visible.value = true;
}

async function handleCalleeChange() {
  if (lockAppPair.value) {
    return;
  }
  await syncPairAuthorization();
}

async function handleCallerChange() {
  if (lockAppPair.value) {
    return;
  }
  await syncPairAuthorization();
}

async function syncPairAuthorization() {
  if (!form.caller_app_code || !form.callee_app_code) {
    editingId.value = undefined;
    applyEditorData({ current_apis: [], legacy_apis: [], checked_api_ids: [] }, []);
    return;
  }

  const [optionsResponse, existingResponse] = await Promise.all([
    fetchSingleAppAuthorizationOptions(form.callee_app_code, form.caller_app_code),
    fetchExistingSingleAppAuthorization(form.caller_app_code, form.callee_app_code)
  ]);

  editingId.value = existingResponse.data?.id;
  applyEditorData(optionsResponse.data);
}

async function exportToExcel() {
  const headers = ['调用方应用编码', '被调用方应用编码', '授权API'];
  const rows = list.value.flatMap((item) => {
    if (!item.api_paths.length) {
      return [[item.caller_app_code, item.callee_app_code, '']];
    }

    return item.api_paths.map((apiPath) => [
      item.caller_app_code,
      item.callee_app_code,
      apiPath
    ]);
  });

  const escapeCell = (value: unknown) => {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(','))
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'authorization_export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function submitEdit() {
  if (!form.caller_app_code) {
    ElMessage.warning('请选择调用方应用');
    return;
  }

  if (!form.callee_app_code) {
    ElMessage.warning('请选择被调用方应用');
    return;
  }

  const response = await saveSingleAppAuthorization({
    id: editingId.value,
    caller_app_code: form.caller_app_code,
    callee_app_code: form.callee_app_code,
    checked_api_ids: checkedApiIds.value
  });

  if (!response.data) {
    ElMessage.warning(response.message);
    return;
  }

  ElMessage.success(response.message);
  visible.value = false;
  await loadData();
}

onMounted(loadData);

function splitAuthorizedApiRows(record: SingleAppAuthorization | null) {
  if (!record) {
    return { current: [] as Array<{ api_name: string; api_path: string; version: string }>, legacy: [] as Array<{ api_name: string; api_path: string; version: string }> };
  }
  const app = apps.find((item) => item.app_code === record.callee_app_code);
  const currentVersionApis = apis.filter((item) =>
    item.app_code === record.callee_app_code &&
    item.is_deleted === 0 &&
    (!app?.current_version || item.version === app.current_version)
  );
  const currentPathSet = new Set(currentVersionApis.map((item) => item.api_path));
  const toRow = (apiPath: string) => {
    const matched = apis.find((item) => item.app_code === record.callee_app_code && item.api_path === apiPath)
      || apis.find((item) => item.api_path === apiPath);
    return {
      api_name: matched?.api_name || '兼容旧版本 API',
      api_path: apiPath,
      version: matched?.version || '-'
    };
  };
  return {
    current: record.api_paths.filter((path) => currentPathSet.has(path)).map(toRow),
    legacy: record.api_paths.filter((path) => !currentPathSet.has(path)).map(toRow)
  };
}

function getCurrentVersion(record: SingleAppAuthorization | null) {
  if (!record) return '-';
  return apps.find((item) => item.app_code === record.callee_app_code)?.current_version || '-';
}
</script>

<style scoped>
:deep(.auth-dialog) {
  margin: 0;
}

:deep(.auth-dialog .el-dialog__body) {
  max-height: calc(100vh - 220px);
  overflow: hidden;
}

.auth-dialog-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 220px);
  overflow: hidden;
}

.selection-panel {
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  background: #f8fafc;
}

.selection-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--sg-text);
}

.selection-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.selection-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.selection-form :deep(.el-select) {
  width: 100%;
}

.selection-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: var(--sg-subtext);
  font-size: 13px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.auth-editor {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
}

.editor-column {
  min-height: 360px;
  max-height: 520px;
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.group-name {
  flex: 1;
  color: var(--sg-text);
  font-weight: 600;
}

.api-checkbox-list,
.group-api-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
}

.api-checkbox-list :deep(.el-checkbox),
.group-api-list :deep(.el-checkbox) {
  height: auto;
  align-items: flex-start;
  margin-right: 0;
}

.api-checkbox-list :deep(.el-checkbox__label),
.group-api-list :deep(.el-checkbox__label) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  white-space: normal;
}

.option-title {
  color: var(--sg-text);
  font-weight: 600;
}

.option-subtitle {
  color: var(--sg-subtext);
  font-size: 12px;
  word-break: break-all;
}

.option-meta {
  color: var(--sg-subtext);
  font-size: 12px;
}

.change-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.change-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}


.change-empty {
  display: flex;
  align-items: center;
  min-height: 120px;
}

.change-section-title {
  font-weight: 600;
}

.success-title {
  color: var(--sg-success);
}

.warning-title {
  color: var(--sg-warning);
}

.change-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-text {
  color: var(--sg-subtext);
  font-size: 13px;
}

.api-detail-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.count-link {
  padding: 0;
  font-size: 15px;
  font-weight: 600;
}

.conflict-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.conflict-alert-box {
  margin-top: 12px;
}

.conflict-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conflict-title {
  color: var(--sg-text);
  font-size: 16px;
  font-weight: 700;
}

.conflict-desc {
  color: var(--sg-subtext);
  font-size: 13px;
  line-height: 1.7;
}
</style>
