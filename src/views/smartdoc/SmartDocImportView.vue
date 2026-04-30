<template>
  <div class="page-container smartdoc-page">
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
        <p class="result-tip">本次导入已生成新版本。对于新增 API，可在当前页面直接继续完成授权配置。</p>
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!importResult?.addition_count" @click="goAuthorize">
          去授权
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="authVisible" title="新增 API 授权" width="1200px" top="6vh">
      <div class="auth-shell">
        <div class="auth-flow">
          <div
            v-for="(item, index) in authFlowItems"
            :key="item.title"
            class="flow-node"
            :class="{
              'is-active': authStep === index,
              'is-done': authStep > index || (authCompleted && index === 3)
            }"
          >
            <div class="flow-index">{{ index + 1 }}</div>
            <div class="flow-text">
              <div class="flow-title">{{ item.title }}</div>
              <div class="flow-desc">{{ item.desc }}</div>
            </div>
            <div v-if="index < authFlowItems.length - 1" class="flow-line" />
          </div>
          <div v-if="authStep === 2" class="flow-return">
            <span class="flow-return-arrow">↺</span>
            <span>点击 确认并继续 返回 Step1</span>
          </div>
        </div>

        <el-card class="step-card" shadow="never">
              <template v-if="authStep === 0">
                <div class="step-layout">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="被调用方服务">{{ authMeta.callee_app_name }}（{{ authMeta.callee_app_code }}）</el-descriptions-item>
                    <el-descriptions-item label="SmartDoc 版本">{{ authMeta.version }}</el-descriptions-item>
                    <el-descriptions-item label="本次新增 API 数量">{{ authCatalog.length }}</el-descriptions-item>
                  </el-descriptions>

                  <div class="step-section">
                    <div class="section-head">
                      <h3 class="section-title">选择调用方服务</h3>
                      <span class="section-meta">已处理 {{ authAssignments.length }} 个服务</span>
                    </div>
                    <div class="caller-select-row">
                      <el-select v-model="currentCallerAppCode" placeholder="请选择调用方服务" filterable clearable class="caller-select">
                        <el-option
                          v-for="item in availableCallerApps"
                          :key="item.app_code"
                          :label="`${item.app_name}（${item.app_code}）`"
                          :value="item.app_code"
                          :disabled="processedCallerCodes.includes(item.app_code)"
                        >
                          <div class="service-option">
                            <span>{{ item.app_name }}（{{ item.app_code }}）</span>
                            <el-tag v-if="processedCallerCodes.includes(item.app_code)" size="small" type="success">已处理</el-tag>
                          </div>
                        </el-option>
                      </el-select>
                      <el-button type="primary" :disabled="!currentCallerAppCode" @click="goAuthNextStep">下一步</el-button>
                    </div>

                <div class="processed-services-panel">
                  <div v-if="authAssignments.length" class="processed-service-list">
                    <div v-for="item in authAssignments" :key="item.app_code" class="processed-service-row">
                      <div class="processed-service-main">
                        <div class="processed-service-name">{{ item.app_name }}（{{ item.app_code }}）</div>
                        <div class="processed-service-meta">已分配 {{ item.api_ids.length }} 个 API</div>
                      </div>
                      <div class="processed-service-actions">
                        <el-button link type="primary" @click="openAssignmentDetail(item)">详情</el-button>
                        <el-button link type="primary" @click="reuseAssignment(item)">重新选择</el-button>
                      </div>
                    </div>
                  </div>
                  <el-empty v-else description="暂无已处理服务" :image-size="44" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="authStep === 1">
            <div class="step-layout">
              <div class="section-head">
                <h3 class="section-title">当前调用方服务</h3>
                <span class="section-meta">{{ currentCallerAppName }}</span>
              </div>
              <el-transfer
                v-model="currentTransferKeys"
                filterable
                :titles="['未授权新增 API', `本次授权 API（${currentTransferKeys.length}）`]"
                :props="{ key: 'key', label: 'label' }"
                :data="transferData"
                target-order="push"
                filter-placeholder="搜索 API 名称或请求路径"
                class="api-transfer"
              />
            </div>
          </template>

              <template v-else-if="authStep === 2">
                <div class="step-layout">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="当前调用方服务">{{ currentCallerAppName }}</el-descriptions-item>
                    <el-descriptions-item label="被调用方服务">{{ authMeta.callee_app_name }}（{{ authMeta.callee_app_code }}）</el-descriptions-item>
                  </el-descriptions>
                  <el-table :data="currentApiRows" border max-height="440">
                    <el-table-column prop="api_name" label="API 名称" min-width="220" />
                    <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
                  </el-table>
            </div>
          </template>

              <template v-else>
                <div class="step-layout">
                  <div v-if="authCompleted" class="complete-tip">
                    <el-tag type="success" size="large">授权完成</el-tag>
                  </div>
                  <div class="review-summary">
                    <el-tag>调用方服务 {{ authAssignments.length }} 个</el-tag>
                    <el-tag type="success">本次授权 API {{ uniqueAssignedApiCount }} 个</el-tag>
                    <el-tag type="info">授权明细 {{ finalRows.length }} 条</el-tag>
                    <el-tag type="warning">未授权 API {{ unassignedApis.length }} 个</el-tag>
                  </div>
                  <el-tabs v-model="finalTab" class="final-tabs">
                    <el-tab-pane label="最终授权确认清单" name="authorized">
                      <div class="final-main-table">
                        <el-table :data="finalRows" border max-height="420">
                          <el-table-column prop="caller_app_name" label="调用方服务" min-width="220" />
                          <el-table-column prop="api_name" label="API 名称" min-width="220" />
                          <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
                        </el-table>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane :label="`未授权 API（${unassignedApis.length}）`" name="unassigned">
                      <div class="step-section secondary-section">
                        <el-empty v-if="!unassignedApis.length" description="所有新增 API 均已纳入授权" :image-size="44" />
                        <el-table v-else :data="unassignedApis" border max-height="400">
                          <el-table-column prop="api_name" label="API 名称" min-width="220" />
                          <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
                        </el-table>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </template>
            </el-card>
          </div>

      <template #footer>
        <template v-if="authStep === 0">
          <el-button @click="closeAuthorizeDialog">取消</el-button>
          <el-button type="primary" :disabled="!authAssignments.length" @click="goAuthorizeReview">完成确认</el-button>
        </template>
        <template v-else-if="authStep === 1">
          <el-button @click="goAuthPrevStep">上一步</el-button>
          <el-button type="primary" :disabled="!currentTransferKeys.length" @click="goAuthNextStep">下一步</el-button>
        </template>
        <template v-else-if="authStep === 2">
          <el-button @click="goAuthPrevStep">上一步</el-button>
          <el-button type="primary" plain @click="confirmAndContinue">确认并继续</el-button>
          <el-button type="primary" @click="confirmAndFinish">确认并完成</el-button>
        </template>
        <template v-else>
          <el-button @click="cancelAuthorize">取消授权</el-button>
          <el-button plain type="primary" @click="restartAuthorize">重新选择</el-button>
          <el-button type="primary" @click="confirmAuthorize" :disabled="authCompleted">
            {{ authCompleted ? '已确认' : '确认授权' }}
          </el-button>
        </template>
      </template>
    </el-dialog>

    <el-drawer v-model="assignmentDetailVisible" title="已处理服务详情" size="640px">
      <div class="api-detail-panel">
        <el-descriptions v-if="assignmentDetailTarget" :column="1" border>
          <el-descriptions-item label="调用方服务">{{ assignmentDetailTarget.app_name }}（{{ assignmentDetailTarget.app_code }}）</el-descriptions-item>
          <el-descriptions-item label="已分配 API 数量">{{ assignmentDetailTarget.api_ids.length }} 个</el-descriptions-item>
        </el-descriptions>

        <el-table :data="assignmentDetailRows" border>
          <el-table-column prop="api_name" label="API 名称" min-width="220" />
          <el-table-column prop="api_path" label="请求路径" min-width="320" show-overflow-tooltip />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import DiffCard from '@/components/DiffCard.vue';
