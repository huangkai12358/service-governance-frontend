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
        <div v-if="isImportedEditor" class="imported-grid">
          <div class="imported-flow">
            <el-steps :active="importedStep" finish-status="success" align-center>
              <el-step title="选择服务" />
              <el-step title="API授权" />
              <el-step title="确认" />
              <el-step title="完成" />
            </el-steps>

            <el-alert class="dialog-pending-alert" type="info" :closable="false" show-icon>
              <template #title>仅处理本次新增 API</template>
            </el-alert>

            <el-card class="step-card" shadow="never">
              <template v-if="importedStep === 0">
                <div class="step-layout">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="被调用方服务">{{ importedCalleeAppName }}</el-descriptions-item>
                    <el-descriptions-item label="SmartDoc 版本">{{ importedVersion }}</el-descriptions-item>
                    <el-descriptions-item label="本次新增 API 数量">{{ importedInitialIds.length }}</el-descriptions-item>
                  </el-descriptions>

                  <div class="step-section">
                    <div class="section-head">
                      <h3 class="section-title">选择调用方服务</h3>
                      <span class="section-meta">已处理 {{ importedAssignments.length }} 个服务</span>
                    </div>
                    <el-select v-model="importedCallerAppCode" placeholder="请选择调用方服务" filterable clearable>
                      <el-option
                        v-for="item in importedCallerOptions"
                        :key="item.app_code"
                        :label="`${item.app_name}（${item.app_code}）`"
                        :value="item.app_code"
                        :disabled="processedImportedAppCodes.includes(item.app_code)"
                      >
                        <div class="service-option">
                          <span>{{ item.app_name }}（{{ item.app_code }}）</span>
                          <el-tag v-if="processedImportedAppCodes.includes(item.app_code)" size="small" type="success">已处理</el-tag>
                        </div>
                      </el-option>
                    </el-select>
                    <div class="change-tags">
                      <el-tag v-for="item in importedAssignments" :key="item.app_code" type="success">
                        {{ item.app_name }}（{{ item.app_code }}）/ {{ item.api_ids.length }} 个 API
                      </el-tag>
                      <el-empty v-if="!importedAssignments.length" description="暂无已处理服务" :image-size="72" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="importedStep === 1">
                <div class="step-layout">
                  <div class="section-head">
                    <h3 class="section-title">当前调用方服务</h3>
                    <span class="section-meta">{{ currentImportedCallerName }}</span>
                  </div>
                  <el-transfer
                    v-model="importedTransferKeys"
                    filterable
                    :titles="['未授权新增 API', `本次授权 API（${importedTransferKeys.length}）`]"
                    :props="{ key: 'key', label: 'label' }"
                    :data="importedTransferData"
                    target-order="push"
                    filter-placeholder="搜索 API 名称或请求路径"
                    class="api-transfer"
                  >
                    <template #default="{ option }">
                      <div class="transfer-item">
                        <el-tag size="small" :type="getMethodTagType(option.method)">{{ option.method }}</el-tag>
                        <span>{{ option.api_name }} - {{ option.api_path }}</span>
                      </div>
                    </template>
                  </el-transfer>
                </div>
              </template>

              <template v-else-if="importedStep === 2">
                <div class="step-layout">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="当前调用方服务">{{ currentImportedCallerName }}</el-descriptions-item>
                    <el-descriptions-item label="被调用方服务">{{ importedCalleeAppName }}</el-descriptions-item>
                  </el-descriptions>
                  <el-table :data="currentImportedApiRows" border max-height="420">
                    <el-table-column prop="api_name" label="API 名称" min-width="180" />
                    <el-table-column prop="api_method" label="请求方法" width="120">
                      <template #default="{ row }">
                        <el-tag :type="getMethodTagType(row.api_method)">{{ row.api_method }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="api_path" label="请求路径" min-width="280" show-overflow-tooltip />
                  </el-table>
                </div>
              </template>

              <template v-else>
                <div class="step-layout">
                  <div class="review-summary">
                    <el-tag>调用方服务 {{ importedAssignments.length }} 个</el-tag>
                    <el-tag type="success">本次授权 API {{ importedAssignedApiCount }} 个</el-tag>
                    <el-tag type="info">授权明细 {{ importedReviewRows.length }} 条</el-tag>
                  </div>
                  <el-table :data="importedReviewRows" border max-height="420">
                    <el-table-column prop="caller_app_code" label="调用方服务" width="180" />
                    <el-table-column prop="api_name" label="API 名称" min-width="180" />
                    <el-table-column prop="api_method" label="请求方法" width="120">
                      <template #default="{ row }">
                        <el-tag :type="getMethodTagType(row.api_method)">{{ row.api_method }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="api_path" label="请求路径" min-width="280" show-overflow-tooltip />
                  </el-table>
                </div>
              </template>
            </el-card>
          </div>
        </div>

        <div v-else class="editor-grid">
          <div class="editor-column">
            <div class="section-head">
              <h3 class="section-title">已选 API</h3>
            </div>
            <template v-if="isSingleEditor">
              <div class="single-api-box">
                <div class="option-title">{{ editorData.selected_apis[0]?.api_name }}</div>
                <div class="option-subtitle">{{ editorData.selected_apis[0]?.api_path }}</div>
              </div>
            </template>
            <template v-else>
              <div class="selected-api-list">
                <div v-for="item in editorData.selected_apis" :key="item.id" class="selected-api-item">
                  <div class="option-title">{{ item.api_name }}</div>
                  <div class="option-subtitle">{{ item.api_path }}</div>
                </div>
              </div>
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
              <el-tag type="success">新增 {{ addedApps.length }} 个</el-tag>
              <el-tag v-if="isSingleEditor" type="warning">撤销 {{ revokedApps.length }} 个</el-tag>
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
        <template v-if="isImportedEditor">
          <el-button v-if="importedStep === 0" @click="handleEditorCancel">取消</el-button>
          <el-button v-else-if="importedStep === 3" @click="cancelImportedReview">取消授权</el-button>
          <el-button v-else @click="goImportedPrevStep">上一步</el-button>

          <el-button v-if="importedStep === 0" type="primary" :disabled="!importedCallerAppCode" @click="goImportedNextStep">下一步</el-button>
          <el-button v-else-if="importedStep === 1" type="primary" :disabled="!importedTransferKeys.length" @click="goImportedNextStep">下一步</el-button>
          <template v-else-if="importedStep === 2">
            <el-button type="primary" plain @click="submit('continue')">确认并继续</el-button>
            <el-button type="primary" @click="submit('finish')">确认并完成</el-button>
          </template>
          <template v-else>
            <el-button plain type="primary" @click="restartImportedReview">重新选择</el-button>
            <el-button type="primary" @click="confirmImportedReview">确认授权</el-button>
          </template>
        </template>
        <template v-else>
          <el-button @click="handleEditorCancel">取消</el-button>
          <el-button type="primary" @click="submit('default')">确认</el-button>
        </template>
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
import type { HttpMethod } from '@/types/business';

type EditorMode = 'single' | 'batch' | 'imported';

interface ImportedAssignment {
  app_code: string;
  app_name: string;
  api_ids: number[];
}

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
const checkedAppCodes = ref<string[]>([]);
const originalAppCodes = ref<string[]>([]);
const isResettingSelection = ref(false);
const editorMode = ref<EditorMode>('batch');

const pendingImportedIds = ref<number[]>([]);
const importedInitialIds = ref<number[]>([]);
const importedAssignments = ref<ImportedAssignment[]>([]);
const importedCallerAppCode = ref('');
const importedTransferKeys = ref<number[]>([]);
const importedApiCatalog = ref<ReverseAuthEditorData['selected_apis']>([]);
const importedStep = ref(0);

const methodTagTypeMap: Record<HttpMethod, 'success' | 'primary' | 'warning' | 'danger'> = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger'
};

function getMethodTagType(method: string) {
  return methodTagTypeMap[method as HttpMethod] || 'info';
}

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

const isSingleEditor = computed(() => editorMode.value === 'single');
const isImportedEditor = computed(() => editorMode.value === 'imported');

const appMap = computed(() => new Map((editorData.value?.apps || []).map((item) => [item.app_code, item])));
const addedApps = computed(() => checkedAppCodes.value.filter((code) => !originalAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));
const revokedApps = computed(() => originalAppCodes.value.filter((code) => !checkedAppCodes.value.includes(code)).map((code) => appMap.value.get(code)!).filter(Boolean));
const visibleAppCodes = computed(() => filteredApps.value.map((item) => item.app_code));
const allVisibleAppsChecked = computed(() => visibleAppCodes.value.length > 0 && visibleAppCodes.value.every((code) => checkedAppCodes.value.includes(code)));
const someVisibleAppsChecked = computed(() => visibleAppCodes.value.some((code) => checkedAppCodes.value.includes(code)) && !allVisibleAppsChecked.value);

const importedAssignedApiCount = computed(() => importedAssignments.value.reduce((sum, item) => sum + item.api_ids.length, 0));
const remainingAfterCurrentCount = computed(() => Math.max(pendingImportedIds.value.length - importedTransferKeys.value.length, 0));
const importedCallerOptions = computed(() => {
  const calleeAppCode = editorData.value?.selected_apis[0]?.app_code;
  return (editorData.value?.apps || []).filter((item) => item.app_code !== calleeAppCode);
});
const processedImportedAppCodes = computed(() => importedAssignments.value.map((item) => item.app_code));
const importedTransferData = computed(() =>
  (editorData.value?.selected_apis || []).map((item) => ({
    key: item.id,
    label: `${item.api_method} ${item.api_name} - ${item.api_path}`,
    api_name: item.api_name,
    api_path: item.api_path,
    method: item.api_method
  }))
);
const importedApiMap = computed(() => new Map(importedApiCatalog.value.map((item) => [item.id, item])));
const importedVersion = computed(() => route.query.version || 'v2.3.0');
const importedCalleeAppName = computed(() => editorData.value?.selected_apis[0]?.app_name || '未知服务');
const currentImportedCallerName = computed(() => {
  const app = importedCallerOptions.value.find((item) => item.app_code === importedCallerAppCode.value);
  return app ? `${app.app_name}（${app.app_code}）` : '-';
});
const currentImportedApiRows = computed(() =>
  importedTransferKeys.value
    .map((id) => importedApiMap.value.get(id))
    .filter(Boolean)
);
const importedReviewRows = computed(() =>
  importedAssignments.value.flatMap((assignment) =>
    assignment.api_ids.map((apiId) => {
      const api = importedApiMap.value.get(apiId);
      return {
        caller_app_code: assignment.app_code,
        caller_app_name: assignment.app_name,
        api_name: api?.api_name || '',
        api_method: api?.api_method || 'GET',
        api_path: api?.api_path || ''
      };
    })
  )
);

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

function clearBaseQueryAndSelection() {
  Object.assign(query, { app_code: '', app_name: '', api_name: '', api_path: '' });
  pagination.page = 1;
  selectedRowMap.value.clear();
  selectedRows.value = [];
  tableRef.value?.clearSelection();
}

function clearVisibleApps() {
  checkedAppCodes.value = checkedAppCodes.value.filter((code) => !visibleAppCodes.value.includes(code));
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

function restorePageSelection() {
  nextTick(() => {
    pagedList.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, selectedRowMap.value.has(row.api_id));
    });
  });
}

