<template>
  <div class="page-container">
    <div class="page-title">
      <h2>版本历史记录</h2>
      <p>统一查看版本导入和回滚操作历史，掌握变更轨迹与影响范围。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <el-table :data="list" border>
        <el-table-column prop="version" label="版本号" width="180" />
        <el-table-column prop="operationType" label="操作类型" width="120" />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="scope" label="影响范围" min-width="360" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchVersionHistory } from '@/mock/history';

const list = ref<any[]>([]);

onMounted(async () => {
  const { data } = await fetchVersionHistory();
  list.value = data;
});
</script>
