<template>
  <div class="page-container">
    <div class="page-title">
      <h2>API列表</h2>
      <p>按应用编码、应用名称、API名称、请求路径和版本号管理 API 资产。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
      <el-form-item label="API名称"><el-input v-model="query.api_name" clearable /></el-form-item>
      <el-form-item label="请求路径"><el-input v-model="query.api_path" clearable /></el-form-item>
      <el-form-item label="版本号"><el-input v-model="query.api_version_id" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增API</el-button>
        </div>
      </div>
      <el-table :data="tableData.list" border>
        <el-table-column prop="app_code" label="应用编码" width="160" />
        <el-table-column prop="app_name" label="应用名称" width="140" />
        <el-table-column prop="api_name" label="API名称" min-width="160" />
        <el-table-column prop="api_path" label="请求路径" min-width="240" />
        <el-table-column prop="api_method" label="请求方法" width="110" />
        <el-table-column prop="api_version_id" label="版本号" width="120" />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="update_time" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, prev, pager, next"
          :total="tableData.total"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="createVisible" title="新增API" width="680px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-form-item label="所属应用编码" prop="app_code">
          <el-select v-model="createForm.app_code" style="width:100%" filterable>
            <el-option v-for="app in options.apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.app_code" />
          </el-select>
        </el-form-item>
        <el-form-item label="API名称" prop="api_name"><el-input v-model="createForm.api_name" /></el-form-item>
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
        <el-form-item label="所在的API分组">
          <el-select v-model="createForm.api_group_ids" multiple collapse-tags style="width:100%">
            <el-option v-for="group in currentAppGroups" :key="group.id" :label="group.api_group_name" :value="group.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑API" width="680px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="API名称" prop="api_name"><el-input v-model="editForm.api_name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.api_description" type="textarea" /></el-form-item>
        <el-form-item label="所在的API分组">
          <el-select v-model="editForm.api_group_ids" multiple collapse-tags style="width:100%">
            <el-option v-for="group in currentEditGroups" :key="group.id" :label="group.api_group_name" :value="group.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="API详情" size="560px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="请求路径">{{ detail.api_path }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detail.api_description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所在的API分组">
          <el-tag v-for="group in detail.api_group_names" :key="group" style="margin-right:8px">{{ group }}</el-tag>
          <span v-if="!detail.api_group_names.length">未分组</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { deleteApi, fetchApiList, fetchApiOptions, saveApi } from '@/mock/api';

const query = reactive({ page: 1, pageSize: 10, app_code: '', app_name: '', api_name: '', api_path: '', api_version_id: '' });
const tableData = reactive({ list: [] as any[], total: 0 });
const options = reactive({ apps: [] as any[], apiGroups: [] as any[] });
const detailVisible = ref(false);
const createVisible = ref(false);
const editVisible = ref(false);
const detail = ref<any>(null);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();

const createForm = reactive<any>({
  app_code: '',
  api_name: '',
  api_path: '',
  api_method: 'GET',
  api_description: '',
  api_group_ids: []
});

const editForm = reactive<any>({
  id: '',
  app_code: '',
  api_name: '',
  api_description: '',
  api_group_ids: []
});

const createRules: FormRules = {
  app_code: [{ required: true, message: '请选择所属应用编码', trigger: 'change' }],
  api_name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }],
  api_path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  api_method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
};

const editRules: FormRules = {
  api_name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }]
};

const currentAppGroups = computed(() => options.apiGroups.filter((item) => item.app_code === createForm.app_code));
const currentEditGroups = computed(() => options.apiGroups.filter((item) => item.app_code === editForm.app_code));

async function loadOptions() {
  const { data } = await fetchApiOptions();
  options.apps = data.apps;
  options.apiGroups = data.apiGroups;
}

async function loadData() {
  const { data } = await fetchApiList(query);
  tableData.list = data.list;
  tableData.total = data.total;
}

function resetQuery() {
  Object.assign(query, { page: 1, pageSize: 10, app_code: '', app_name: '', api_name: '', api_path: '', api_version_id: '' });
  loadData();
}

function openCreate() {
  Object.assign(createForm, { app_code: '', api_name: '', api_path: '', api_method: 'GET', api_description: '', api_group_ids: [] });
  createVisible.value = true;
}

function openEdit(row: any) {
  Object.assign(editForm, row);
  editVisible.value = true;
}

function showDetail(row: any) {
  detail.value = row;
  detailVisible.value = true;
}

async function submitCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  const { message } = await saveApi();
  ElMessage.success(message);
  createVisible.value = false;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  const { message } = await saveApi();
  ElMessage.success(message);
  editVisible.value = false;
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除 API「${row.api_name}」吗？这会执行逻辑删除。`, '删除确认', { type: 'warning' });
  const { message } = await deleteApi();
  ElMessage.success(`${message}，is_deleted 已设为 1`);
}

onMounted(async () => {
  await loadOptions();
  await loadData();
});
</script>
