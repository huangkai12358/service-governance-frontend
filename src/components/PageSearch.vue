<template>
  <el-card class="panel-card" shadow="never">
    <el-form :model="model" inline label-width="90px">
      <slot />
      <el-form-item>
        <el-button type="primary" @click="$emit('search')">查询</el-button>
        <el-button @click="$emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, unknown> }>();
defineEmits<{ search: []; reset: [] }>();
</script>
