<template>
  <div class="page-container">
    <div class="page-title">
      <h2>历史版本管理</h2>
      <p>按应用编码、应用名称和版本号查询历史版本，并支持回滚预览。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
      <el-form-item label="版本号"><el-input v-model="query.api_version_id" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="app_code" label="应用编码" width="160" />
        <el-table-column prop="app_name" label="应用名称" width="140" />
        <el-table-column prop="api_version_id" label="版本号" width="140" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row.id)">详情</el-button>
            <el-button link type="danger" @click="showRollback(row.id)">回滚</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="detailVisible" title="版本详情" size="680px">
      <el-table v-if="detail" :data="detail.apis" border>
        <el-table-column prop="api_name" label="API名称" min-width="160" />
        <el-table-column prop="api_path" label="请求路径" min-width="240" />
        <el-table-column prop="api_method" label="请求方法" width="110" />
      </el-table>
    </el-drawer>

    <el-dialog v-model="rollbackVisible" title="回滚预览" width="900px">
      <div v-if="detail" class="rollback-grid">
        <div>
          <h3 class="section-title">新增API</h3>
          <el-table :data="detail.rollback_preview.additions" border>
            <el-table-column prop="api_name" label="API名称" />
            <el-table-column prop="api_path" label="请求路径" />
          </el-table>
        </div>
        <div>
          <h3 class="section-title">修改API</h3>
          <el-table :data="detail.rollback_preview.modifications" border>
            <el-table-column label="API名称">
              <template #default="{ row }">{{ row.after.api_name }}</template>
            </el-table-column>
            <el-table-column label="请求路径">
              <template #default="{ row }">{{ row.after.api_path }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div>
          <h3 class="section-title">删除API</h3>
          <el-table :data="detail.rollback_preview.deletions" border>
            <el-table-column prop="api_name" label="API名称" />
            <el-table-column prop="api_path" label="请求路径" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmRollback">确认</el-button>
        <el-button @click="rollbackVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageSearch from '@/components/PageSearch.vue';
import { fetchVersionDetail, fetchVersionList, rollbackVersion } from '@/mock/version';

const query = reactive({ app_code: '', app_name: '', api_version_id: '' });
const list = ref<any[]>([]);
const detail = ref<any>(null);
const detailVisible = ref(false);
const rollbackVisible = ref(false);

async function loadData() {
  const { data } = await fetchVersionList(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { app_code: '', app_name: '', api_version_id: '' });
  loadData();
}

async function showDetail(id: string) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  detailVisible.value = true;
}

async function showRollback(id: string) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  rollbackVisible.value = true;
}

async function confirmRollback() {
  const { message } = await rollbackVersion();
  ElMessage.success(message);
  rollbackVisible.value = false;
}

onMounted(loadData);
</script>

<style scoped>
.rollback-grid {
  display: grid;
  gap: 16px;
}
</style>
