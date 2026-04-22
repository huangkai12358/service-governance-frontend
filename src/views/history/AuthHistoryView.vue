<template>
  <div class="page-container">
    <div class="page-title">
      <h2>权限配置历史</h2>
      <p>追踪授权和撤销操作，支持按操作人、时间、调用方和被调用方筛选。</p>
    </div>
    <PageSearch :model="query" @search="filterData" @reset="resetQuery">
      <el-form-item label="操作人"><el-input v-model="query.operator" clearable /></el-form-item>
      <el-form-item label="调用方"><el-input v-model="query.caller" clearable /></el-form-item>
      <el-form-item label="被调用方"><el-input v-model="query.callee" clearable /></el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="query.operationType" clearable style="width: 160px">
          <el-option label="授权" value="GRANT" />
          <el-option label="撤销" value="REVOKE" />
        </el-select>
      </el-form-item>
    </PageSearch>
    <el-card class="panel-card" shadow="never">
      <el-table :data="filtered" border>
        <el-table-column prop="id" label="记录ID" width="110" />
        <el-table-column prop="callerName" label="调用方" min-width="140" />
        <el-table-column prop="calleeAppName" label="被调用方" min-width="140" />
        <el-table-column prop="path" label="请求路径" min-width="220" />
        <el-table-column prop="version" label="版本号" width="110" />
        <el-table-column label="操作类型" width="110">
          <template #default="{ row }"><StatusTag :value="row.operationType" /></template>
        </el-table-column>
        <el-table-column prop="time" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import PageSearch from '@/components/PageSearch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { fetchAuthHistory } from '@/mock/history';

const allData = ref<any[]>([]);
const filtered = ref<any[]>([]);
const query = reactive({ operator: '', caller: '', callee: '', operationType: '' });

function filterData() {
  filtered.value = allData.value.filter((item) => {
    return (!query.operator || item.operator.includes(query.operator)) &&
      (!query.caller || item.callerName.includes(query.caller)) &&
      (!query.callee || item.calleeAppName.includes(query.callee)) &&
      (!query.operationType || item.operationType === query.operationType);
  });
}

function resetQuery() {
  Object.assign(query, { operator: '', caller: '', callee: '', operationType: '' });
  filterData();
}

onMounted(async () => {
  const { data } = await fetchAuthHistory();
  allData.value = data;
  filtered.value = data;
});
</script>
