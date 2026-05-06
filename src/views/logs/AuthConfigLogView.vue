<template>
  <div class="page-container">
    <div class="page-title">
      <h2>权限配置历史记录</h2>
      <p>查看授权新增和撤销操作日志。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="日志 ID"><el-input v-model="query.auth_log_id" clearable /></el-form-item>
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="调用方应用名称"><el-input v-model="query.caller_app_name" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用名称"><el-input v-model="query.callee_app_name" clearable /></el-form-item>
      <el-form-item label="API 名称"><el-input v-model="query.api_name" clearable /></el-form-item>
      <el-form-item label="API 路径"><el-input v-model="query.api_path" clearable /></el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="query.operation_type" clearable style="width:160px">
          <el-option label="新增" value="新增" />
          <el-option label="撤销" value="撤销" />
        </el-select>
      </el-form-item>
      <el-form-item label="日志时间">
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
    <el-card class="panel-card" shadow="never">
      <el-table :data="pagedList" border>
        <el-table-column label="日志 ID" width="80">
          <template #default="{ row }">{{ row.auth_log_id.toString() }}</template>
        </el-table-column>
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="caller_app_name" label="调用方应用名称" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column prop="callee_app_name" label="被调用方应用名称" width="180" />
        <el-table-column prop="api_name" label="API 名称" min-width="160" />
        <el-table-column prop="api_path" label="API 路径" min-width="240" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.operation_type" />
          </template>
        </el-table-column>
        <el-table-column prop="log_time" label="日志时间" width="180" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { fetchAuthConfigLogs } from '@/mock/history';

const query = reactive({
  auth_log_id: '',
  caller_app_code: '',
  caller_app_name: '',
  callee_app_code: '',
  callee_app_name: '',
  api_name: '',
  api_path: '',
  operation_type: '',
  time_range: [] as string[]
});
const list = ref<any[]>([]);
const pagination = reactive({ page: 1, pageSize: 10 });
const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return list.value.slice(start, start + pagination.pageSize);
});

async function loadData() {
  const { data } = await fetchAuthConfigLogs(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, {
    auth_log_id: '',
    caller_app_code: '',
    caller_app_name: '',
    callee_app_code: '',
    callee_app_name: '',
    api_name: '',
    api_path: '',
    operation_type: '',
    time_range: []
  });
  pagination.page = 1;
  loadData();
}

function handlePageSizeChange() {
  pagination.page = 1;
}

onMounted(loadData);
</script>
