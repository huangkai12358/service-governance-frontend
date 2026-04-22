<template>
  <div class="page-container">
    <div class="page-title">
      <h2>单个应用授权</h2>
      <p>按调用方应用编码和被调用方应用编码管理单应用 API 授权关系。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column label="授权的API列表" min-width="320">
          <template #default="{ row }">
            <el-tag v-for="path in row.api_paths" :key="path" style="margin-right:8px">{{ path }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditor(row.id)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" title="修改授权" width="1100px">
      <div v-if="editorData" class="auth-editor">
        <div class="editor-column">
          <h3 class="section-title">左侧 API 列表</h3>
          <el-checkbox-group v-model="checkedApiIds">
            <el-checkbox v-for="item in editorData.apis" :key="item.id" :label="item.id" @change="syncFromApis">
              {{ item.api_path }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="editor-column">
          <h3 class="section-title">右侧 API 分组</h3>
          <el-checkbox-group v-model="checkedGroupIds" @change="syncFromGroups">
            <el-checkbox v-for="group in editorData.api_groups" :key="group.id" :label="group.id">
              {{ group.api_group_name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="editor-column">
          <h3 class="section-title">变更预览</h3>
          <el-alert title="新增权限" type="success" :closable="false" />
          <p>{{ delta.added_api_paths.join('，') || '无' }}</p>
          <el-alert title="撤销权限" type="warning" :closable="false" />
          <p>{{ delta.revoked_api_paths.join('，') || '无' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="submitEdit">确认</el-button>
        <el-button @click="visible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { calcAuthorizationDelta, fetchSingleAppAuthEditor, fetchSingleAppAuthList, saveSingleAppAuthorization } from '@/mock/auth';

const query = reactive({ caller_app_code: '', callee_app_code: '' });
const list = ref<any[]>([]);
const visible = ref(false);
const editorData = ref<any>(null);
const originalApiIds = ref<string[]>([]);
const checkedApiIds = ref<string[]>([]);
const checkedGroupIds = ref<string[]>([]);

const delta = computed(() => calcAuthorizationDelta(originalApiIds.value, checkedApiIds.value));

async function loadData() {
  const { data } = await fetchSingleAppAuthList(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { caller_app_code: '', callee_app_code: '' });
  loadData();
}

async function openEditor(id: string) {
  const { data } = await fetchSingleAppAuthEditor(id);
  editorData.value = data.data;
  originalApiIds.value = [...data.data.checked_api_ids];
  checkedApiIds.value = [...data.data.checked_api_ids];
  checkedGroupIds.value = [...data.data.checked_group_ids];
  visible.value = true;
}

function syncFromGroups() {
  if (!editorData.value) return;
  const ids = new Set<string>(checkedApiIds.value);
  editorData.value.api_groups
    .filter((item: any) => checkedGroupIds.value.includes(item.id))
    .forEach((group: any) => group.api_ids.forEach((id: string) => ids.add(id)));
  checkedApiIds.value = Array.from(ids);
}

function syncFromApis() {
  if (!editorData.value) return;
  checkedGroupIds.value = editorData.value.api_groups
    .filter((group: any) => group.api_ids.some((id: string) => checkedApiIds.value.includes(id)))
    .map((group: any) => group.id);
}

async function submitEdit() {
  const { message } = await saveSingleAppAuthorization();
  ElMessage.success(message);
  visible.value = false;
}

onMounted(loadData);
</script>

<style scoped>
.auth-editor {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