async function openStandardEditor(apiIds: number[], preserveExisting = true, mode: EditorMode = 'batch') {
  const { data } = await fetchReverseAuthEditor(apiIds);
  editorMode.value = mode;
  editorData.value = data;
  checkedAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  originalAppCodes.value = preserveExisting ? [...data.checked_app_codes] : [];
  targetKeyword.value = '';
  visible.value = true;
}

async function openImportedEditor(apiIds: number[]) {
  const { data } = await fetchReverseAuthEditor(apiIds);
  editorMode.value = 'imported';
  editorData.value = data;
  importedCallerAppCode.value = '';
  importedTransferKeys.value = [];
  importedStep.value = 0;
  visible.value = true;
}

async function openBatchEditor() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择至少一个 API');
    return;
  }
  await openStandardEditor(selectedRows.value.map((item) => item.api_id), false, 'batch');
}

async function openRowEditor(row: ReverseAuthListItem) {
  await openStandardEditor([row.api_id], true, 'single');
}

async function openDetailDrawer(row: ReverseAuthListItem) {
  const { data } = await fetchReverseAuthorizedTargetDetail(row.api_id);
  detailData.value = data;
  detailPagination.page = 1;
  detailVisible.value = true;
}

function upsertImportedAssignment(appCode: string, apiIds: number[]) {
  const app = importedCallerOptions.value.find((item) => item.app_code === appCode);
  const existed = importedAssignments.value.find((item) => item.app_code === appCode);
  if (existed) {
    existed.api_ids = [...new Set([...existed.api_ids, ...apiIds])];
    return;
  }
  importedAssignments.value.push({
    app_code: appCode,
    app_name: app?.app_name || appCode,
    api_ids: [...apiIds]
  });
}