import { analyzeSmartDoc, confirmSmartDocImport } from '@/mock/smartdoc';
import { fetchApiOptions } from '@/mock/api';
import { saveReverseAuthorization } from '@/mock/auth';

interface AuthApiItem {
  id: number;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
}

interface AuthAssignment {
  app_code: string;
  app_name: string;
  api_ids: number[];
}

const step = ref(0);
const diff = ref<any>(null);
const tab = ref('add');
const draft = reactive({ app_code: '', version: '', remark: '' });
const appOptions = ref<any[]>([]);
const resultVisible = ref(false);
const importResult = ref<any>(null);

const authVisible = ref(false);
const authStep = ref(0);
const authCompleted = ref(false);
const finalTab = ref('authorized');
const authFlowItems = [
  { title: '选择调用方服务', desc: '先确定当前要授权的服务' },
  { title: '选择 API', desc: '为当前服务分配新增 API' },
  { title: '确认当前服务', desc: '继续授权其他服务或进入最终确认' },
  { title: '最终确认', desc: '统一确认全部授权结果' }
];
const authCatalog = ref<AuthApiItem[]>([]);
const authAssignments = ref<AuthAssignment[]>([]);
const currentCallerAppCode = ref('');
const currentTransferKeys = ref<number[]>([]);
const assignmentDetailVisible = ref(false);
const assignmentDetailTarget = ref<AuthAssignment | null>(null);
const authMeta = reactive({
  callee_app_code: '',
  callee_app_name: '',
  version: ''
});

