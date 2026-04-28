<template>
  <div class="page-container">
    <div class="page-title">
      <h2>历史版本管理</h2>
      <p>按应用编码、应用名称和版本号查询历史版本，可查看版本详情。若需回退，请重新导入目标 SmartDoc 文档生成新版本。</p>
    </div>

    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="应用名称"><el-input v-model="query.app_name" clearable /></el-form-item>
      <el-form-item label="版本号"><el-input v-model="query.version" clearable /></el-form-item>
    </PageSearch>

    <el-card class="panel-card" shadow="never">
      <el-table :data="pagedList" border>
        <el-table-column prop="app_code" label="应用编码" width="160" />
        <el-table-column prop="app_name" label="应用名称" width="160" />
        <el-table-column prop="app_description" label="应用说明" min-width="240" />
        <el-table-column prop="version" label="版本号" width="140" />
        <el-table-column prop="create_time" label="导入时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row.id)">详情</el-button>
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

    <el-drawer v-model="detailVisible" title="版本详情" size="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border class="detail-summary">
          <el-descriptions-item label="应用编码">{{ detail.version.app_code }}</el-descriptions-item>
          <el-descriptions-item label="应用名称">{{ detail.version.app_name }}</el-descriptions-item>
          <el-descriptions-item label="版本号">{{ detail.version.version }}</el-descriptions-item>
          <el-descriptions-item label="导入时间">{{ detail.version.create_time }}</el-descriptions-item>
          <el-descriptions-item label="导入文件" :span="2">{{ detail.version.file_name }}</el-descriptions-item>
          <el-descriptions-item label="导入说明" :span="2">{{ detail.version.remark }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">包含的 API</div>
        <el-table :data="detail.apis" border>
          <el-table-column prop="api_name" label="API 名称" min-width="180" />
          <el-table-column prop="api_path" label="请求路径" min-width="280" show-overflow-tooltip />
          <el-table-column prop="api_method" label="请求方法" width="110" />
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import { fetchVersionDetail, fetchVersionList } from '@/mock/version';

const query = reactive({ app_code: '', app_name: '', version: '' });
const list = ref<any[]>([]);
const detail = ref<any>(null);
const detailVisible = ref(false);
const pagination = reactive({ page: 1, pageSize: 10 });

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchVersionList(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { app_code: '', app_name: '', version: '' });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

async function showDetail(id: number) {
  const { data } = await fetchVersionDetail(id);
  detail.value = data;
  detailVisible.value = true;
}

onMounted(loadData);
</script>

<style scoped>
.detail-summary {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px;
  color: var(--sg-text);
  font-size: 15px;
  font-weight: 700;
}
</style>
