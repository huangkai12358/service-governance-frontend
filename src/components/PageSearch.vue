<template>
  <el-card class="panel-card" shadow="never">
    <div class="page-search">
      <el-form :model="model" inline class="page-search-form">
        <slot />
        <el-form-item>
          <el-button type="primary" @click="$emit('search')">查询</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
        </el-form-item>
      </el-form>

      <div v-if="$slots.actions" class="page-search-actions">
        <slot name="actions" />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, unknown> }>();
defineEmits<{ search: []; reset: [] }>();
</script>

<style scoped>
.page-search {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-search-form {
  flex: 1;
}

.page-search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
