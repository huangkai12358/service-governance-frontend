<template>
  <div class="page-container">
    <div class="page-title">
      <h2>APP 管理</h2>
      <p>管理应用编码、应用名称、应用说明以及当前版本号。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增 APP</el-button>
        </div>
      </div>
      <el-table :data="tableData.list" border>
        <el-table-column prop="app_code" label="应用编码" width="180" />
        <el-table-column prop="app_name" label="应用名称" width="150" />
        <el-table-column prop="app_description" label="应用说明" min-width="240" />
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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="tableData.total"
          @current-change="loadData"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="createVisible" title="新增 APP" width="640px">
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

    <el-dialog v-model="editVisible" title="编辑 APP" width="640px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="应用名称" prop="app_name"><el-input v-model="editForm.app_name" /></el-form-item>
        <el-form-item label="应用说明"><el-input v-model="editForm.app_description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="APP 详情" size="760px">
      <template #header>
        <div class="drawer-header">
          <span>APP 详情</span>
          <el-button type="primary" @click="exportDetailToExcel" :disabled="!detail">导出为Excel</el-button>
        </div>
      </template>

      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="应用编码">{{ detail.app_code }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ detail.app_name }}</el-descriptions-item>
        <el-descriptions-item label="应用说明">{{ detail.app_description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前版本号">{{ detail.current_version }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-head">
        <h3 class="section-title">包含的所有 API</h3>
      </div>
      <el-table :data="pagedDetailApis" border>
        <el-table-column prop="api_name" label="API 名称" min-width="160" />
        <el-table-column prop="api_path" label="请求路径" min-width="240" />
        <el-table-column prop="api_method" label="请求方法" width="120" />
      </el-table>
      <div class="drawer-pagination">
        <el-pagination
          v-model:current-page="detailQuery.page"
          v-model:page-size="detailQuery.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="detailApis.length"
          @size-change="handleDetailPageSizeChange"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { deleteApp, fetchAppList, saveApp } from '@/mock/app';
import { apis } from '@/mock/base';

const query = reactive({ page: 1, pageSize: 10, app_code: '', app_name: '' });
const detailQuery = reactive({ page: 1, pageSize: 10 });
const tableData = reactive({ list: [] as any[], total: 0 });
const detailVisible = ref(false);
const createVisible = ref(false);
const editVisible = ref(false);
const detail = ref<any>(null);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const createForm = reactive({ app_code: '', app_name: '', app_description: '' });
const editForm = reactive<any>({ id: 0, app_name: '', app_description: '' });
const allApis = ref<any[]>([]);

const detailApis = computed(() =>
  allApis.value.filter((item) => item.app_code === detail.value?.app_code && item.is_deleted === 0)
);

const pagedDetailApis = computed(() => {
  const start = (detailQuery.page - 1) * detailQuery.pageSize;
  return detailApis.value.slice(start, start + detailQuery.pageSize);
});

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

function handlePageSizeChange() {
  query.page = 1;
  loadData();
}

function handleDetailPageSizeChange() {
  detailQuery.page = 1;
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
  Object.assign(detailQuery, { page: 1, pageSize: 10 });
  detailVisible.value = true;
}

function exportDetailToExcel() {
  if (!detail.value) return;

  const headers = ['应用编码', '应用名称', '应用说明', '当前版本号', 'API名称', '请求路径', '请求方法'];
  const rows = detailApis.value.map((item) => [
    detail.value.app_code,
    detail.value.app_name,
    detail.value.app_description || '',
    detail.value.current_version,
    item.api_name,
    item.api_path,
    item.api_method
  ]);

  const escapeCell = (value: unknown) => {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  };

  const csvContent = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${detail.value.app_code}-detail-export.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

onMounted(async () => {
  allApis.value = apis;
});
</script>

<style scoped>
.drawer-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.section-title {
  margin: 0 0 12px;
}

.drawer-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
