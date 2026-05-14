<template>
  <div class="page-container api-list-page">
    <div class="page-title">
      <h2>API列表</h2>
      <p>按应用编码、应用名称、API 名称、请求路径和版本号管理 API 资产。</p>
    </div>
    <PageSearch :model="query" @search="handleSearch" @reset="resetQuery">
      <el-form-item label="应用编码">
        <el-input
          v-model="query.app_code"
          clearable
          readonly
          @clear="query.app_code = ''"
          @click="openSelector('app_code')"
        />
      </el-form-item>
      <el-form-item label="应用名称">
        <el-input
          v-model="query.app_name"
          clearable
          readonly
          @clear="query.app_name = ''"
          @click="openSelector('app_name')"
        />
      </el-form-item>
      <el-form-item label="API 名称">
        <el-input
          v-model="query.api_name"
          clearable
          readonly
          @clear="query.api_name = ''"
          @click="openSelector('api_name')"
        />
      </el-form-item>
      <el-form-item label="请求路径">
        <el-input
          v-model="query.api_path"
          clearable
          readonly
          @clear="query.api_path = ''"
          @click="openSelector('api_path')"
        />
      </el-form-item>
      <el-form-item label="版本号">
        <el-input
          v-model="query.version"
          clearable
          readonly
          @clear="query.version = ''"
          @click="openSelector('version')"
        />
      </el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增 API</el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="tableData.list" border>
        <el-table-column prop="app_code" label="应用编码" width="150" />
        <el-table-column prop="app_name" label="应用名称" width="140" />
        <el-table-column prop="api_name" label="API 名称" min-width="160" />
        <el-table-column prop="api_path" label="请求路径" min-width="260" />
        <el-table-column prop="api_method" label="请求方法" width="100" />
        <el-table-column prop="version" label="版本号" width="110" />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="update_time" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="tableData.total"
          @current-change="loadData"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="createVisible" title="新增 API" width="680px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-form-item label="所属应用" prop="app_id">
          <el-select v-model="createForm.app_id" style="width:100%" filterable>
            <el-option v-for="app in options.apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="API 名称" prop="api_name"><el-input v-model="createForm.api_name" /></el-form-item>
        <el-form-item label="请求路径" prop="api_path"><el-input v-model="createForm.api_path" /></el-form-item>
        <el-form-item label="请求方法" prop="api_method">
          <el-select v-model="createForm.api_method" style="width:100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="createForm.api_description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSubmitting" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑 API" width="680px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="所属应用" prop="app_id">
          <el-select v-model="editForm.app_id" style="width:100%" filterable>
            <el-option v-for="app in options.apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="API 名称" prop="api_name"><el-input v-model="editForm.api_name" /></el-form-item>
        <el-form-item label="请求路径" prop="api_path"><el-input v-model="editForm.api_path" /></el-form-item>
        <el-form-item label="请求方法" prop="api_method">
          <el-select v-model="editForm.api_method" style="width:100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.api_description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="API详情" size="560px">
      <div v-loading="detailLoading" class="detail-wrapper">
        <el-descriptions v-if="detail" :column="1" border>
          <el-descriptions-item label="所属应用">{{ detail.app_code }} / {{ detail.app_name }}</el-descriptions-item>
          <el-descriptions-item label="API 名称">{{ detail.api_name }}</el-descriptions-item>
          <el-descriptions-item label="请求路径">{{ detail.api_path }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ detail.api_method }}</el-descriptions-item>
          <el-descriptions-item label="版本号">{{ detail.version || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detail.api_description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.create_time }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.update_time }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <el-dialog
      v-model="selectorVisible"
      :title="selectorTitle"
      width="720px"
      destroy-on-close
    >
      <div class="selector-panel">
        <el-input
          v-model="selectorKeyword"
          clearable
          :placeholder="selectorPlaceholder"
        />
        <div class="selector-summary">共匹配 {{ filteredSelectorOptions.length }} 条</div>
        <div v-if="filteredSelectorOptions.length" class="selector-list">
          <button
            v-for="item in filteredSelectorOptions"
            :key="item.key"
            type="button"
            class="selector-item"
            @click="selectOption(item)"
          >
            <div class="selector-item-main">{{ item.value }}</div>
            <div v-if="item.meta" class="selector-item-sub">{{ item.meta }}</div>
          </button>
        </div>
        <el-empty v-else :description="selectorEmptyDescription" :image-size="48" />
      </div>
      <template #footer>
        <el-button @click="selectorVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import {
  fetchApiAppCodeOptions,
  fetchApiAppNameOptions,
  fetchApiDetail,
  fetchApiList,
  fetchApiNameOptions,
  fetchApiOptions,
  fetchApiPathOptions,
  fetchApiVersionOptions,
  saveApi
} from '@/api/apiManage';
import type { ApiManageItem } from '@/api/apiManage';
import type { HttpMethod } from '@/types/business';

