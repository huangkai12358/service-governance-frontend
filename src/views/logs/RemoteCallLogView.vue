<template>
  <div class="page-container">
    <div class="page-title">
      <h2>远程调用历史记录</h2>
    </div>
    <PageSearch :model="query" @search="handleSearch" @reset="resetQuery">
      <el-form-item label="调用方应用编码">
        <el-input
          v-model="query.caller_app_code"
          clearable
          readonly
          @clear="query.caller_app_code = ''"
          @click="openSelector('caller_app_code')"
        />
      </el-form-item>
      <el-form-item label="调用方应用名称">
        <el-input
          v-model="query.caller_app_name"
          clearable
          readonly
          @clear="query.caller_app_name = ''"
          @click="openSelector('caller_app_name')"
        />
      </el-form-item>
      <el-form-item label="被调用方应用编码">
        <el-input
          v-model="query.callee_app_code"
          clearable
          readonly
          @clear="query.callee_app_code = ''"
          @click="openSelector('callee_app_code')"
        />
      </el-form-item>
      <el-form-item label="被调用方应用名称">
        <el-input
          v-model="query.callee_app_name"
          clearable
          readonly
          @clear="query.callee_app_name = ''"
          @click="openSelector('callee_app_name')"
        />
      </el-form-item>
      <el-form-item label="结果">
        <el-select v-model="query.result" clearable style="width:160px">
          <el-option label="SUCCESS" value="SUCCESS" />
          <el-option label="FAIL" value="FAIL" />
          <el-option label="BYPASS" value="BYPASS" />
        </el-select>
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column label="日志 ID" width="80">
          <template #default="{ row }">{{ row.call_decision_log_id.toString() }}</template>
        </el-table-column>
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="caller_app_name" label="调用方应用名称" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column prop="callee_app_name" label="被调用方应用名称" width="180" />
        <el-table-column label="结果" width="120">
          <template #default="{ row }"><StatusTag :value="row.result" /></template>
        </el-table-column>
        <el-table-column prop="decision_reason" label="判定原因" min-width="320" />
        <el-table-column prop="log_time" label="日志时间" width="180" />
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
import StatusTag from '@/components/StatusTag.vue';
import {
  fetchRemoteCallCalleeAppCodeOptions,
  fetchRemoteCallCalleeAppNameOptions,
  fetchRemoteCallCallerAppCodeOptions,
  fetchRemoteCallCallerAppNameOptions,
  fetchRemoteCallLogPage,
  type RemoteCallLogItem
} from '@/api/logs';

interface SearchSuggestionItem {
  key: string;
  value: string;
  meta?: string;
}

type SelectorField =
  | 'caller_app_code'
  | 'caller_app_name'
  | 'callee_app_code'
  | 'callee_app_name';

const query = reactive({
  caller_app_code: '',
  caller_app_name: '',
  callee_app_code: '',
  callee_app_name: '',
  result: '' as '' | 'SUCCESS' | 'FAIL' | 'BYPASS'
});
const list = ref<RemoteCallLogItem[]>([]);
const total = ref(0);
const pagination = reactive({ page: 1, pageSize: 10 });
const selectorOptions = ref<SearchSuggestionItem[]>([]);
const selectorVisible = ref(false);
const activeSelectorField = ref<SelectorField>('caller_app_code');
const selectorKeyword = ref('');
let selectorSearchTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 当前激活字段对应的弹框标题。
 */
const selectorTitle = computed(() => {
  if (activeSelectorField.value === 'caller_app_code') {
    return '选择调用方应用编码';
  }
  if (activeSelectorField.value === 'caller_app_name') {
    return '选择调用方应用名称';
  }
  if (activeSelectorField.value === 'callee_app_code') {
    return '选择被调用方应用编码';
  }
  return '选择被调用方应用名称';
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

  if (field === 'caller_app_code') {
    const options = await fetchRemoteCallCallerAppCodeOptions(normalizedKeyword);
    selectorOptions.value = options.map((item) => ({ key: `caller-app-code-${item}`, value: item }));
    return;
  }

  if (field === 'caller_app_name') {
    const options = await fetchRemoteCallCallerAppNameOptions(normalizedKeyword);
    selectorOptions.value = options.map((item) => ({ key: `caller-app-name-${item}`, value: item }));
    return;
  }

  if (field === 'callee_app_code') {
    const options = await fetchRemoteCallCalleeAppCodeOptions(normalizedKeyword);
    selectorOptions.value = options.map((item) => ({ key: `callee-app-code-${item}`, value: item }));
    return;
  }

  const options = await fetchRemoteCallCalleeAppNameOptions(normalizedKeyword);
  selectorOptions.value = options.map((item) => ({ key: `callee-app-name-${item}`, value: item }));
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
 * 按当前筛选条件加载远程调用历史记录。
 */
async function loadData() {
  const data = await fetchRemoteCallLogPage({
    page: pagination.page,
    pageSize: pagination.pageSize,
    caller_app_code: query.caller_app_code,
    caller_app_name: query.caller_app_name,
    callee_app_code: query.callee_app_code,
    callee_app_name: query.callee_app_name,
    result: query.result
  });
  list.value = data.list;
  total.value = data.total;
}

/**
 * 查询前将分页回到第一页，避免保留旧页码导致空页。
 */
function handleSearch() {
  pagination.page = 1;
  loadData();
}

function resetQuery() {
  Object.assign(query, {
    caller_app_code: '',
    caller_app_name: '',
    callee_app_code: '',
    callee_app_name: '',
    result: ''
  });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
  loadData();
}

onMounted(loadData);

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
  padding: 12px 14px;
  border: none;
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  text-align: left;
  cursor: pointer;
}

.selector-item:nth-child(2n) {
  border-right: none;
}

.selector-item:hover {
  background: var(--el-fill-color-light);
}

.selector-item-main {
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.5;
}

.selector-item-sub {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
