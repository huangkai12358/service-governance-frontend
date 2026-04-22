<template>
  <div class="page-container">
    <div class="page-title">
      <h2>APP管理</h2>
      <p>管理应用编码、应用名称、应用说明以及当前版本号。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增APP</el-button>
        </div>
      </div>
      <el-table :data="tableData.list" border>
        <el-table-column prop="app_code" label="应用编码" width="180" />
        <el-table-column prop="app_name" label="应用名称" width="150" />
        <el-table-column prop="app_description" label="应用说明" min-width="280" />
        <el-table-column prop="current_version" label="当前版本号" width="120" />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column prop="update_time" label="更新时间" width="180" />
        <el-table-column label="操作" width="180">
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

    <el-dialog v-model="createVisible" title="新增APP" width="640px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="应用编码" prop="app_code"><el-input v-model="createForm.app_code" /></el-form-item>
        <el-form-item label="应用名称" prop="app_name"><el-input v-model="createForm.app_name" /></el-form-item>
        <el-form-item label="应用说明"><el-input v-model="createForm.app_description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑APP" width="640px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="应用名称" prop="app_name"><el-input v-model="editForm.app_name" /></el-form-item>
        <el-form-item label="应用说明"><el-input v-model="editForm.app_description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="APP详情" size="520px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="应用编码">{{ detail.app_code }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ detail.app_name }}</el-descriptions-item>
        <el-descriptions-item label="应用说明">{{ detail.app_description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前版本号">{{ detail.current_version }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { deleteApp, fetchAppList, saveApp } from '@/mock/app';

const query = reactive({ page: 1, pageSize: 10, app_code: '', app_name: '' });
const tableData = reactive({ list: [] as any[], total: 0 });
const detailVisible = ref(false);
const createVisible = ref(false);
const editVisible = ref(false);
const detail = ref<any>(null);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const createForm = reactive({ app_code: '', app_name: '', app_description: '' });
const editForm = reactive<any>({ id: '', app_name: '', app_description: '' });

const createRules: FormRules = {
  app_code: [{ required: true, message: '请输入应用编码', trigger: 'blur' }],
  app_name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
};

const editRules: FormRules = {
  app_name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
};

async function loadData() {
  const { data } = await fetchAppList(query);
  tableData.list = data.list;
  tableData.total = data.total;
}

function resetQuery() {
  Object.assign(query, { page: 1, pageSize: 10, app_code: '', app_name: '' });
  loadData();
}

function openCreate() {
  Object.assign(createForm, { app_code: '', app_name: '', app_description: '' });
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
  const { message } = await saveApp();
  ElMessage.success(message);
  createVisible.value = false;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  const { message } = await saveApp();
  ElMessage.success(message);
  editVisible.value = false;
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除 APP「${row.app_name}」吗？`, '删除确认', { type: 'warning' });
  const { message } = await deleteApp();
  ElMessage.success(message);
}

onMounted(loadData);
</script>
