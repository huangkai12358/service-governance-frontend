<template>
  <div class="page-container">
    <div class="page-title">
      <h2>远程调用历史记录</h2>
      <p>查看远程调用鉴权结果、判定原因和日志时间。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="id"><el-input v-model="query.call_decision_log_id" clearable /></el-form-item>
      <el-form-item label="调用方应用编码"><el-input v-model="query.caller_app_code" clearable /></el-form-item>
      <el-form-item label="被调用方应用编码"><el-input v-model="query.callee_app_code" clearable /></el-form-item>
      <el-form-item label="结果">
        <el-select v-model="query.result" clearable style="width:160px">
          <el-option label="SUCCESS" value="SUCCESS" />
          <el-option label="FAIL" value="FAIL" />
          <el-option label="BYPASS" value="BYPASS" />
        </el-select>
      </el-form-item>
      <el-form-item label="日志时间">
        <el-date-picker v-model="query.time_range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="call_decision_log_id" label="id" width="160" />
        <el-table-column prop="caller_app_code" label="调用方应用编码" width="180" />
        <el-table-column prop="callee_app_code" label="被调用方应用编码" width="180" />
        <el-table-column label="结果" width="120">
          <template #default="{ row }"><StatusTag :value="row.result" /></template>
        </el-table-column>
        <el-table-column prop="decision_reason" label="判定原因" min-width="320" />
        <el-table-column prop="log_time" label="日志时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { fetchRemoteCallLogs } from '@/mock/logs';

const query = reactive({
  call_decision_log_id: '',
  caller_app_code: '',
  callee_app_code: '',
  result: '',
  time_range: [] as string[]
});
const list = ref<any[]>([]);

async function loadData() {
  const { data } = await fetchRemoteCallLogs(query);
  list.value = data;
}

function resetQuery() {
  Object.assign(query, { call_decision_log_id: '', caller_app_code: '', callee_app_code: '', result: '', time_range: [] });
  loadData();
}

onMounted(loadData);
</script>
