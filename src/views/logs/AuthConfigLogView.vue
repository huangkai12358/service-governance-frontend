<template>
  <div class="page-container">
    <div class="page-title">
      <h2>权限配置历史记录</h2>
      <p>查看授权新增和撤销操作日志。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="id"><el-input v-model="query.auth_log_id" clearable /></el-form-item>
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
      <el-form-item label="API名称"><el-input v-model="query.api_name" clearable /></el-form-item>
      <el-form-item label="API路径"><el-input v-model="query.api_path" clearable /></el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="query.operation_type" clearable style="width:160px">
          <el-option label="新增" value="新增" />
          <el-option label="撤销" value="撤销" />
        </el-select>
      </el-form-item>
      <el-form-item label="日志时间">
        <el-date-picker v-model="query.time_range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="auth_log_id" label="id" width="160" />
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column prop="api_name" label="API名称" min-width="160" />
        <el-table-column prop="api_path" label="API路径" min-width="240" />
        <el-table-column prop="operation_type" label="操作类型" width="100" />
        <el-table-column prop="log_time" label="日志时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import { fetchAuthConfigLogs } from '@/mock/history';

const query = reactive({
  auth_log_id: '',
  caller_app_code: '',
  callee_app_code: '',
  api_name: '',
  api_path: '',
  operation_type: '',
  time_range: [] as string[]
});
const list = ref<any[]>([]);

async function loadData() {
  const { data } = await fetchAuthConfigLogs(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { auth_log_id: '', caller_app_code: '', callee_app_code: '', api_name: '', api_path: '', operation_type: '', time_range: [] });
  loadData();
}

onMounted(loadData);
</script>
