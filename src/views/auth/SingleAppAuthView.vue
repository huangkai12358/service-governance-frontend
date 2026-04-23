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
      <el-table :data="pagedList" border>
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column label="授权的 API 列表" min-width="320">
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

    <el-dialog v-model="visible" title="修改授权" width="1180px">
      <div v-if="editorData" class="auth-editor">
        <div class="editor-column">
          <h3 class="section-title">API 列表</h3>
          <el-checkbox-group v-model="checkedApiIds">
            <el-checkbox v-for="item in editorData.apis" :key="item.id" :label="item.id">
              {{ item.api_path }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="editor-column">
          <h3 class="section-title">从分组中选择</h3>
          <el-collapse v-model="activeGroups">
            <el-collapse-item v-for="group in editorData.api_groups" :key="group.id" :name="group.id">
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
        <div class="editor-column">
          <h3 class="section-title">变更预览</h3>
          <el-alert title="新增权限" type="success" :closable="false" />
          <div class="change-tags">
            <el-tag v-for="path in delta.added_api_paths" :key="path" type="success">
              {{ path }}
            </el-tag>
            <span v-if="!delta.added_api_paths.length" class="empty-text">无</span>
          </div>
          <el-alert title="撤销权限" type="warning" :closable="false" />
          <div class="change-tags">
            <el-tag v-for="path in delta.revoked_api_paths" :key="path" type="warning">
              {{ path }}
            </el-tag>
            <span v-if="!delta.revoked_api_paths.length" class="empty-text">无</span>
          </div>
          <el-divider />
          <div class="change-summary">
            总计：新增 {{ delta.added_api_paths.length }} 个权限，撤销 {{ delta.revoked_api_paths.length }} 个权限
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确认</el-button>
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
const pagination = reactive({ page: 1, pageSize: 10 });
const activeGroups = ref<string[]>([]);

const delta = computed(() => calcAuthorizationDelta(originalApiIds.value, checkedApiIds.value));
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchSingleAppAuthList(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { caller_app_code: '', callee_app_code: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

async function openEditor(id: string) {
  const { data } = await fetchSingleAppAuthEditor(id);
  editorData.value = data.data;
  originalApiIds.value = [...data.data.checked_api_ids];
  checkedApiIds.value = [...data.data.checked_api_ids];
  activeGroups.value = data.data.api_groups.map((item: any) => item.id);
  visible.value = true;
}

function getGroupApis(group: any) {
  return editorData.value?.apis.filter((item: any) => group.api_ids.includes(item.id)) || [];
}

function isGroupChecked(group: any) {
  return group.api_ids.length > 0 && group.api_ids.every((id: string) => checkedApiIds.value.includes(id));
}

function isGroupIndeterminate(group: any) {
  const count = group.api_ids.filter((id: string) => checkedApiIds.value.includes(id)).length;
  return count > 0 && count < group.api_ids.length;
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
  grid-template-columns: 1fr 1.15fr 0.9fr;
  gap: 16px;
}

.editor-column {
  min-height: 360px;
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

.change-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.empty-text {
  color: var(--sg-subtext);
}

.change-summary {
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  color: var(--sg-text);
  font-weight: 600;
}
</style>
