<template>
  <div class="page-container">
    <div class="page-title">
      <h2>SmartDoc 导入</h2>
      <p>上传文档后进行解析，并按 path 对比新增 API、修改 API、废弃 API。</p>
    </div>
    <el-card class="panel-card" shadow="never">
      <el-steps :active="step" finish-status="success">
        <el-step title="上传" />
        <el-step title="解析" />
        <el-step title="差异对比" />
        <el-step title="确认导入" />
      </el-steps>
      <div class="upload-wrap">
        <el-upload drag action="#" :auto-upload="false" :limit="1">
          <el-icon size="28"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽 SmartDoc 文件到此处，或点击上传</div>
        </el-upload>
        <el-button type="primary" @click="analyze">上传</el-button>
      </div>
    </el-card>

    <el-card v-if="diff" class="panel-card" shadow="never">
      <el-form :model="draft" label-width="100px" style="margin-bottom:20px">
        <el-form-item label="app_code">
          <el-select v-model="draft.app_code" filterable style="width:100%">
            <el-option v-for="app in appOptions" :key="app.id" :label="`${app.app_code} / ${app.app_name}`" :value="app.app_code" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="draft.version" placeholder="优先从 SmartDoc 文档解析，若未解析到可手动填写" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="draft.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div class="diff-summary">
        <span>差异总计</span>
        <el-tag>无变化 {{ diff.unchanged_count }} 个</el-tag>
        <el-tag type="success">新增 {{ diff.additions.length }} 个</el-tag>
        <el-tag type="primary">修改 {{ diff.modifications.length }} 个</el-tag>
        <el-tag type="warning">废弃 {{ diff.deprecations.length }} 个</el-tag>
      </div>
      <el-tabs v-model="tab">
        <el-tab-pane :label="`新增 API（${diff.additions.length}）`" name="add">
          <div class="diff-grid diff-scroll">
            <DiffCard v-for="item in diff.additions" :key="item.id" type="added" :title="item.api_name" :subtitle="item.api_path" tag-text="新增API">
              <p>请求方法：{{ item.api_method }}</p>
              <p>描述：{{ item.api_description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`修改 API（${diff.modifications.length}）`" name="modify">
          <div class="diff-grid diff-scroll">
            <DiffCard v-for="item in diff.modifications" :key="item.id" type="updated" :title="item.after.api_name" :subtitle="item.after.api_path" tag-text="修改API">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="变化字段">
                  <el-tag v-for="field in item.changed_fields" :key="field" style="margin-right:8px">{{ field }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="变更前">{{ item.before.api_name }} / {{ item.before.api_method }} / {{ item.before.api_description }}</el-descriptions-item>
                <el-descriptions-item label="变更后">{{ item.after.api_name }} / {{ item.after.api_method }} / {{ item.after.api_description }}</el-descriptions-item>
              </el-descriptions>
            </DiffCard>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`废弃 API（${diff.deprecations.length}）`" name="deprecate">
          <div class="diff-grid diff-scroll">
            <DiffCard v-for="item in diff.deprecations" :key="item.id" type="removed" :title="item.api_name" :subtitle="item.api_path" tag-text="废弃API">
              <p>请求方法：{{ item.api_method }}</p>
              <p>描述：{{ item.api_description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="actions actions-sticky">
        <div class="actions-tip">
          已完成差异分析，可直接确认导入当前解析结果
        </div>
        <div class="actions-buttons">
          <el-button @click="cancelImport">取消</el-button>
          <el-button type="primary" @click="confirmImport">确认导入</el-button>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="resultVisible" title="导入成功" width="560px">
      <div v-if="importResult" class="result-content">
        <div class="result-summary">
          <el-tag>无变化 {{ importResult.unchanged_count }} 个</el-tag>
          <el-tag type="success">新增 {{ importResult.addition_count }} 个</el-tag>
          <el-tag type="primary">修改 {{ importResult.modification_count }} 个</el-tag>
          <el-tag type="warning">废弃 {{ importResult.deprecation_count }} 个</el-tag>
        </div>
        <p class="result-tip">本次导入已生成新版本。对于新增 API，可继续前往权限管理完成授权。</p>
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!importResult?.addition_count" @click="goAuthorize">
          去授权
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import DiffCard from '@/components/DiffCard.vue';
import { analyzeSmartDoc, confirmSmartDocImport } from '@/mock/smartdoc';
import { fetchApiOptions } from '@/mock/api';

const router = useRouter();
const step = ref(0);
const diff = ref<any>(null);
const tab = ref('add');
const draft = reactive({ app_code: '', version: '', remark: '' });
const appOptions = ref<any[]>([]);
const resultVisible = ref(false);
const importResult = ref<any>(null);

async function analyze() {
  step.value = 1;
  const { data } = await analyzeSmartDoc();
  diff.value = data;
  Object.assign(draft, {
    app_code: data.draft.app_code,
    version: data.draft.version,
    remark: data.draft.remark
  });
  step.value = 2;
}

async function confirmImport() {
  const { data, message } = await confirmSmartDocImport();
  importResult.value = data;
  resultVisible.value = true;
  cancelImport();
  ElMessage.success(message);
}

function cancelImport() {
  diff.value = null;
  step.value = 0;
  Object.assign(draft, { app_code: '', version: '', remark: '' });
}

function goAuthorize() {
  const ids = importResult.value?.additions?.map((item: any) => item.id).join(',');
  router.push({
    path: '/auth/api-reverse',
    query: {
      app_code: importResult.value?.additions?.[0]?.app_code || '',
      api_ids: ids
    }
  });
  resultVisible.value = false;
}

onMounted(async () => {
  const { data } = await fetchApiOptions();
  appOptions.value = data.apps;
});
</script>

<style scoped>
.upload-wrap {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.diff-scroll {
  max-height: 620px;
  overflow: auto;
  padding-right: 4px;
}

.diff-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: #f1f5f9;
  font-weight: 700;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
}

.actions-sticky {
  position: sticky;
  bottom: 0;
  z-index: 5;
  padding: 14px 16px 0;
  margin: 20px -4px 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 22%, #ffffff 100%);
}

.actions-tip {
  color: var(--sg-subtext);
  font-size: 13px;
  line-height: 1.6;
}

.actions-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-tip {
  margin: 0;
  color: var(--sg-subtext);
  line-height: 1.8;
}
</style>
