<template>
  <el-tag :type="tagType" effect="light">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: string }>();

const tagType = computed(() => {
  const mapping: Record<string, string> = {
    ONLINE: 'success',
    OFFLINE: 'danger',
    DRAFT: 'warning',
    CURRENT: 'success',
    ARCHIVED: 'info',
    ROLLED_BACK: 'warning',
    SUCCESS: 'success',
    FAIL: 'danger',
    BYPASS: 'warning',
    GRANT: 'success',
    REVOKE: 'danger'
  };
  return mapping[props.value] || 'info';
});

const label = computed(() => {
  const mapping: Record<string, string> = {
    ONLINE: '已上线',
    OFFLINE: '已下线',
    DRAFT: '草稿',
    CURRENT: '当前版本',
    ARCHIVED: '历史版本',
    ROLLED_BACK: '已回滚',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    BYPASS: 'BYPASS',
    GRANT: '授权',
    REVOKE: '撤销'
  };
  return mapping[props.value] || props.value;
});
</script>