const processedCallerCodes = computed(() => authAssignments.value.map((item) => item.app_code));
const availableCallerApps = computed(() =>
  appOptions.value.filter((item) => item.app_code !== authMeta.callee_app_code)
);
const currentCallerAppName = computed(() => {
  const target = availableCallerApps.value.find((item) => item.app_code === currentCallerAppCode.value);
  return target ? `${target.app_name}（${target.app_code}）` : '-';
});
const transferData = computed(() =>
  authCatalog.value.map((item) => ({
    key: item.id,
    label: `${item.api_name} - ${item.api_path}`
  }))
);
const authApiMap = computed(() => new Map(authCatalog.value.map((item) => [item.id, item])));
const currentApiRows = computed(() =>
  currentTransferKeys.value
    .map((id) => authApiMap.value.get(id))
    .filter(Boolean)
);
const assignmentDetailRows = computed(() =>
  (assignmentDetailTarget.value?.api_ids || [])
    .map((id) => authApiMap.value.get(id))
    .filter(Boolean)
);
const assignedApiCount = computed(() => authAssignments.value.reduce((sum, item) => sum + item.api_ids.length, 0));
const uniqueAssignedApiCount = computed(() => new Set(authAssignments.value.flatMap((item) => item.api_ids)).size);
const unassignedApis = computed(() => {
  const assignedIdSet = new Set(authAssignments.value.flatMap((item) => item.api_ids));
  return authCatalog.value.filter((item) => !assignedIdSet.has(item.id));
});
const finalRows = computed(() =>
  authAssignments.value.flatMap((assignment) =>
    assignment.api_ids.map((apiId) => {
      const api = authApiMap.value.get(apiId);
      return {
        caller_app_code: assignment.app_code,
        caller_app_name: assignment.app_name,
        api_name: api?.api_name || '',
        api_path: api?.api_path || ''
      };
    })
  )
);

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
  authMeta.callee_app_code = draft.app_code || data.additions?.[0]?.app_code || '';
  authMeta.callee_app_name = data.additions?.[0]?.app_name || '';
  authMeta.version = draft.version;
  cancelImport();
  ElMessage.success(message);
}

function cancelImport() {
  diff.value = null;
  step.value = 0;
  Object.assign(draft, { app_code: '', version: '', remark: '' });
}

function resetAuthorizeState() {
  authStep.value = 0;
  authCompleted.value = false;
  finalTab.value = 'authorized';
  authAssignments.value = [];
  currentCallerAppCode.value = '';
  currentTransferKeys.value = [];
  assignmentDetailVisible.value = false;
  assignmentDetailTarget.value = null;
  authCatalog.value = [];
}

