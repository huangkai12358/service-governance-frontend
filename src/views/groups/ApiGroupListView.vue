<template>
  <div class="page-container">
    <div class="page-title">
      <h2>API分组</h2>
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
      <el-table :data="list" border row-key="id">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-tag v-for="path in row.api_paths" :key="path" style="margin-right:8px">{{ path }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="api_group_name" label="分组名称" width="180" />
        <el-table-column prop="api_group_description" label="分组说明" min-width="240" />
        <el-table-column prop="app_code" label="所属APP" width="180" />
        <el-table-column label="包含的API" min-width="260">
          <template #default="{ row }">{{ row.api_paths.join('，') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="openBind(row)">修改包含的api</el-button>
            <el-button link type="danger" @click="removeGroup(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="mode === 'create' ? '新增分组' : mode === 'edit' ? '编辑分组' : '修改包含的api'" width="680px">
      <el-form :model="form" label-width="100px">
        <template v-if="mode === 'create'">
          <el-form-item label="分组名称"><el-input v-model="form.api_group_name" /></el-form-item>
          <el-form-item label="分组说明"><el-input v-model="form.api_group_description" type="textarea" /></el-form-item>
          <el-form-item label="所属APP"><el-select v-model="form.app_code" style="width:100%"><el-option v-for="app in apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.app_code" /></el-select></el-form-item>
        </template>
        <template v-else-if="mode === 'edit'">
          <el-form-item label="分组名称"><el-input v-model="form.api_group_name" /></el-form-item>
        </template>
        <template v-else>
          <el-form-item label="包含API">
            <el-select v-model="form.api_ids" multiple filterable style="width:100%">
              <el-option v-for="api in currentApis" :key="api.id" :label="`${api.api_name} / ${api.api_path}`" :value="api.id" />
            </el-select>
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
const form = reactive<any>({ id: '', api_group_name: '', api_group_description: '', app_code: '', api_ids: [] });
const currentApis = computed(() => apis.value.filter((item) => item.app_code === form.app_code));

async function loadData() {
  const { data } = await fetchApiGroupList(query);
  list.value = data.list;
  apps.value = data.apps;
  apis.value = data.apis;
}

function resetQuery() {
  Object.assign(query, { api_group_name: '', app_code: '' });
  loadData();
}

function openCreate() {
  mode.value = 'create';
  Object.assign(form, { id: '', api_group_name: '', api_group_description: '', app_code: '', api_ids: [] });
  visible.value = true;
}

function openEdit(row: any) {
  mode.value = 'edit';
  Object.assign(form, row);
  visible.value = true;
}

function openBind(row: any) {
  mode.value = 'bind';
  Object.assign(form, row);
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
