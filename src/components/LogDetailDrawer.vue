<template>
  <el-drawer :model-value="visible" title="日志详情" size="420px" @close="$emit('update:visible', false)">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志ID">{{ log?.id }}</el-descriptions-item>
      <el-descriptions-item label="调用方应用">{{ log?.callerApp }}</el-descriptions-item>
      <el-descriptions-item label="被调用方应用">{{ log?.calleeApp }}</el-descriptions-item>
      <el-descriptions-item label="请求路径">{{ log?.path }}</el-descriptions-item>
      <el-descriptions-item label="校验结果">
        <StatusTag v-if="log" :value="log.checkResult" />
      </el-descriptions-item>
      <el-descriptions-item label="判定原因">{{ log?.reason }}</el-descriptions-item>
      <el-descriptions-item label="响应码">{{ log?.responseCode }}</el-descriptions-item>
      <el-descriptions-item label="发生时间">{{ log?.time }}</el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<script setup lang="ts">
import type { RemoteLogItem } from '@/types/business';
import StatusTag from './StatusTag.vue';

defineProps<{
  visible: boolean;
  log: RemoteLogItem | null;
}>();

defineEmits<{ 'update:visible': [value: boolean] }>();
</script>
