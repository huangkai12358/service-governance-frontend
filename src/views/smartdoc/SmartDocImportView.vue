n<template>
  <div class="page-container">
    <div class="page-title">
      <h2>SmartDoc 导入</h2>
      <p>上传文档后进行解析，并按 path 对比新增 API、修改 API、删除 API。</p>
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
      <el-tabs v-model="tab">
        <el-tab-pane :label="`新增 API（${diff.additions.length}）`" name="add">
          <div class="diff-grid">
            <DiffCard v-for="item in diff.additions" :key="item.id" type="added" :title="item.api_name" :subtitle="item.api_path" tag-text="新增API">
              <p>请求方法：{{ item.api_method }}</p>
              <p>描述：{{ item.api_description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`修改 API（${diff.modifications.length}）`" name="modify">
          <div class="diff-grid">
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
        <el-tab-pane :label="`删除 API（${diff.deletions.length}）`" name="delete">
          <div class="diff-grid">
            <DiffCard v-for="item in diff.deletions" :key="item.id" type="removed" :title="item.api_name" :subtitle="item.api_path" tag-text="删除API">
              <p>请求方法：{{ item.api_method }}</p>
              <p>描述：{{ item.api_description }}</p>
            </DiffCard>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="actions">
        <el-button type="primary" @click="confirmImport">确认导入</el-button>
        <el-button @click="cancelImport">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import DiffCard from '@/components/DiffCard.vue';
import { analyzeSmartDoc, confirmSmartDocImport } from '@/mock/smartdoc';
import { fetchApiOptions } from '@/mock/api';

const step = ref(0);
const diff = ref<any>(null);
const tab = ref('add');
const draft = reactive({ app_code: '', version: '', remark: '' });
const appOptions = ref<any[]>([]);

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
  const { message } = await confirmSmartDocImport();
  step.value = 3;
  ElMessage.success(message);
}

function cancelImport() {
  diff.value = null;
  step.value = 0;
  Object.assign(draft, { app_code: '', version: '', remark: '' });
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