function goAuthorize() {
  authCatalog.value = (importResult.value?.additions || []).map((item: any) => ({
    id: item.id,
    app_code: item.app_code,
    app_name: item.app_name,
    api_name: item.api_name,
    api_path: item.api_path
  }));
  resetAuthorizeState();
  authCatalog.value = (importResult.value?.additions || []).map((item: any) => ({
    id: item.id,
    app_code: item.app_code,
    app_name: item.app_name,
    api_name: item.api_name,
    api_path: item.api_path
  }));
  resultVisible.value = false;
  authVisible.value = true;
}

function goAuthPrevStep() {
  if (authStep.value > 0) {
    authStep.value -= 1;
  }
}

function goAuthNextStep() {
  if (authStep.value === 0) {
    if (!currentCallerAppCode.value) return;
    if (processedCallerCodes.value.includes(currentCallerAppCode.value)) {
      ElMessage.warning('该调用方服务已处理，请重新选择');
      return;
    }
    authStep.value = 1;
    return;
  }
  if (authStep.value === 1) {
    if (!currentTransferKeys.value.length) return;
    authStep.value = 2;
  }
}

function saveCurrentAssignment() {
  const target = availableCallerApps.value.find((item) => item.app_code === currentCallerAppCode.value);
  if (!target) {
    ElMessage.warning('请先选择调用方服务');
    return false;
  }
  if (!currentTransferKeys.value.length) {
    ElMessage.warning('请至少选择一个 API');
    return false;
  }
  if (processedCallerCodes.value.includes(currentCallerAppCode.value)) {
    ElMessage.warning('该调用方服务已处理，请重新选择');
    return false;
  }
  authAssignments.value.push({
    app_code: target.app_code,
    app_name: target.app_name,
    api_ids: [...currentTransferKeys.value]
  });
  return true;
}

function confirmAndContinue() {
  const ok = saveCurrentAssignment();
  if (!ok) return;
  currentCallerAppCode.value = '';
  currentTransferKeys.value = [];
  authStep.value = 0;
}

function confirmAndFinish() {
  const ok = saveCurrentAssignment();
  if (!ok) return;
  authStep.value = 3;
}

function goAuthorizeReview() {
  if (!authAssignments.value.length) {
    ElMessage.warning('请先至少完成一个调用方服务的授权');
    return;
  }
  authStep.value = 3;
}

function openAssignmentDetail(item: AuthAssignment) {
  assignmentDetailTarget.value = item;
  assignmentDetailVisible.value = true;
}

function reuseAssignment(item: AuthAssignment) {
  currentCallerAppCode.value = item.app_code;
  currentTransferKeys.value = [...item.api_ids];
  authAssignments.value = authAssignments.value.filter((assignment) => assignment.app_code !== item.app_code);
  assignmentDetailVisible.value = false;
  assignmentDetailTarget.value = null;
  authStep.value = 1;
}

function cancelAuthorize() {
  authAssignments.value = [];
  currentCallerAppCode.value = '';
  currentTransferKeys.value = [];
  authStep.value = 0;
  authCompleted.value = false;
}

function restartAuthorize() {
  authAssignments.value = [];
  currentCallerAppCode.value = '';
  currentTransferKeys.value = [];
  authStep.value = 0;
  authCompleted.value = false;
}

async function confirmAuthorize() {
  console.log('authMap', authAssignments.value);

  for (const assignment of authAssignments.value) {
    const selectedApis = assignment.api_ids
      .map((id) => authApiMap.value.get(id))
      .filter(Boolean)
      .map((item) => ({
        id: item!.id,
        api_path: item!.api_path,
        app_code: item!.app_code
      }));
    const { code, message } = await saveReverseAuthorization({
      selected_apis: selectedApis,
      checked_app_codes: [assignment.app_code],
      original_app_codes: []
    });
    if (code !== 0) {
      ElMessage.error(message);
      return;
    }
  }

  authCompleted.value = true;
  ElMessage.success('新增 API 授权成功');
  authVisible.value = false;
  resetAuthorizeState();
}

function closeAuthorizeDialog() {
  authVisible.value = false;
  resetAuthorizeState();
}

