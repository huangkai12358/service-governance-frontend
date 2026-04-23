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

    <el-dialog v-model="visible" :title="mode === 'create' ? '新增分组' : mode === 'edit' ? '编辑分组' : '修改组内 APP'" width="680px">
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
          <el-form-item label="包含 APP">
            <el-select v-model="form.app_codes" multiple filterable style="width:100%">
              <el-option v-for="app in apps" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.app_code" />
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
import { deleteAppGroup, fetchAppGroupList, saveAppGroup } from '@/mock/group';

const query = reactive({ app_group_name: '' });
const list = ref<any[]>([]);
const apps = ref<any[]>([]);
const visible = ref(false);
const mode = ref<'create' | 'edit' | 'bind'>('create');
const form = reactive<any>({ id: '', app_group_name: '', app_group_description: '', app_codes: [] });
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
  Object.assign(form, { id: '', app_group_name: '', app_group_description: '', app_codes: [] });
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
