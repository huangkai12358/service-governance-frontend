<template>
  <div class="page-container">
    <div class="page-title">
      <h2>APP 分组</h2>
      <p>管理 APP 分组名称、分组说明以及分组下包含的 APP。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="分组名称"><el-input v-model="query.app_group_name" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增分组</el-button>
        </div>
      </div>
      <el-table :data="pagedList" border>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-tag v-for="code in row.app_codes" :key="code" style="margin-right:8px">{{ code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="app_group_name" label="分组名称" width="180" />
        <el-table-column prop="app_group_description" label="分组说明" min-width="260" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="openBind(row)">修改组内 APP</el-button>
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

    <el-dialog v-model="visible" :title="mode === 'create' ? '新增分组' : mode === 'edit' ? '编辑分组' : '修改组内 APP'" :width="mode === 'bind' ? '980px' : '680px'">
      <el-form :model="form" label-width="100px">
        <template v-if="mode === 'create'">
          <el-form-item label="分组名称"><el-input v-model="form.app_group_name" /></el-form-item>
          <el-form-item label="分组说明"><el-input v-model="form.app_group_description" type="textarea" /></el-form-item>
        </template>
        <template v-else-if="mode === 'edit'">
          <el-form-item label="分组名称"><el-input v-model="form.app_group_name" /></el-form-item>
          <el-form-item label="分组说明"><el-input v-model="form.app_group_description" type="textarea" /></el-form-item>
        </template>
        <template v-else>
          <el-form-item label="APP 列表">
            <div class="bind-editor">
              <div class="bind-panel">
                <el-input v-model="appKeyword" clearable placeholder="搜索 APP 编码或名称" />
                <el-checkbox-group v-model="form.app_codes" class="checkbox-list">
                  <el-checkbox v-for="app in filteredApps" :key="app.id" :label="app.app_code">
                    <span class="option-title">{{ app.app_name }}</span>
                    <span class="option-subtitle">{{ app.app_code }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="change-preview">
                <div class="change-summary">
                  <span>总计</span>
                  <el-tag>共 {{ form.app_codes.length }} 个</el-tag>
                  <el-tag type="success">新增 {{ addedApps.length }} 个</el-tag>
                  <el-tag type="danger">删除 {{ removedApps.length }} 个</el-tag>
                </div>
                <div class="change-section">
                  <div class="change-section-title success-title">新增 APP</div>
                  <div class="change-tags">
                    <el-tag v-for="app in addedApps" :key="app.id" type="success">{{ app.app_code }}</el-tag>
                    <span v-if="!addedApps.length" class="empty-text">无新增 APP</span>
                  </div>
                </div>
                <div class="change-section">
                  <div class="change-section-title danger-title">删除 APP</div>
                  <div class="change-tags">
                    <el-tag v-for="app in removedApps" :key="app.id" type="danger">{{ app.app_code }}</el-tag>
                    <span v-if="!removedApps.length" class="empty-text">无删除 APP</span>
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
import { deleteAppGroup, fetchAppGroupList, saveAppGroup } from '@/mock/group';

const query = reactive({ app_group_name: '' });
const list = ref<any[]>([]);
const apps = ref<any[]>([]);
const visible = ref(false);
const mode = ref<'create' | 'edit' | 'bind'>('create');
const form = reactive<any>({ id: 0, app_group_name: '', app_group_description: '', app_codes: [] });
const originalAppCodes = ref<string[]>([]);
const appKeyword = ref('');
const filteredApps = computed(() => apps.value.filter((app) => {
  const keyword = appKeyword.value.trim();
  return !keyword || app.app_code.includes(keyword) || app.app_name.includes(keyword);
}));
const addedApps = computed(() => apps.value.filter((app) => form.app_codes.includes(app.app_code) && !originalAppCodes.value.includes(app.app_code)));
const removedApps = computed(() => apps.value.filter((app) => originalAppCodes.value.includes(app.app_code) && !form.app_codes.includes(app.app_code)));
const pagination = reactive({ page: 1, pageSize: 10 });
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchAppGroupList(query);
  list.value = data.list;
  apps.value = data.apps;
}

function resetQuery() {
  Object.assign(query, { app_group_name: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

function openCreate() {
  mode.value = 'create';
  originalAppCodes.value = [];
  appKeyword.value = '';
  Object.assign(form, { id: 0, app_group_name: '', app_group_description: '', app_codes: [] });
  visible.value = true;
}

function openEdit(row: any) {
  mode.value = 'edit';
  originalAppCodes.value = [];
  appKeyword.value = '';
  Object.assign(form, row);
  visible.value = true;
}

function openBind(row: any) {
  mode.value = 'bind';
  Object.assign(form, row);
  form.app_codes = [...row.app_codes];
  originalAppCodes.value = [...row.app_codes];
  appKeyword.value = '';
  visible.value = true;
}

async function save() {
  const { message } = await saveAppGroup();
  ElMessage.success(message);
  visible.value = false;
}

async function removeGroup(row: any) {
  await ElMessageBox.confirm(`确认删除分组「${row.app_group_name}」吗？`, '删除确认', { type: 'warning' });
  const { message } = await deleteAppGroup();
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
