<template>
  <div class="page-container">
    <div class="page-title">
      <h2>远程调用日志</h2>
      <p>按调用链维度查询鉴权结果，定位失败请求与白名单绕过情况。</p>
    </div>
    <PageSearch :model="query" @search="loadData" @reset="resetQuery">
      <el-form-item label="调用方应用"><el-input v-model="query.callerApp" clearable /></el-form-item>
      <el-form-item label="被调用方应用"><el-input v-model="query.calleeApp" clearable /></el-form-item>
      <el-form-item label="校验结果">
        <el-select v-model="query.checkResult" clearable style="width: 160px">
          <el-option label="SUCCESS" value="SUCCESS" />
          <el-option label="FAIL" value="FAIL" />
          <el-option label="BYPASS" value="BYPASS" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="query.timeRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="tableData.list" border>
        <el-table-column prop="id" label="日志ID" width="120" />
        <el-table-column prop="callerApp" label="调用方应用" min-width="140" />
        <el-table-column prop="calleeApp" label="被调用方应用" min-width="140" />
        <el-table-column label="校验结果" width="120">
          <template #default="{ row }"><StatusTag :value="row.checkResult" /></template>
        </el-table-column>
        <el-table-column prop="reason" label="判定原因" min-width="280" />
        <el-table-column prop="responseCode" label="响应码" width="100" />
        <el-table-column prop="path" label="请求路径" min-width="220" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, prev, pager, next"
          :total="tableData.total"
          @current-change="loadData"
        />
      </div>
    </el-card>
    <LogDetailDrawer v-model:visible="drawerVisible" :log="currentLog" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import LogDetailDrawer from '@/components/LogDetailDrawer.vue';
import PageSearch from '@/components/PageSearch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { fetchRemoteLogs } from '@/mock/logs';

const drawerVisible = ref(false);
const currentLog = ref<any>(null);
const tableData = reactive({ list: [] as any[], total: 0 });
const query = reactive({ page: 1, pageSize: 10, callerApp: '', calleeApp: '', checkResult: '', timeRange: [] as string[] });

async function loadData() {
  const { data } = await fetchRemoteLogs(query);
  tableData.list = data.list;
  tableData.total = data.total;
}

function resetQuery() {
  Object.assign(query, { page: 1, pageSize: 10, callerApp: '', calleeApp: '', checkResult: '', timeRange: [] });
  loadData();
}

function showDetail(row: any) {
  currentLog.value = row;
  drawerVisible.value = true;
}

onMounted(loadData);
</script>
