<template>
  <div class="page-container">
    <div class="page-title">
      <h2>API分组管理</h2>
      <p>维护 API 分组，用于按资源组进行授权配置与版本治理。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <div class="table-toolbar">
        <div class="right-actions">
          <el-button type="primary" @click="openEdit()">新增API分组</el-button>
        </div>
      </div>
      <el-table :data="groups" border>
        <el-table-column prop="appName" label="所属应用" width="160" />
        <el-table-column prop="name" label="分组名称" width="180" />
        <el-table-column prop="description" label="分组说明" min-width="260" />
        <el-table-column label="分组下API" min-width="260">
          <template #default="{ row }">
            <el-tag v-for="name in row.apiNames" :key="name" style="margin-right:8px">{{ name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="form.id ? '编辑API分组' : '新增API分组'" width="620px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="所属应用">
          <el-select v-model="form.appId" style="width: 100%">
            <el-option v-for="app in apps" :key="app.id" :label="app.name" :value="app.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分组名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分组说明">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteApiGroup, fetchApiGroups, saveApiGroup } from '@/mock/group';

const groups = ref<any[]>([]);
const apps = ref<any[]>([]);
const visible = ref(false);
const form = reactive<any>({ id: '', appId: '', name: '', description: '' });

async function loadData() {
  const { data } = await fetchApiGroups();
  groups.value = data.groups;
  apps.value = data.apps;
}

function openEdit(row?: any) {
  Object.assign(form, row || { id: '', appId: '', name: '', description: '' });
  visible.value = true;
}

async function save() {
  const { message } = await saveApiGroup();
  ElMessage.success(message);
  visible.value = false;
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除 API 分组「${row.name}」吗？`, '删除确认', { type: 'warning' });
  const { message } = await deleteApiGroup(row.id);
  ElMessage.success(message);
}

onMounted(loadData);
</script>
