<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <h2>单个应用授权</h2>
        <p>按调用方应用编码和被调用方应用编码管理单应用 API 授权关系。</p>
      </div>
    </div>

    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item>
        <el-button type="primary" @click="exportToExcel">导出为Excel</el-button>
      </el-form-item>
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
      <template #actions>
        <el-button type="primary" @click="openCreateDialog">新增授权</el-button>
      </template>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <template v-if="list.length">
        <el-table :data="pagedList" border>
          <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
          <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
          <el-table-column label="授权的 API 列表" min-width="320">
            <template #default="{ row }">
              <el-tag v-for="path in row.api_paths" :key="path" style="margin-right:8px">{{ path }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" @click="openEditor(row.id)">修改</el-button>
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

      <el-empty v-else :description="emptyDescription">
        <el-button type="primary" @click="openCreateDialog">新增授权</el-button>
      </el-empty>
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
                placeholder="请选择调用方应用"
                :disabled="dialogMode === 'edit'"
              >
                <el-option
                  v-for="app in appOptions"
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
                placeholder="请选择被调用方应用"
                :disabled="dialogMode === 'edit'"
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
            <span v-if="dialogMode === 'edit'" class="text-muted">若撤销至 0 个 API，保存后将删除该授权关系</span>
          </div>
        </div>

        <div class="auth-editor">
          <div class="editor-column">
            <h3 class="section-title">API 列表</h3>
            <el-input v-model="apiKeyword" clearable placeholder="搜索 API 名称或请求路径" />
            <el-checkbox-group v-model="checkedApiIds" class="api-checkbox-list">
              <el-checkbox v-for="item in filteredApis" :key="item.id" :label="item.id">
                <span class="option-title">{{ item.api_name }}</span>
                <span class="option-subtitle">{{ item.api_path }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="editor-column">
            <h3 class="section-title">从分组中选择</h3>
            <el-collapse v-model="activeGroups">
              <el-collapse-item v-for="group in editorData.api_groups" :key="group.id" :name="group.id">
                <template #title>
                  <div class="group-title">
                    <el-checkbox
                      :model-value="isGroupChecked(group)"
                      :indeterminate="isGroupIndeterminate(group)"
                      @click.stop
                      @change="toggleGroup(group, $event)"
                    />
                    <span class="group-name">{{ group.api_group_name }}</span>
                  </div>
                </template>
                <el-checkbox-group v-model="checkedApiIds" class="group-api-list">
                  <el-checkbox v-for="api in getGroupApis(group)" :key="api.id" :label="api.id">
                    <span class="option-title">{{ api.api_name }}</span>
                    <span class="option-subtitle">{{ api.api_path }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </el-collapse-item>
            </el-collapse>
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
                <el-tag v-for="path in delta.added_api_paths" :key="path" type="success">{{ path }}</el-tag>
                <span v-if="!delta.added_api_paths.length" class="empty-text">无新增权限</span>
              </div>
            </div>
            <div class="change-section">
              <div class="change-section-title warning-title">撤销权限</div>
              <div class="change-tags">
                <el-tag v-for="path in delta.revoked_api_paths" :key="path" type="warning">{{ path }}</el-tag>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import {
  calcAuthorizationDelta,
  fetchSingleAppAuthEditor,
  fetchSingleAppAuthList,
  fetchSingleAppAuthorizationCreator,
  fetchSingleAppAuthorizationOptions,
  saveSingleAppAuthorization
} from '@/mock/auth';
import type { AuthorizationAppOption, AuthorizationEditorData, SingleAppAuthorization } from '@/types/business';

type DialogMode = 'create' | 'edit';

const query = reactive({ caller_app_code: '', callee_app_code: '' });
const list = ref<SingleAppAuthorization[]>([]);
const visible = ref(false);
const dialogTitle = ref('修改授权');
const dialogMode = ref<DialogMode>('edit');
const appOptions = ref<AuthorizationAppOption[]>([]);
const editorData = ref<AuthorizationEditorData | null>(null);
const editingId = ref<number>();
const originalApiIds = ref<number[]>([]);
const checkedApiIds = ref<number[]>([]);
const pagination = reactive({ page: 1, pageSize: 10 });
const activeGroups = ref<number[]>([]);
const apiKeyword = ref('');
const form = reactive({ caller_app_code: '', callee_app_code: '' });

const delta = computed(() => calcAuthorizationDelta(originalApiIds.value, checkedApiIds.value));
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});
const filteredApis = computed(() => {
  const keyword = apiKeyword.value.trim();
  const source = editorData.value?.apis || [];
  return source.filter((api) => !keyword || api.api_name.includes(keyword) || api.api_path.includes(keyword));
});
const calleeAppOptions = computed(() =>
  appOptions.value.filter((item) => item.app_code !== form.caller_app_code)
);
const hasQueryCondition = computed(() => Boolean(query.caller_app_code || query.callee_app_code));
const emptyDescription = computed(() =>
  hasQueryCondition.value ? '未找到匹配的授权关系，可点击“新增授权”开始配置' : '当前没有授权关系，可点击“新增授权”开始配置'
);

async function loadData() {
  const { data } = await fetchSingleAppAuthList(query);
  list.value = data;
  if (pagination.page > Math.max(1, Math.ceil(list.value.length / pagination.pageSize))) {
    pagination.page = 1;
  }
}

function resetQuery() {
  Object.assign(query, { caller_app_code: '', callee_app_code: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

function resetEditorState() {
  originalApiIds.value = [];
  checkedApiIds.value = [];
  activeGroups.value = [];
  apiKeyword.value = '';
}

function applyEditorData(data: AuthorizationEditorData, checkedIds?: number[]) {
  editorData.value = data;
  const nextCheckedIds = checkedIds ? [...checkedIds] : [...data.checked_api_ids];
  originalApiIds.value = dialogMode.value === 'edit' ? [...nextCheckedIds] : [];
  checkedApiIds.value = [...nextCheckedIds];
  activeGroups.value = [];
  apiKeyword.value = '';
}

async function openCreateDialog() {
  resetEditorState();
  dialogMode.value = 'create';
  dialogTitle.value = '新增授权';
  editingId.value = undefined;

  const { data } = await fetchSingleAppAuthorizationCreator();
  appOptions.value = data.app_options;
  form.caller_app_code = data.app_options[0]?.app_code || '';
  form.callee_app_code = data.app_options.find((item) => item.app_code !== form.caller_app_code)?.app_code || '';

  if (form.callee_app_code) {
    const optionsResponse = await fetchSingleAppAuthorizationOptions(form.callee_app_code);
    applyEditorData(optionsResponse.data);
  } else {
    applyEditorData(data.data, []);
  }

  visible.value = true;
}

async function openEditor(id: number) {
  resetEditorState();
  dialogMode.value = 'edit';
  dialogTitle.value = '修改授权';
  editingId.value = id;

  const { data } = await fetchSingleAppAuthEditor(id);
  appOptions.value = data.app_options;
  form.caller_app_code = data.current?.caller_app_code || '';
  form.callee_app_code = data.current?.callee_app_code || '';
  applyEditorData(data.data);
  visible.value = true;
}

async function handleCalleeChange() {
  // 新增场景切换被调用方时，需要重新装载该应用下可授权的 API 和分组。
  if (!form.callee_app_code) {
    applyEditorData({ apis: [], api_groups: [], checked_api_ids: [], checked_group_ids: [] }, []);
    return;
  }

  const { data } = await fetchSingleAppAuthorizationOptions(form.callee_app_code);
  applyEditorData(data, []);
}

function getGroupApis(group: AuthorizationEditorData['api_groups'][number]) {
  return editorData.value?.apis.filter((item) => group.api_ids.includes(item.id)) || [];
}

function isGroupChecked(group: AuthorizationEditorData['api_groups'][number]) {
  return group.api_ids.length > 0 && group.api_ids.every((id) => checkedApiIds.value.includes(id));
}

function isGroupIndeterminate(group: AuthorizationEditorData['api_groups'][number]) {
  const count = group.api_ids.filter((id) => checkedApiIds.value.includes(id)).length;
  return count > 0 && count < group.api_ids.length;
}

function toggleGroup(group: AuthorizationEditorData['api_groups'][number], checked: string | number | boolean) {
  const next = new Set(checkedApiIds.value);
  if (checked) {
    group.api_ids.forEach((id) => next.add(id));
  } else {
    group.api_ids.forEach((id) => next.delete(id));
  }
  checkedApiIds.value = Array.from(next);
}

async function exportToExcel() {
  const headers = ['调用方应用编码', '被调用方应用编码', '授权的API列表'];
  const rows = list.value.map((item) => [
    item.caller_app_code,
    item.callee_app_code,
    item.api_paths.join(', ')
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' +
    headers.join(',') + '\n' +
    rows.map((item) => item.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'authorization_export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

  if (dialogMode.value === 'create' && form.caller_app_code === form.callee_app_code) {
    ElMessage.warning('调用方应用和被调用方应用不能相同');
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

.auth-editor {
  display: grid;
  grid-template-columns: 1fr 1.15fr 0.9fr;
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
</style>