/**
 * 筛选弹框候选项的前端展示结构。
 */
interface SearchSuggestionItem {
  key: string;
  value: string;
  meta?: string;
}

/**
 * API 列表支持弹框筛选的字段范围。
 */
type SelectorField = 'app_code' | 'app_name' | 'api_name' | 'api_path' | 'version';

const query = reactive({ page: 1, pageSize: 10, app_code: '', app_name: '', api_name: '', api_path: '', version: '' });
const tableData = reactive({ list: [] as ApiManageItem[], total: 0 });
const options = reactive({ apps: [] as Array<{ id: number; app_code: string; app_name: string }> });
const detailVisible = ref(false);
const createVisible = ref(false);
const editVisible = ref(false);
const detail = ref<ApiManageItem | null>(null);
const loading = ref(false);
const detailLoading = ref(false);
const createSubmitting = ref(false);
const editSubmitting = ref(false);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const selectorOptions = ref<SearchSuggestionItem[]>([]);
const selectorVisible = ref(false);
const activeSelectorField = ref<SelectorField>('app_code');
const selectorKeyword = ref('');
let selectorSearchTimer: ReturnType<typeof setTimeout> | null = null;

const createForm = reactive({
  app_id: undefined as number | undefined,
  api_name: '',
  api_path: '',
  api_method: 'GET' as HttpMethod,
  api_description: ''
});

const editForm = reactive({
  id: 0,
  app_id: undefined as number | undefined,
  api_name: '',
  api_path: '',
  api_method: 'GET' as HttpMethod,
  api_description: ''
});

const createRules: FormRules = {
  app_id: [{ required: true, message: '请选择所属应用', trigger: 'change' }],
  api_name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }],
  api_path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  api_method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
};

const editRules: FormRules = {
  app_id: [{ required: true, message: '请选择所属应用', trigger: 'change' }],
  api_name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }],
  api_path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  api_method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
};

/**
 * 当前激活筛选字段对应的弹框标题。
 */
const selectorTitle = computed(() => {
  if (activeSelectorField.value === 'app_code') {
    return '选择应用编码';
  }
  if (activeSelectorField.value === 'app_name') {
    return '选择应用名称';
  }
  if (activeSelectorField.value === 'api_name') {
    return '选择API名称';
  }
  if (activeSelectorField.value === 'api_path') {
    return '选择请求路径';
  }
  return '选择版本号';
});

/**
 * 当前激活筛选字段对应的弹框输入提示。
 */
const selectorPlaceholder = computed(() => `请输入${selectorTitle.value.replace('选择', '')}`);

/**
 * 根据后端返回的远程候选项直接渲染弹框列表。
 */
const filteredSelectorOptions = computed(() => selectorOptions.value);

/**
 * 标记弹框内是否已经输入关键字，用于控制空态文案。
 */
const hasSelectorKeyword = computed(() => Boolean(selectorKeyword.value.trim()));

/**
 * 根据弹框输入状态返回空态文案。
 */
const selectorEmptyDescription = computed(() => (
  hasSelectorKeyword.value ? '暂无匹配数据' : '请输入关键字后查询'
));

async function loadOptions() {
  try {
    const data = await fetchApiOptions();
    options.apps = data.apps;
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载应用下拉选项失败';
    ElMessage.error(message);
  }
}