onMounted(async () => {
  const { data } = await fetchApiOptions();
  appOptions.value = data.apps;
});
</script>

<style scoped>
.smartdoc-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

.diff-summary,
.review-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
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

.auth-shell {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-flow {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 34px;
}

.flow-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--sg-border);
  border-radius: 14px;
  background: #fff;
}

.flow-node.is-active {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.flow-node.is-done {
  border-color: #16a34a;
  background: #f0fdf4;
}

.flow-index {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  background: #e2e8f0;
}

.flow-node.is-active .flow-index {
  color: #fff;
  background: #2563eb;
}

.flow-node.is-done .flow-index {
  color: #fff;
  background: #16a34a;
}

.flow-text {
  min-width: 0;
}

.flow-title {
  color: var(--sg-text);
  font-size: 14px;
  font-weight: 700;
}

.flow-desc {
  margin-top: 4px;
  color: var(--sg-subtext);
  font-size: 12px;
  line-height: 1.4;
}

.flow-line {
  position: absolute;
  top: 50%;
  right: -12px;
  width: 12px;
  height: 2px;
  background: #cbd5e1;
  transform: translateY(-50%);
}

.flow-return {
  position: absolute;
  left: 0;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--sg-subtext);
  font-size: 12px;
}

.flow-return-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  font-size: 14px;
  font-weight: 700;
}

.step-card {
  border-radius: 12px;
  min-height: 570px;
}

.step-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;
}

.step-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-section {
  padding-top: 6px;
  min-height: 360px;
}

.secondary-section :deep(.el-empty) {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-section :deep(.el-empty__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  color: var(--sg-text);
  font-size: 15px;
  font-weight: 700;
}

.final-main-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.final-tabs {
  display: flex;
  flex-direction: column;
}

.final-main-head {
  margin-top: 4px;
}

.section-meta {
  color: var(--sg-subtext);
  font-size: 12px;
}

.service-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.caller-select-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.caller-select {
  flex: 1;
}

.processed-services-panel {
  min-height: 310px;
  max-height: 310px;
  overflow: auto;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.processed-services-panel :deep(.el-empty) {
  width: 100%;
  min-height: 284px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processed-services-panel :deep(.el-empty__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.processed-services-panel :deep(.el-empty__image) {
  margin-bottom: 4px;
}

.processed-services-panel :deep(.el-empty__description) {
  margin-top: 0;
}

.processed-service-list {
  display: flex;
  flex-direction: column;
}

.processed-service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #e2e8f0;
}

.processed-service-row:first-child {
  padding-top: 2px;
}

.processed-service-row:last-child {
  border-bottom: none;
  padding-bottom: 2px;
}

.processed-service-main {
  min-width: 0;
}

.processed-service-name {
  color: var(--sg-text);
  font-weight: 600;
  line-height: 1.5;
}

.processed-service-meta {
  margin-top: 4px;
  color: var(--sg-subtext);
  font-size: 12px;
  line-height: 1.6;
}

.processed-service-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-transfer {
  width: 100%;
}

.step-card :deep(.el-transfer) {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 96px minmax(0, 1fr) !important;
  align-items: start !important;
  gap: 20px !important;
  width: 100% !important;
}

.api-transfer :deep(.el-transfer) {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 96px minmax(0, 1fr) !important;
  align-items: start !important;
  gap: 20px !important;
  width: 100% !important;
  max-width: 100% !important;
}

.api-transfer :deep(.el-transfer-panel) {
  width: 100% !important;
  min-width: 0;
  max-width: none !important;
  height: 490px;
}

.api-transfer :deep(.el-transfer__buttons) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  align-self: center;
  width: 96px;
  min-width: 96px;
}

.api-transfer :deep(.el-transfer__buttons .el-button) {
  width: 96px;
  margin: 0 !important;
}

.api-transfer :deep(.el-transfer-panel__body) {
  height: calc(100% - 40px);
}

.api-transfer :deep(.el-transfer-panel__list) {
  height: 100%;
}

.empty-text {
  color: var(--sg-subtext);
}

.complete-tip {
  display: flex;
  justify-content: flex-end;
}
</style>
