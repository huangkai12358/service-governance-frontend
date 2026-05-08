<template>
  <div class="page-container">
    <div class="page-title">
      <h2>SmartDoc 导入历史记录</h2>
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
    <el-card class="panel-card smartdoc-log-card" shadow="never">
      <el-table :data="list" border class="smartdoc-log-table">
        <el-table-column label="日志 ID" width="80">
          <template #default="{ row }">{{ row.api_version_id.toString() }}</template>
        </el-table-column>
        <el-table-column prop="app_code" label="应用编码" width="140" />
        <el-table-column prop="app_name" label="应用名称" width="180" />
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column prop="file_name" label="导入的 Smart Doc 文件名" min-width="180" />
        <el-table-column prop="file_path" label="Linux 文件系统中的存储路径" min-width="220" />
        <el-table-column prop="remark" label="导入说明或备注" min-width="160" />
        <el-table-column prop="importer_name" label="导入人" width="120" />
        <el-table-column prop="create_time" label="导入时间" width="160" />
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @current-change="loadData"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

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
import PageSearch from '@/components/PageSearch.vue';
import {
  fetchSmartDocImportAppCodeOptions,
  fetchSmartDocImportAppNameOptions,
  fetchSmartDocImportLogPage,
  fetchSmartDocImportVersionOptions,
  type SmartDocImportLogItem
} from '@/api/logs';

interface SearchSuggestionItem {
  key: string;
  value: string;
  meta?: string;
}

type SelectorField = 'app_code' | 'app_name' | 'version';

const query = reactive({ app_code: '', app_name: '', version: '' });
const list = ref<SmartDocImportLogItem[]>([]);
const total = ref(0);
const pagination = reactive({ page: 1, pageSize: 10 });
const selectorOptions = ref<SearchSuggestionItem[]>([]);
const selectorVisible = ref(false);
const activeSelectorField = ref<SelectorField>('app_code');
const selectorKeyword = ref('');
let selectorSearchTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 当前激活字段对应的弹框标题。
 */
const selectorTitle = computed(() => {
  if (activeSelectorField.value === 'app_code') {
    return '选择应用编码';
  }
  if (activeSelectorField.value === 'app_name') {
    return '选择应用名称';
  }
  return '选择版本号';
});

/**
 * 当前激活字段对应的弹框搜索提示语。
 */
const selectorPlaceholder = computed(() => `请输入${selectorTitle.value.replace('选择', '')}`);

/**
 * 根据当前远程查询结果直接渲染候选项。
 */
const filteredSelectorOptions = computed(() => selectorOptions.value);

/**
 * 标记弹框内是否已经输入关键字，用于区分空态提示文案。
 */
const hasSelectorKeyword = computed(() => Boolean(selectorKeyword.value.trim()));

/**
 * 根据输入状态返回对应空态提示，避免未输入时误导为无数据。
 */
const selectorEmptyDescription = computed(() => (
  hasSelectorKeyword.value ? '暂无匹配数据' : '请输入关键字后查询'
));

/**
 * 按字段和关键字调用对应远程接口，空关键字时直接清空候选，避免一开始返回全量。
 */
async function searchSelectorOptions(field: SelectorField, keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    selectorOptions.value = [];
    return;
  }

  if (field === 'app_code') {
    const options = await fetchSmartDocImportAppCodeOptions(normalizedKeyword);
    selectorOptions.value = options.map((item) => ({
      key: `app-code-${item}`,
      value: item
    }));
    return;
  }

  if (field === 'app_name') {
    const options = await fetchSmartDocImportAppNameOptions(normalizedKeyword);
    selectorOptions.value = options.map((item) => ({
      key: `app-name-${item}`,
      value: item
    }));
    return;
  }

  const options = await fetchSmartDocImportVersionOptions(normalizedKeyword);
  selectorOptions.value = options.map((item) => ({
    key: `version-${item}`,
    value: item
  }));
}

/**
 * 打开字段选择弹框时不做全量预加载，只在用户输入后再远程查询。
 */
function openSelector(field: SelectorField) {
  activeSelectorField.value = field;
  selectorKeyword.value = '';
  selectorOptions.value = [];
  selectorVisible.value = true;
}

/**
 * 单击候选项后立即回填并关闭弹框，保持筛选操作路径简洁。
 */
function selectOption(item: SearchSuggestionItem) {
  query[activeSelectorField.value] = item.value;
  selectorVisible.value = false;
}

/**
 * 按当前筛选条件加载日志列表，候选选择完成后由查询按钮触发精确筛选。
 */
async function loadData() {
  const data = await fetchSmartDocImportLogPage({
    page: pagination.page,
    pageSize: pagination.pageSize,
    app_code: query.app_code,
    app_name: query.app_name,
    version: query.version
  });
  list.value = data.list;
  total.value = data.total;
}

/**
 * 执行查询前回到第一页，避免沿用旧页码导致结果页为空。
 */
function handleSearch() {
  pagination.page = 1;
  loadData();
}

/**
 * 重置三个筛选条件后重新查询第一页数据。
 */
function resetQuery() {
  Object.assign(query, { app_code: '', app_name: '', version: '' });
  pagination.page = 1;
  loadData();
}

/**
 * 分页大小变化后重新加载第一页，保持分页状态一致。
 */
function handlePageSizeChange() {
  pagination.page = 1;
  loadData();
}

onMounted(async () => {
  await loadData();
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
 * 关闭弹框时清空输入和候选，避免不同字段之间残留上一次查询状态。
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
.smartdoc-log-card,
.smartdoc-log-table {
  min-width: 0;
  width: 100%;
}

.smartdoc-log-table :deep(.cell) {
  white-space: normal;
  word-break: break-word;
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
}

.selector-item-sub {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
