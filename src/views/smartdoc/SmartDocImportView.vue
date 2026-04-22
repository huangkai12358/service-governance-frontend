<template>
  <div class="page-container">
    <div class="page-title">
      <h2>SmartDoc导入API</h2>
      <p>通过上传文档模拟导入分析，输出版本差异并确认导入内容。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <el-steps :active="step" finish-status="success">
        <el-step title="上传文件" />
        <el-step title="解析文档" />
        <el-step title="匹配已有API" />
        <el-step title="生成差异结果" />
        <el-step title="确认导入" />
      </el-steps>
      <div class="upload-area">
        <el-upload drag :auto-upload="false" action="#" :limit="1" :show-file-list="true">
          <el-icon size="30"><UploadFilled /></el-icon>
          <div class="el-upload__text">将 SmartDoc 文件拖到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅做前端 Mock，不执行真实文档解析</div>
          </template>
        </el-upload>
        <el-button type="primary" @click="startAnalyze">开始分析</el-button>
      </div>
    </el-card>

    <el-card v-if="loading" class="panel-card" shadow="never">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-if="diff" class="panel-card" shadow="never">
      <div class="page-header">
        <div>
          <h3 class="section-title">差异结果</h3>
          <p>待导入版本：{{ diff.version.version }}，共识别 {{ totalDiffs }} 项变更。</p>
        </div>
        <el-button type="success" @click="confirmImport">确认导入</el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="`新增API（${diff.additions.length}）`" name="add">
          <div class="diff-grid">
            <DiffCard v-for="item in diff.additions" :key="item.id" type="added" :title="item.name" :subtitle="item.path" tag-text="新增API">
              <el-checkbox v-model="selectedIds" :label="item.id">导入此变更</el-checkbox>
              <p>{{ item.description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`修改API（${diff.modifications.length}）`" name="modify">
          <div class="diff-grid">
            <DiffCard v-for="item in diff.modifications" :key="item.id" type="updated" :title="item.after.name" :subtitle="item.after.path" tag-text="修改API">
              <el-checkbox v-model="selectedIds" :label="item.id">导入此变更</el-checkbox>
              <el-descriptions :column="2" border style="margin-top: 12px">
                <el-descriptions-item label="修改字段" :span="2">
                  <el-tag v-for="field in item.fields" :key="field" style="margin-right:8px">{{ field }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="变更前">{{ item.before.name }} / {{ item.before.description }}</el-descriptions-item>
                <el-descriptions-item label="变更后">{{ item.after.name }} / {{ item.after.description }}</el-descriptions-item>
              </el-descriptions>
            </DiffCard>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`删除API（${diff.deletions.length}）`" name="delete">
          <div class="diff-grid">
            <DiffCard v-for="item in diff.deletions" :key="item.id" type="removed" :title="item.name" :subtitle="item.path" tag-text="删除API">
              <el-checkbox v-model="selectedIds" :label="item.id">导入此变更</el-checkbox>
              <p>{{ item.description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import DiffCard from '@/components/DiffCard.vue';
import { analyzeSmartDoc, confirmSmartDocImport } from '@/mock/smartdoc';

const step = ref(0);
const loading = ref(false);
const diff = ref<any>(null);
const activeTab = ref('add');
const selectedIds = ref<string[]>([]);

const totalDiffs = computed(() => {
  if (!diff.value) return 0;
  return diff.value.additions.length + diff.value.modifications.length + diff.value.deletions.length;
});

async function startAnalyze() {
  step.value = 1;
  loading.value = true;
  window.setTimeout(() => { step.value = 2; }, 300);
  window.setTimeout(() => { step.value = 3; }, 600);
  const { data } = await analyzeSmartDoc();
  loading.value = false;
  diff.value = data;
  selectedIds.value = [...data.additions.map((i: any) => i.id), ...data.modifications.map((i: any) => i.id)];
  step.value = 4;
}

async function confirmImport() {
  const { message } = await confirmSmartDocImport(selectedIds.value);
  step.value = 5;
  ElMessage.success(message);
}
</script>

<style scoped>
.upload-area {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
</style>
