<template>
  <div class="page-container">
    <div class="page-title">
      <h2>SmartDoc 导入历史记录</h2>
      <p>查看应用编码、版本号、导入文件名、存储路径和备注信息。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="日志 ID"><el-input v-model="query.api_version_id" clearable /></el-form-item>
      <el-form-item label="应用编码"><el-input v-model="query.app_code" clearable /></el-form-item>
      <el-form-item label="版本号"><el-input v-model="query.version" clearable /></el-form-item>
      <el-form-item label="导入时间">
        <el-date-picker
          v-model="query.time_range"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card smartdoc-log-card" shadow="never">
      <el-table :data="pagedList" border class="smartdoc-log-table">
        <el-table-column label="日志 ID" width="170">
          <template #default="{ row }">{{ row.api_version_id.toString() }}</template>
        </el-table-column>
        <el-table-column prop="app_code" label="应用编码" width="140" />
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column prop="file_name" label="导入的 Smart Doc 文件名" min-width="180" />
        <el-table-column prop="file_path" label="Linux 文件系统中的存储路径" min-width="220" />
        <el-table-column prop="remark" label="导入说明或备注" min-width="160" />
        <el-table-column prop="create_time" label="导入时间" width="160" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import { fetchSmartDocImportLogs } from '@/mock/history';

const query = reactive({ api_version_id: '', app_code: '', version: '', time_range: [] as string[] });
const list = ref<any[]>([]);
const pagination = reactive({ page: 1, pageSize: 10 });
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchSmartDocImportLogs(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { api_version_id: '', app_code: '', version: '', time_range: [] });
  pagination.page = 1;
  loadData();
}

onMounted(loadData);
</script>

<style scoped>
.smartdoc-log-card,
.smartdoc-log-table {
  min-width: 0;
  width: 100%;
}

.smartdoc-log-table :deep(.cell) {
  white-space: normal;
  word-break: break-word;
}
</style>
