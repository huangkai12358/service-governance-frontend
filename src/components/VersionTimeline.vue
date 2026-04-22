<template>
  <el-timeline>
    <el-timeline-item v-for="item in items" :key="item.id" :timestamp="item.time" placement="top">
      <div class="timeline-content">
        <strong>{{ item.operator }}</strong>
        <p>{{ item.reason }}</p>
      </div>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
import type { RollbackRecord } from '@/types/business';

defineProps<{ items: RollbackRecord[] }>();
</script>

<style scoped>
.timeline-content p {
  margin: 6px 0 0;
  color: var(--sg-subtext);
}
</style>
