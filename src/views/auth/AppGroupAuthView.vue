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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="list.length"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="visible" :title="dialogTitle" width="1080px">
      <div class="auth-editor">
        <div class="editor-column">
          <h3 class="section-title">API 列表</h3>
          <el-checkbox-group v-model="checkedApiIds">
            <el-checkbox v-for="item in apiList" :key="item.id" :label="item.id">{{ item.api_path }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="editor-column">
          <h3 class="section-title">从分组中选择</h3>
          <el-collapse v-model="activeGroups">
            <el-collapse-item v-for="group in apiGroups" :key="group.id" :name="group.id">
              <template #title>
                <div class="group-title" @click.stop>
                  <el-checkbox
                    :model-value="isGroupChecked(group)"
                    :indeterminate="isGroupIndeterminate(group)"
                    @change="toggleGroup(group, $event)"
                  >
                    {{ group.api_group_name }}
                  </el-checkbox>
                </div>
              </template>
              <el-checkbox-group v-model="checkedApiIds">
                <el-checkbox v-for="api in getGroupApis(group)" :key="api.id" :label="api.id">
                  {{ api.api_path }}
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <div class="auth-summary">
        总计：已勾选 {{ checkedApiIds.length }} 个权限
      </div>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
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
const pagination = reactive({ page: 1, pageSize: 10 });
const activeGroups = ref<string[]>([]);

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

function handlePageSizeChange() {
  pagination.page = 1;
}

function openDialog(_: any, title: string) {
  dialogTitle.value = title;
  checkedApiIds.value = [];
  activeGroups.value = apiGroups.value.map((item) => item.id);
  visible.value = true;
}

function getGroupApis(group: any) {
  return apiList.value.filter((item) => group.api_ids.includes(item.id));
}

function isGroupChecked(group: any) {
  return group.api_ids.length > 0 && group.api_ids.every((id: string) => checkedApiIds.value.includes(id));
}

function isGroupIndeterminate(group: any) {
  const checkedCount = group.api_ids.filter((id: string) => checkedApiIds.value.includes(id)).length;
  return checkedCount > 0 && checkedCount < group.api_ids.length;
}

function toggleGroup(group: any, checked: string | number | boolean) {
  const next = new Set(checkedApiIds.value);
  if (checked) {
    group.api_ids.forEach((id: string) => next.add(id));
  } else {
    group.api_ids.forEach((id: string) => next.delete(id));
  }
  checkedApiIds.value = Array.from(next);
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
  max-height: 520px;
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  display: flex;
  align-items: center;
}

.auth-summary {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: var(--sg-text);
  font-weight: 600;
}
</style>
