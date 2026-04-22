<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <h2>API管理</h2>
        <p>支持手工新增、SmartDoc 导入比对、详情查看和版本化治理。</p>
      </div>
    </div>

    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="API名称">
        <el-input v-model="query.name" placeholder="请输入 API 名称" clearable />
      </el-form-item>
      <el-form-item label="请求路径">
        <el-input v-model="query.path" placeholder="请输入请求路径" clearable />
      </el-form-item>
      <el-form-item label="所属应用">
        <el-select v-model="query.appId" placeholder="请选择" clearable style="width: 180px">
          <el-option v-for="item in options.apps" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号">
        <el-input v-model="query.version" placeholder="请输入版本号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="请选择" clearable style="width: 160px">
          <el-option label="已上线" value="ONLINE" />
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已下线" value="OFFLINE" />
        </el-select>
      </el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openEdit()">手动新增API</el-button>
          <el-button @click="router.push('/smartdoc')">SmartDoc导入</el-button>
          <el-button type="danger" plain>批量删除</el-button>
        </div>
      </div>
      <el-table :data="tableData.list" border>
        <el-table-column prop="appName" label="所属应用" min-width="120" />
        <el-table-column prop="name" label="API名称" min-width="150" />
        <el-table-column prop="path" label="请求路径" min-width="220" />
        <el-table-column prop="method" label="请求方法" width="100" />
        <el-table-column prop="version" label="版本号" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, prev, pager, next, sizes"
          :page-sizes="[5, 10, 20]"
          :total="tableData.total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="editVisible" :title="form.id ? '编辑API' : '手动新增API'" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="所属应用" prop="appId">
          <el-select v-model="form.appId" style="width: 100%">
            <el-option v-for="item in options.apps" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="API分组" prop="groupIds">
          <el-select v-model="form.groupIds" multiple collapse-tags style="width: 100%">
            <el-option v-for="item in options.apiGroups" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="API名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="请求路径" prop="path">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="form.method" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="ONLINE">已上线</el-radio>
            <el-radio label="DRAFT">草稿</el-radio>
            <el-radio label="OFFLINE">已下线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="API详情" size="720px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="请求路径">{{ detail.target.path }}</el-descriptions-item>
          <el-descriptions-item label="API名称">{{ detail.target.name }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ detail.target.description }}</el-descriptions-item>
          <el-descriptions-item label="所属应用">{{ detail.target.appName }}</el-descriptions-item>
          <el-descriptions-item label="API分组">{{ detail.target.groupNames.join('、') || '未分组' }}</el-descriptions-item>
        </el-descriptions>
        <h3 class="section-title" style="margin-top:24px">最近变更记录</h3>
        <el-timeline>
          <el-timeline-item v-for="item in detail.changes" :key="item.id" :timestamp="item.time">
            <strong>{{ item.action }}</strong>
            <p>{{ item.content }}</p>
          </el-timeline-item>
        </el-timeline>
        <h3 class="section-title">关联授权情况</h3>
        <el-table :data="detail.grants" border>
          <el-table-column prop="callerName" label="调用方" min-width="140" />
          <el-table-column prop="calleeAppName" label="被调用应用" min-width="120" />
          <el-table-column prop="resourceName" label="授权资源" min-width="160" />
          <el-table-column prop="operationType" label="操作类型" width="100">
            <template #default="{ row }"><StatusTag :value="row.operationType" /></template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { fetchApiDetail, fetchApiList, fetchApiOptions, removeApi, saveApi } from '@/mock/api';

const router = useRouter();
const formRef = ref<FormInstance>();
const detailVisible = ref(false);
const editVisible = ref(false);
const detail = ref<any>(null);
const options = reactive({ apps: [] as Array<{ label: string; value: string }>, apiGroups: [] as Array<{ label: string; value: string }> });
const query = reactive({ page: 1, pageSize: 10, name: '', path: '', appId: '', version: '', status: '' });
const tableData = reactive({ list: [] as any[], total: 0 });
const form = reactive<any>({
  id: '',
  appId: '',
  groupIds: [],
  name: '',
  description: '',
  path: '',
  method: 'GET',
  version: '',
  status: 'ONLINE'
});

const rules: FormRules = {
  appId: [{ required: true, message: '请选择所属应用', trigger: 'change' }],
  name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
};

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
  Object.assign(query, { page: 1, pageSize: 10, name: '', path: '', appId: '', version: '', status: '' });
  loadData();
}

function openEdit(row?: any) {
  Object.assign(form, row || {
    id: '',
    appId: '',
    groupIds: [],
    name: '',
    description: '',
    path: '',
    method: 'GET',
    version: '',
    status: 'ONLINE'
  });
  editVisible.value = true;
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  const { message } = await saveApi(form);
  ElMessage.success(message);
  editVisible.value = false;
  loadData();
}

async function openDetail(id: string) {
  const { data } = await fetchApiDetail(id);
  detail.value = data;
  detailVisible.value = true;
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除 API「${row.name}」吗？`, '删除确认', { type: 'warning' });
  const { message } = await removeApi(row.id);
  ElMessage.success(message);
  loadData();
}

onMounted(async () => {
  await loadOptions();
  await loadData();
});
</script>
