<template>
  <div class="page-container">
    <div class="page-title">
      <h2>API 分组</h2>
      <p>管理 API 分组名称、所属 APP 以及分组下包含的 API。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="分组名称"><el-input v-model="query.api_group_name" clearable /></el-form-item>
      <el-form-item label="所属APP"><el-input v-model="query.app_code" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增分组</el-button>
        </div>
      </div>
      <el-table :data="pagedList" border row-key="id">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-tag v-for="path in row.api_paths" :key="path" style="margin-right:8px">{{ path }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="api_group_name" label="分组名称" width="180" />
        <el-table-column prop="api_group_description" label="分组说明" min-width="240" />
        <el-table-column prop="app_code" label="所属 APP" width="180" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="openBind(row)">修改组内 API</el-button>
            <el-button link type="danger" @click="removeGroup(row)">删除</el-button>
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

    <el-dialog v-model="visible" :title="mode === 'create' ? '新增分组' : mode === 'edit' ? '编辑分组' : '修改组内 API'" :width="mode === 'bind' ? '980px' : '680px'">
      <el-form :model="form" label-width="100px">
        <template v-if="mode === 'create'">
          <el-form-item label="分组名称"><el-input v-model="form.api_group_name" /></el-form-item>
          <el-form-item label="分组说明"><el-input v-model="form.api_group_description" type="textarea" /></el-form-item>
          <el-form-item label="所属 APP"><el-select v-model="form.app_code" style="width:100%"><el-option v-for="app in apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.app_code" /></el-select></el-form-item>
        </template>
        <template v-else-if="mode === 'edit'">
          <el-form-item label="分组名称"><el-input v-model="form.api_group_name" /></el-form-item>
          <el-form-item label="分组说明"><el-input v-model="form.api_group_description" type="textarea" /></el-form-item>
        </template>
        <template v-else>
          <el-form-item label="API 列表">
            <div class="bind-editor">
              <div class="bind-panel">
                <el-input v-model="apiKeyword" clearable placeholder="搜索 API 名称或请求路径" />
                <el-checkbox-group v-model="form.api_ids" class="checkbox-list">
                  <el-checkbox v-for="api in filteredApis" :key="api.id" :label="api.id">
                    <span class="option-title">{{ api.api_name }}</span>
                    <span class="option-subtitle">{{ api.api_path }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="change-preview">
                <div class="change-summary">
                  <span>总计</span>
                  <el-tag>共 {{ form.api_ids.length }} 个</el-tag>
                  <el-tag type="success">新增 {{ addedApis.length }} 个</el-tag>
                  <el-tag type="danger">删除 {{ removedApis.length }} 个</el-tag>
                </div>
                <div class="change-section">
                  <div class="change-section-title success-title">新增 API</div>
                  <div class="change-tags">
                    <el-tag v-for="api in addedApis" :key="api.id" type="success">{{ api.api_path }}</el-tag>
                    <span v-if="!addedApis.length" class="empty-text">无新增 API</span>
                  </div>
                </div>
                <div class="change-section">
                  <div class="change-section-title danger-title">删除 API</div>
                  <div class="change-tags">
                    <el-tag v-for="api in removedApis" :key="api.id" type="danger">{{ api.api_path }}</el-tag>
                    <span v-if="!removedApis.length" class="empty-text">无删除 API</span>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { deleteApiGroup, fetchApiGroupList, saveApiGroup } from '@/mock/group';

const query = reactive({ api_group_name: '', app_code: '' });
const list = ref<any[]>([]);
const apps = ref<any[]>([]);
const apis = ref<any[]>([]);
const visible = ref(false);
const mode = ref<'create' | 'edit' | 'bind'>('create');
const form = reactive<any>({ id: 0, api_group_name: '', api_group_description: '', app_code: '', api_ids: [] });
const originalApiIds = ref<number[]>([]);
const apiKeyword = ref('');
const currentApis = computed(() => apis.value.filter((item) => item.app_code === form.app_code));
const filteredApis = computed(() => currentApis.value.filter((api) => {
  const keyword = apiKeyword.value.trim();
  return !keyword || api.api_name.includes(keyword) || api.api_path.includes(keyword);
}));
const addedApis = computed(() => currentApis.value.filter((api) => form.api_ids.includes(api.id) && !originalApiIds.value.includes(api.id)));
const removedApis = computed(() => currentApis.value.filter((api) => originalApiIds.value.includes(api.id) && !form.api_ids.includes(api.id)));
const pagination = reactive({ page: 1, pageSize: 10 });
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchApiGroupList(query);
  list.value = data.list;
  apps.value = data.apps;
  apis.value = data.apis;
}

function resetQuery() {
  Object.assign(query, { api_group_name: '', app_code: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

function openCreate() {
  mode.value = 'create';
  originalApiIds.value = [];
  apiKeyword.value = '';
  Object.assign(form, { id: 0, api_group_name: '', api_group_description: '', app_code: '', api_ids: [] });
  visible.value = true;
}

function openEdit(row: any) {
  mode.value = 'edit';
  originalApiIds.value = [];
  apiKeyword.value = '';
  Object.assign(form, row);
  visible.value = true;
}

function openBind(row: any) {
  mode.value = 'bind';
  Object.assign(form, row);
  form.api_ids = [...row.api_ids];
  originalApiIds.value = [...row.api_ids];
  apiKeyword.value = '';
  visible.value = true;
}

async function save() {
  const { message } = await saveApiGroup();
  ElMessage.success(message);
  visible.value = false;
}

async function removeGroup(row: any) {
  await ElMessageBox.confirm(`确认删除分组「${row.api_group_name}」吗？`, '删除确认', { type: 'warning' });
  const { message } = await deleteApiGroup();
  ElMessage.success(message);
}

onMounted(loadData);
</script>

<style scoped>
.bind-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  width: 100%;
}

.bind-panel,
.change-preview {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  background: #fff;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 420px;
  margin-top: 12px;
  overflow: auto;
}

.checkbox-list :deep(.el-checkbox) {
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

.change-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: #f1f5f9;
  font-weight: 700;
}

.change-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-section-title {
  font-size: 13px;
  font-weight: 700;
}

.success-title {
  color: #16a34a;
}

.danger-title {
  color: #dc2626;
}

.change-tags {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  min-height: 88px;
  max-height: 150px;
  overflow: auto;
  padding: 10px;
  border-radius: 10px;
  background: #f8fafc;
}

.empty-text {
  color: var(--sg-subtext);
}
</style>