async function loadData() {
  loading.value = true;
  try {
    const data = await fetchApiList(query);
    tableData.list = data.list;
    tableData.total = data.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 API 列表失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

/**
 * 按当前字段和关键字查询左前缀候选项，空关键字时清空候选列表。
 */
async function searchSelectorOptions(field: SelectorField, keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    selectorOptions.value = [];
    return;
  }

  if (field === 'app_code') {
    const data = await fetchApiAppCodeOptions(normalizedKeyword);
    selectorOptions.value = data.map((item) => ({ key: `app-code-${item}`, value: item }));
    return;
  }

  if (field === 'app_name') {
    const data = await fetchApiAppNameOptions(normalizedKeyword);
    selectorOptions.value = data.map((item) => ({ key: `app-name-${item}`, value: item }));
    return;
  }

  if (field === 'api_name') {
    const data = await fetchApiNameOptions(normalizedKeyword);
    selectorOptions.value = data.map((item) => ({ key: `api-name-${item}`, value: item }));
    return;
  }

  if (field === 'api_path') {
    const data = await fetchApiPathOptions(normalizedKeyword);
    selectorOptions.value = data.map((item) => ({ key: `api-path-${item}`, value: item }));
    return;
  }

  const data = await fetchApiVersionOptions(normalizedKeyword);
  selectorOptions.value = data.map((item) => ({ key: `version-${item}`, value: item }));
}

/**
 * 打开筛选选择弹框，候选项由用户输入关键字后再远程查询。
 */
function openSelector(field: SelectorField) {
  activeSelectorField.value = field;
  selectorKeyword.value = '';
  selectorOptions.value = [];
  selectorVisible.value = true;
}

/**
 * 选中候选项后回填查询条件，列表结果由查询按钮触发精确匹配。
 */
function selectOption(item: SearchSuggestionItem) {
  query[activeSelectorField.value] = item.value;
  selectorVisible.value = false;
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function resetQuery() {
  Object.assign(query, { page: 1, pageSize: 10, app_code: '', app_name: '', api_name: '', api_path: '', version: '' });
  loadData();
}

function handlePageSizeChange() {
  query.page = 1;
  loadData();
}

function openCreate() {
  Object.assign(createForm, { app_id: undefined, api_name: '', api_path: '', api_method: 'GET', api_description: '' });
  createVisible.value = true;
}

function openEdit(row: ApiManageItem) {
  Object.assign(editForm, {
    id: row.id,
    app_id: row.app_id,
    api_name: row.api_name,
    api_path: row.api_path,
    api_method: row.api_method,
    api_description: row.api_description
  });
  editVisible.value = true;
}

async function showDetail(row: ApiManageItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    detail.value = await fetchApiDetail(row.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 API 详情失败';
    ElMessage.error(message);
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

async function submitCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  createSubmitting.value = true;
  try {
    const { message } = await saveApi({
      app_id: createForm.app_id as number,
      api_name: createForm.api_name,
      api_path: createForm.api_path,
      api_method: createForm.api_method,
      api_description: createForm.api_description
    });
    ElMessage.success(message);
    createVisible.value = false;
    await loadData();
  } catch (error) {
    const message = error instanceof Error ? error.message : '新增 API 失败';
    ElMessage.error(message);
  } finally {
    createSubmitting.value = false;
  }
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  editSubmitting.value = true;
  try {
    const { message } = await saveApi({
      id: editForm.id,
      app_id: editForm.app_id as number,
      api_name: editForm.api_name,
      api_path: editForm.api_path,
      api_method: editForm.api_method,
      api_description: editForm.api_description
    });
    ElMessage.success(message);
    editVisible.value = false;
    await loadData();
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新 API 失败';
    ElMessage.error(message);
  } finally {
    editSubmitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadOptions(), loadData()]);
});

watch(selectorKeyword, (keyword) => {
  if (!selectorVisible.value) {
    return;
  }

  if (selectorSearchTimer) {
    clearTimeout(selectorSearchTimer);
  }

  selectorSearchTimer = setTimeout(() => {
    searchSelectorOptions(activeSelectorField.value, keyword);
  }, 200);
});

/**
 * 关闭弹框时清空输入和候选项，避免下次打开时残留上一个字段的查询状态。
 */
watch(selectorVisible, (visible) => {
  if (!visible) {
    selectorKeyword.value = '';
    selectorOptions.value = [];
    if (selectorSearchTimer) {
      clearTimeout(selectorSearchTimer);
      selectorSearchTimer = null;
    }
  }
});
</script>

<style scoped>
.api-list-page {
  min-width: 0;
}

.detail-wrapper {
  min-height: 180px;
}

.selector-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-summary {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.selector-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.selector-item {
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  text-align: left;
  cursor: pointer;
}

.selector-item:nth-child(2n) {
  border-right: 0;
}

.selector-item:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.selector-item:hover {
  background: var(--el-fill-color-light);
}

.selector-item-main {
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 22px;
  white-space: normal;
  word-break: break-word;
}

.selector-item-sub {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  white-space: normal;
  word-break: break-word;
}
</style>
