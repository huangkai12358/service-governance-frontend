<template>
  <el-card :class="['panel-card', `diff-${typeClass}`]" shadow="never">
    <template #header>
      <div class="diff-header">
        <div>
          <strong>{{ title }}</strong>
          <p>{{ subtitle }}</p>
        </div>
        <el-tag :type="tagType">{{ tagText }}</el-tag>
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: 'added' | 'updated' | 'removed';
  title: string;
  subtitle: string;
  tagText: string;
}>();

const typeClass = computed(() => props.type);
const tagType = computed(() => ({
  added: 'success',
  updated: 'primary',
  removed: 'danger'
}[props.type]));
</script>

<style scoped>
.diff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.diff-header p {
  margin: 4px 0 0;
  color: var(--sg-subtext);
  font-size: 13px;
}
</style>