function clearImportedFlowState() {
  pendingImportedIds.value = [];
  importedInitialIds.value = [];
  importedAssignments.value = [];
  importedCallerAppCode.value = '';
  importedTransferKeys.value = [];
  importedApiCatalog.value = [];
}

async function stageImportedSelection() {
  if (!importedCallerAppCode.value) {
    ElMessage.warning('请先选择调用方服务');
    return false;
  }
  if (processedImportedAppCodes.value.includes(importedCallerAppCode.value)) {
    ElMessage.warning('该调用方服务已处理，请重新选择');
    return false;
  }
  if (!importedTransferKeys.value.length) {
    ElMessage.warning('请至少选择一个 API');
    return false;
  }
  upsertImportedAssignment(importedCallerAppCode.value, importedTransferKeys.value);
  return true;
}

async function submit(mode: 'continue' | 'finish' | 'default') {
  if (isImportedEditor.value) {
    if (mode === 'continue') {
      const staged = await stageImportedSelection();
      if (!staged) return;
      pendingImportedIds.value = pendingImportedIds.value.filter((id) => !importedTransferKeys.value.includes(id));
      if (!pendingImportedIds.value.length) {
        importedStep.value = 3;
        return;
      }
      await openImportedEditor(pendingImportedIds.value);
      return;
    }

    if (mode === 'finish') {
      if (importedCallerAppCode.value && importedTransferKeys.value.length) {
        const staged = await stageImportedSelection();
        if (!staged) return;
        pendingImportedIds.value = pendingImportedIds.value.filter((id) => !importedTransferKeys.value.includes(id));
      }
      if (!importedAssignments.value.length) {
        ElMessage.warning('请至少完成一组服务与 API 的授权选择');
        return;
      }
      importedStep.value = 3;
      return;
    }
  }

  if (!editorData.value?.selected_apis.length) {
    ElMessage.warning('请至少选择一个 API');
    return;
  }
  if (!checkedAppCodes.value.length && !originalAppCodes.value.length) {
    ElMessage.warning('请至少选择一个应用');
    return;
  }

  const { code, message } = await saveReverseAuthorization({
    selected_apis: editorData.value.selected_apis.map((item) => ({
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

  ElMessage.success(message);
  visible.value = false;
  editorData.value = null;
  await loadData();
}

async function confirmImportedReview() {
  for (const assignment of importedAssignments.value) {
    const selectedApis = assignment.api_ids
      .map((id) => importedApiMap.value.get(id))
      .filter(Boolean)
      .map((item) => ({
        id: item!.id,
        api_path: item!.api_path,
        app_code: item!.app_code
      }));
    const { code, message } = await saveReverseAuthorization({
      selected_apis: selectedApis,
      checked_app_codes: [assignment.app_code],
      original_app_codes: []
    });
    if (code !== 0) {
      ElMessage.error(message);
      return;
    }
  }

  ElMessage.success('新增 API 授权确认成功');
  visible.value = false;
  editorData.value = null;
  clearImportedFlowState();
  clearBaseQueryAndSelection();
  await loadData();
  await router.replace({ path: '/auth/api-reverse' });
}

async function restartImportedReview() {
  importedAssignments.value = [];
  pendingImportedIds.value = [...importedInitialIds.value];
  await openImportedEditor(importedInitialIds.value);
}

async function cancelImportedReview() {
  visible.value = false;
  editorData.value = null;
  clearImportedFlowState();
  clearBaseQueryAndSelection();
  await loadData();
  await router.replace({ path: '/auth/api-reverse' });
}

async function handleEditorCancel() {
  visible.value = false;
  if (!isImportedEditor.value) {
    return;
  }
  editorData.value = null;
  clearImportedFlowState();
  clearBaseQueryAndSelection();
  await loadData();
  await router.replace({ path: '/auth/api-reverse' });
}

async function tryOpenFromRoute() {
  const idsParam = route.query.api_ids;
  if (typeof idsParam !== 'string' || !idsParam) return;
  const ids = idsParam.split(',').map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  if (!ids.length) return;
  pendingImportedIds.value = [...ids];
  importedInitialIds.value = [...ids];
  importedAssignments.value = [];
  const { data } = await fetchReverseAuthEditor(ids);
  importedApiCatalog.value = data.selected_apis;
  await openImportedEditor(ids);
}

function goImportedPrevStep() {
  if (importedStep.value > 0) {
    importedStep.value -= 1;
  }
}

function goImportedNextStep() {
  if (importedStep.value === 0) {
    if (!importedCallerAppCode.value) return;
    if (processedImportedAppCodes.value.includes(importedCallerAppCode.value)) {
      ElMessage.warning('该调用方服务已处理，请重新选择');
      return;
    }
    importedStep.value = 1;
    return;
  }
  if (importedStep.value === 1) {
    if (!importedTransferKeys.value.length) return;
    importedStep.value = 2;
  }
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
  grid-template-columns: 1.1fr 1fr 0.92fr;
  gap: 16px;
}

.imported-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.6fr;
  gap: 16px;
}

.imported-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  border-radius: 12px;
}

.step-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.imported-transfer-column {
  overflow: hidden;
}

.service-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.single-api-box,
.selected-api-item {
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

.change-summary,
.review-summary {
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

.review-summary {
  margin-bottom: 16px;
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

.api-transfer {
  flex: 1;
}

.api-transfer :deep(.el-transfer-panel) {
  width: 100%;
}

.transfer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.detail-summary {
  margin-bottom: 20px;
}

.detail-pagination {
  margin-top: 16px;
}
</style>
