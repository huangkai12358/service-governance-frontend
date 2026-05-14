<template>
  <div class="page-container">
    <div class="page-title">
      <h2>APP 管理</h2>
      <p>管理应用编码、名称、密码槽位状态与基础说明。</p>
    </div>

    <PageSearch :model="query" @search="handleSearch" @reset="resetQuery">
      <el-form-item label="应用编码">
        <el-input v-model="query.app_code" clearable />
      </el-form-item>
      <el-form-item label="应用名称">
        <el-input v-model="query.app_name" clearable />
      </el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openCreate">新增 APP</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData.list" border>
        <el-table-column prop="app_code" label="应用编码" width="180" />
        <el-table-column prop="app_name" label="应用名称" width="180" />
        <el-table-column prop="app_description" label="应用说明" min-width="260" show-overflow-tooltip />
        <el-table-column label="主密码" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.has_pwd1 ? 'success' : 'info'">
              {{ row.has_pwd1 ? '已配置' : '未配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="新密码" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.has_pwd2 ? 'warning' : 'info'">
              {{ row.has_pwd2 ? '已配置' : '未配置' }}
            </el-tag>
          </template>
        </el-table-column>
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

      <div class="table-pagination">
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
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="110px">
        <el-form-item label="应用编码" prop="app_code">
          <el-input v-model="createForm.app_code" />
        </el-form-item>
        <el-form-item label="应用名称" prop="app_name">
          <el-input v-model="createForm.app_name" />
        </el-form-item>
        <el-form-item label="主密码" prop="primary_password">
          <el-input v-model="createForm.primary_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="secondary_password">
          <el-input v-model="createForm.secondary_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="应用说明">
          <el-input v-model="createForm.app_description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSubmitting" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑 APP" width="640px">

      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px">
        <el-form-item label="应用编码">
          <el-input :model-value="editForm.app_code" disabled />
        </el-form-item>
        <el-form-item label="应用名称" prop="app_name">
          <el-input v-model="editForm.app_name" />
        </el-form-item>
        <el-form-item label="应用说明">
          <el-input v-model="editForm.app_description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <div class="password-section">
        <div class="password-row">
          <div class="password-row-label">主密码</div>
          <div class="password-row-value">
            <el-tag size="small" :type="slot1TagType">{{ slot1StatusText }}</el-tag>
          </div>
          <div class="password-row-action">
            <el-button link type="danger" :disabled="!canRemoveSlot1" @click="handleRemovePassword('primary')">
              删除
            </el-button>
          </div>
        </div>

        <div class="password-row">
          <div class="password-row-label">新密码</div>
          <div class="password-row-value">
            <el-tag size="small" :type="slot2TagType">{{ slot2StatusText }}</el-tag>
          </div>
          <div class="password-row-action">
            <el-button link type="danger" :disabled="!canRemoveSlot2" @click="handleRemovePassword('secondary')">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="110px" class="password-create-form">
        <el-form-item label="新增密码" prop="password">
          <div class="password-input-group">
            <el-input
              v-model="passwordForm.password"
              type="password"
              show-password
              :disabled="!canAddPassword"
              placeholder="存在空密码槽位时可输入新密码"
            />
            <el-button type="primary" plain :disabled="!canAddPassword" @click="handleAddPassword">标记新增</el-button>
          </div>
          <div v-if="pendingPassword" class="password-tip">已标记一个待新增密码，保存后会放入第一个空密码槽位。</div>
          <div v-else-if="passwordForm.password.trim()" class="password-tip">当前已输入新密码，直接保存会提交给后端。</div>
          <div v-else-if="!canAddPassword" class="password-tip">当前没有可新增的空密码槽位。</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEdit">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="APP 详情" size="820px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="detail" :column="1" border>
          <el-descriptions-item label="应用编码">{{ detail.app_code }}</el-descriptions-item>
          <el-descriptions-item label="应用名称">{{ detail.app_name }}</el-descriptions-item>
          <el-descriptions-item label="应用说明">{{ detail.app_description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="主密码">
            <el-tag size="small" :type="detail.has_pwd1 ? 'success' : 'info'">
              {{ detail.has_pwd1 ? '已配置' : '未配置' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="新密码">
            <el-tag size="small" :type="detail.has_pwd2 ? 'warning' : 'info'">
              {{ detail.has_pwd2 ? '已配置' : '未配置' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.create_time }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.update_time }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="section-title" style="margin-bottom: 0;">包含的 API</h3>
          <el-button type="primary" size="small" :loading="exportLoading" @click="exportApisToExcel">导出为 Excel</el-button>
        </div>

        <el-table v-loading="detailApiLoading" :data="detailApiData.list" border>
          <el-table-column prop="api_name" label="API 名称" min-width="180" />
          <el-table-column prop="api_path" label="请求路径" min-width="260" />
          <el-table-column prop="api_method" label="请求方法" width="110" />
          <el-table-column prop="version" label="版本号" width="120" />
        </el-table>

        <div class="table-pagination">
          <el-pagination
            v-model:current-page="detailQuery.page"
            v-model:page-size="detailQuery.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="detailApiData.total"
            @current-change="loadDetailApis"
            @size-change="handleDetailPageSizeChange"
          />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import {
  deleteApp,
  fetchAppDetail,
  fetchAppList,
  saveApp,
  type AppManageDetail,
  type AppManageItem
} from '@/api/appManage';
import { fetchApiList, type ApiManageItem } from '@/api/apiManage';
import { getSessionToken } from '@/utils/storage';
import { createRequiredAppAuthValueValidator, validateOptionalAppAuthValue } from '@/views/app/passwordPolicy';

type PasswordSlotState = 'existing' | 'new' | 'empty';

const query = reactive({ page: 1, pageSize: 10, app_code: '', app_name: '' });
const detailQuery = reactive({ page: 1, pageSize: 10 });
const tableData = reactive({ list: [] as AppManageItem[], total: 0 });
const detailApiData = reactive({ list: [] as ApiManageItem[], total: 0 });

const loading = ref(false);
const detailLoading = ref(false);
const detailApiLoading = ref(false);
const createSubmitting = ref(false);
const editSubmitting = ref(false);

const detailVisible = ref(false);
const createVisible = ref(false);
const editVisible = ref(false);

const detail = ref<AppManageDetail | null>(null);
const createFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const createForm = reactive({
  app_code: '',
  app_name: '',
  app_description: '',
  primary_password: '',
  secondary_password: ''
});

const editForm = reactive({
  id: 0,
  app_code: '',
  app_name: '',
  app_description: '',
  initial_has_pwd1: false,
  initial_has_pwd2: false,
  delete_pwd1: false,
  delete_pwd2: false,
  slot1_state: 'empty' as PasswordSlotState,
  slot2_state: 'empty' as PasswordSlotState
});

const passwordForm = reactive({
  password: ''
});

const createRules: FormRules = {
  app_code: [{ required: true, message: '请输入应用编码', trigger: 'blur' }],
  app_name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  primary_password: [{ validator: createRequiredAppAuthValueValidator('请输入主密码'), trigger: 'blur' }],
  secondary_password: [{ validator: validateOptionalAppAuthValue, trigger: 'blur' }]
};

const editRules: FormRules = {
  app_name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
};

const passwordRules: FormRules = {
  password: [{ validator: createRequiredAppAuthValueValidator('请输入新增密码'), trigger: 'blur' }]
};

const pendingPassword = computed(() =>
  editForm.slot1_state === 'new' || editForm.slot2_state === 'new'
);

const occupiedPasswordCount = computed(() =>
  [editForm.slot1_state, editForm.slot2_state].filter((state) => state !== 'empty').length
);

const canAddPassword = computed(() =>
  !pendingPassword.value && (editForm.slot1_state === 'empty' || editForm.slot2_state === 'empty')
);

const canRemoveSlot1 = computed(() => occupiedPasswordCount.value === 2 && editForm.slot1_state !== 'empty');
const canRemoveSlot2 = computed(() => occupiedPasswordCount.value === 2 && editForm.slot2_state !== 'empty');

const slot1StatusText = computed(() => getSlotStatusText(editForm.slot1_state, 1));
const slot2StatusText = computed(() => getSlotStatusText(editForm.slot2_state, 2));
const slot1TagType = computed(() => getSlotTagType(editForm.slot1_state, 1));
const slot2TagType = computed(() => getSlotTagType(editForm.slot2_state, 2));

function getSlotStatusText(state: PasswordSlotState, slotNo: 1 | 2) {
  if (state === 'existing') {
    return '已配置';
  }
  if (state === 'new') {
    return '待新增';
  }
  return editForm[`delete_pwd${slotNo}` as const] ? '待删除' : '未配置';
}

function getSlotTagType(state: PasswordSlotState, slotNo: 1 | 2) {
  if (state === 'existing') {
    return slotNo === 1 ? 'success' : 'warning';
  }
  if (state === 'new') {
    return 'primary';
  }
  return editForm[`delete_pwd${slotNo}` as const] ? 'danger' : 'info';
}

async function loadData() {
  loading.value = true;
  try {
    const data = await fetchAppList(query);
    tableData.list = data.list;
    tableData.total = data.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 APP 列表失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
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
  loadDetailApis();
}

function openCreate() {
  Object.assign(createForm, {
    app_code: '',
    app_name: '',
    app_description: '',
    primary_password: '',
    secondary_password: ''
  });
  createVisible.value = true;
}

function openEdit(row: AppManageItem) {
  Object.assign(editForm, {
    id: row.id,
    app_code: row.app_code,
    app_name: row.app_name,
    app_description: row.app_description,
    initial_has_pwd1: row.has_pwd1,
    initial_has_pwd2: row.has_pwd2,
    delete_pwd1: false,
    delete_pwd2: false,
    slot1_state: row.has_pwd1 ? 'existing' : 'empty',
    slot2_state: row.has_pwd2 ? 'existing' : 'empty'
  });
  passwordForm.password = '';
  passwordFormRef.value?.clearValidate();
  editVisible.value = true;
}

async function loadDetailApis() {
  if (!detail.value) {
    return;
  }
  detailApiLoading.value = true;
  try {
    const data = await fetchApiList({
      page: detailQuery.page,
      pageSize: detailQuery.pageSize,
      app_code: detail.value.app_code
    });
    detailApiData.list = data.list;
    detailApiData.total = data.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 APP 关联 API 失败';
    ElMessage.error(message);
  } finally {
    detailApiLoading.value = false;
  }
}

async function showDetail(row: AppManageItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailApiData.list = [];
  detailApiData.total = 0;
  Object.assign(detailQuery, { page: 1, pageSize: 10 });

  try {
    detail.value = await fetchAppDetail(row.id);
    await loadDetailApis();
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 APP 详情失败';
    ElMessage.error(message);
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

async function submitCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  createSubmitting.value = true;
  try {
    const { message } = await saveApp({ ...createForm });
    ElMessage.success(message);
    createVisible.value = false;
    await loadData();
  } catch (error) {
    const message = error instanceof Error ? error.message : '新增 APP 失败';
    ElMessage.error(message);
  } finally {
    createSubmitting.value = false;
  }
}

async function handleAddPassword() {
  if (!canAddPassword.value) {
    return;
  }

  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (editForm.slot1_state === 'empty') {
    if (editForm.slot2_state === 'empty') {
      editForm.slot1_state = 'new';
    } else {
      // 当历史数据存在主密码空、新密码有值时，页面先压缩状态，再标记新增密码。
      editForm.slot1_state = editForm.slot2_state;
      editForm.slot2_state = 'new';
    }
  } else if (editForm.slot2_state === 'empty') {
    editForm.slot2_state = 'new';
  }

  passwordFormRef.value?.clearValidate();
}

async function handleRemovePassword(target: 'primary' | 'secondary') {
  const canRemove = target === 'primary' ? canRemoveSlot1.value : canRemoveSlot2.value;
  if (!canRemove) {
    ElMessage.warning('至少需要保留一个密码，当前不能删除。');
    return;
  }

  const passwordLabel = target === 'primary' ? '主密码' : '新密码';
  try {
    await ElMessageBox.confirm(`确认删除${passwordLabel}吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    });
  } catch {
    return;
  }

  if (target === 'primary') {
    if (editForm.slot1_state === 'empty') {
      return;
    }
    const movedSlotState = editForm.slot2_state;
    if (editForm.slot1_state === 'existing' && editForm.initial_has_pwd1) {
      editForm.delete_pwd1 = true;
    }
    if (editForm.slot1_state === 'new') {
      passwordForm.password = '';
    }
    // 主密码删除后，新密码在页面上同步前移，保持与后端保存后的槽位状态一致。
    editForm.slot1_state = movedSlotState;
    editForm.slot2_state = 'empty';
    return;
  }

  if (editForm.slot2_state === 'empty') {
    return;
  }
  if (editForm.slot2_state === 'existing' && editForm.initial_has_pwd2) {
    editForm.delete_pwd2 = true;
  }
  if (editForm.slot2_state === 'new') {
    passwordForm.password = '';
  }
  editForm.slot2_state = 'empty';
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const deletePwd1 = editForm.delete_pwd1;
  const deletePwd2 = editForm.delete_pwd2;
  const appPwd = passwordForm.password.trim() || undefined;
  if (appPwd) {
    const passwordValid = await passwordFormRef.value?.validate().catch(() => false);
    if (!passwordValid) {
      return;
    }
  }

  editSubmitting.value = true;
  try {
    const { message } = await saveApp({
      id: editForm.id,
      app_code: editForm.app_code,
      app_name: editForm.app_name,
      app_description: editForm.app_description,
      app_password: appPwd,
      delete_pwd1: deletePwd1,
      delete_pwd2: deletePwd2
    });
    ElMessage.success(message);
    editVisible.value = false;
    await loadData();
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新 APP 失败';
    ElMessage.error(message);
  } finally {
    editSubmitting.value = false;
  }
}

async function handleDelete(row: AppManageItem) {
  try {
    await ElMessageBox.confirm(`确认删除 APP「${row.app_name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    });
    const { message } = await deleteApp(row.id);
    ElMessage.success(message);
    await loadData();
  } catch (error) {
    if (error === 'cancel') {
      return;
    }
    const message = error instanceof Error ? error.message : '删除 APP 失败';
    ElMessage.error(message);
  }
}

const exportLoading = ref(false);

async function exportApisToExcel() {
  if (exportLoading.value) {
    return;
  }
  exportLoading.value = true;
  ElMessage.info('正在导出，请稍候...');

  try {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8081';
    const sessionToken = getSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['sessionToken'] = sessionToken;
    }
    const response = await fetch(`${API_BASE_URL}/api/apis/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        appCode: detail.value?.app_code || undefined
      })
    });

    if (!response.ok) {
      throw new Error(`导出失败：${response.status}`);
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    let fileName = 'API列表.xlsx';
    const match = disposition.match(/filename\*=UTF-8''(.+)/);
    if (match) {
      fileName = decodeURIComponent(match[1]);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '导出失败';
    ElMessage.error(message);
  } finally {
    exportLoading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.edit-alert {
  margin-bottom: 16px;
}

.password-section {
  margin-top: 20px;
  padding-top: 8px;
  border-top: 1px solid var(--sg-border);
}

.password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #eef2f7;
}

.password-row-label {
  min-width: 88px;
  color: var(--sg-text);
  font-weight: 600;
}

.password-row-value {
  flex: 1;
}

.password-row-action {
  display: flex;
  justify-content: flex-end;
  min-width: 96px;
}

.password-tip {
  color: var(--sg-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.password-create-form {
  margin-top: 20px;
}

.password-input-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.section-head {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 12px;
}
</style>
