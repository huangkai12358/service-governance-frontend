<template>
  <div class="page-container">
    <div class="page-title">
      <h2>应用组授权</h2>
      <p>按应用组维度为组内应用统一新增权限或撤销权限。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用组名称"><el-input v-model="query.app_group_name" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="pagedList" border>
        <el-table-column prop="app_group_name" label="应用组" width="180" />
        <el-table-column label="应用组包含的应用" min-width="260">
          <template #default="{ row }">
            <el-tag v-for="app in row.app_codes" :key="app" style="margin-right:8px">{{ app }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row, '新增权限')">新增权限</el-button>
            <el-button link type="danger" @click="openDialog(row, '撤销权限')">撤销权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          layout="total, prev, pager, next"
          :total="list.length"
        />
      </div>
    </el-card>

    <el-dialog v-model="visible" :title="dialogTitle" width="960px">
      <div class="auth-editor">
        <div class="editor-column">
          <h3 class="section-title">左侧 API 列表</h3>
          <el-checkbox-group v-model="checkedApiIds">
            <el-checkbox v-for="item in apiList" :key="item.id" :label="item.id">{{ item.api_path }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="editor-column">
          <h3 class="section-title">右侧 API 分组</h3>
          <el-checkbox-group v-model="checkedGroupIds">
            <el-checkbox v-for="group in apiGroups" :key="group.id" :label="group.id">{{ group.api_group_name }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="submit">确认</el-button>
        <el-button @click="visible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { fetchAppGroupAuthList, saveAppGroupAuthorization } from '@/mock/auth';

const query = reactive({ app_group_name: '' });
const list = ref<any[]>([]);
const apiList = ref<any[]>([]);
const apiGroups = ref<any[]>([]);
const visible = ref(false);
const dialogTitle = ref('新增权限');
const checkedApiIds = ref<string[]>([]);
const checkedGroupIds = ref<string[]>([]);
const pagination = reactive({ page: 1, pageSize: 10 });

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchAppGroupAuthList(query);
  list.value = data.list;
  apiList.value = data.apis;
  apiGroups.value = data.apiGroups;
}

function resetQuery() {
  Object.assign(query, { app_group_name: '' });
  pagination.page = 1;
  loadData();
}

function openDialog(_: any, title: string) {
  dialogTitle.value = title;
  checkedApiIds.value = [];
  checkedGroupIds.value = [];
  visible.value = true;
}

async function submit() {
  const { message } = await saveAppGroupAuthorization();
  ElMessage.success(message);
  visible.value = false;
}

onMounted(loadData);
</script>

<style scoped>
.auth-editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.editor-column {
  min-height: 320px;
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
