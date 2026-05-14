<template>
  <div class="login-shell">
    <div class="login-content">
      <section class="login-left">
        <div class="brand-row">
          <div class="brand-text"></div>
        </div>

        <div class="intro">
          <p class="eyebrow">WELCOME BACK</p>
          <h1>服务治理平台</h1>
        </div>

        <div class="login-panel">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入密码" show-password @keyup.enter="submit" />
            </el-form-item>
            <el-button type="primary" class="submit-btn" :loading="submitting" @click="submit">登录系统</el-button>
          </el-form>
        </div>
      </section>

      <section class="login-right">
        <div class="visual-top">
          <div>
            <p class="visual-kicker">SERVICE GOVERNANCE</p>
            <h2>服务治理</h2>
          </div>
          <div class="contact-meta"></div>
        </div>

        <div class="product-scene">
          <div class="shape shape-blue"></div>
          <div class="shape shape-pink"></div>
          <div class="shape shape-gold"></div>
          <div class="shape shape-ivory"></div>

          <div class="scene-window">
            <div class="window-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="window-body">
              <div class="window-sidebar">
                <div class="window-dot active"></div>
                <div class="window-dot"></div>
                <div class="window-dot"></div>
              </div>
              <div class="window-main">
                <div class="window-header">
                  <p>服务治理 1/2</p>
                  <div class="avatar-chip"></div>
                </div>
                <div class="flow-grid">
                  <div class="flow-card success">
                    <span>1</span>
                    <p>接口管理</p>
                  </div>
                  <div class="flow-card warn">
                    <span>2</span>
                    <p>服务管理</p>
                  </div>
                  <div class="flow-card info">
                    <span>3</span>
                    <p>日志管理</p>
                  </div>
                  <div class="flow-card neutral">
                    <span>4</span>
                    <p>日志管理</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="floating-card status-card">
            <div>
              <strong>权限配置管理</strong>
              <p>为当前每一个API接口配置访问的权限</p>
            </div>
            <div class="mini-gear">⚙</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  username: '',
  password: ''
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

/**
 * 提交登录表单，登录成功后统一进入首页。
 */
async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const data = await login({
      username: form.username,
      password: form.password
    });
    // 只有真实后端返回 sessionToken 后才写入 Pinia 和 localStorage，避免离线状态进入系统。
    authStore.login({
      username: data.username,
      sessionToken: data.sessionToken
    });
    ElMessage.success('登录成功');
    await router.replace('/dashboard');
    return;
  } catch {
    ElMessage.error('用户名或密码错误');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  padding: 0;
  background:
    radial-gradient(circle at 12% 14%, rgba(51, 76, 220, 0.1), transparent 22%),
    radial-gradient(circle at 85% 82%, rgba(255, 79, 121, 0.12), transparent 24%),
    linear-gradient(135deg, #f7f8fe 0%, #f4f7fb 48%, #eef4ff 100%);
}

.login-content {
  display: grid;
  grid-template-columns: minmax(420px, 0.95fr) minmax(520px, 1.2fr);
  min-width: 1360px;
  min-height: 100vh;
  /* 仅保留分栏布局能力，去掉外层大卡片的背景、边框和阴影 */
  background: transparent;
}

.login-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 统一增加左侧留白，让欢迎语、标题和表单整体继续向右偏移一点 */
  padding: 54px 52px 54px 80px;
  /* 左侧直接承载页面内容，弱化独立白色面板的视觉感 */
  background: transparent;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 54px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #4a56e2, #1f2d96);
  box-shadow: 0 12px 28px rgba(49, 71, 203, 0.24);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-text strong {
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
  color: #161b5b;
  text-transform: lowercase;
}

.brand-text span {
  color: #7783ab;
  font-size: 13px;







}

.intro {
  margin-bottom: 34px;

}

.eyebrow {
  margin: 0 0 16px;
  color: var(--sg-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.intro h1 {
  margin: 0;
  color: #11174d;
  font-size: clamp(46px, 4vw, 72px);
  line-height: 0.96;
  font-weight: 800;
}

.intro-copy {
  max-width: 420px;
  margin: 22px 0 0;
  color: #6f7f9f;
  font-size: 18px;
  line-height: 1.8;
}

.login-panel {
  width: min(100%, 420px);



}

.login-panel :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-panel :deep(.el-form-item__label) {
  padding-bottom: 10px;
  color: #5b6787;
  font-size: 14px;
  font-weight: 600;
}

.login-panel :deep(.el-input__wrapper) {
  min-height: 56px;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(216, 223, 240, 0.95) inset;
  background: rgba(255, 255, 255, 0.96);
}

.login-panel :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(29, 78, 216, 0.45) inset;
}

.login-panel :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(29, 78, 216, 0.88) inset,
    0 10px 24px rgba(29, 78, 216, 0.14);
}

.submit-btn {
  width: 100%;
  height: 58px;
  margin-top: 8px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #3b82f6, var(--sg-primary));
  box-shadow: 0 16px 34px rgba(29, 78, 216, 0.22);
  font-size: 16px;
  font-weight: 700;
}

.helper-copy {
  margin: 18px 6px 0;
  color: #8a95b4;
  font-size: 13px;
}

.login-right {
  position: relative;
  overflow: hidden;
  padding: 40px 40px 34px;
  background:
    linear-gradient(145deg, #3b82f6 0%, #2563eb 42%, #7db7fc 100%);
}

.visual-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  color: #fff;
}

.visual-kicker {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  opacity: 0.76;
}

.visual-top h2 {
  max-width: 360px;
  margin: 0;
  font-size: 34px;
  line-height: 1.22;
  font-weight: 700;
}

.contact-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 14px;
  text-align: right;
}

.product-scene {
  position: relative;
  height: 100%;
  min-height: 540px;
  margin-top: 24px;
}

.shape {
  position: absolute;
  border-radius: 999px;
  filter: drop-shadow(0 24px 32px rgba(31, 41, 103, 0.18));
}

.shape-blue {
  top: -80px;
  right: -120px;
  width: 280px;
  height: 280px;
  background: rgba(191, 219, 254, 0.66);
}

.shape-pink {
  right: -50px;
  bottom: -120px;
  width: 320px;
  height: 320px;
  background: linear-gradient(135deg, #ff5d8a, #ff4774);
}

.shape-gold {
  bottom: -24px;
  left: 200px;
  width: 190px;
  height: 190px;
  background: linear-gradient(135deg, #ffcb45, #f6ac00);
}

.shape-ivory {
  bottom: 80px;
  left: 108px;
  width: 170px;
  height: 170px;
  background: linear-gradient(135deg, #ffe6b2, #ffd57c);
}

.scene-window {
  position: absolute;
  top: 126px;
  left: 56px;
  width: min(100%, 690px);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 30px 70px rgba(25, 39, 115, 0.22);
  overflow: hidden;
}

.window-bar {
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #17105b;
}

.window-bar span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.window-bar span:nth-child(1) {
  background: #ff5f57;
}

.window-bar span:nth-child(2) {
  background: #febc2e;
}

.window-bar span:nth-child(3) {
  background: #28c840;
}

.window-body {
  display: grid;
  grid-template-columns: 54px 1fr;
}

.window-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 92px;
}

.window-dot {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: #edf0fa;
}

.window-dot.active {
  background: linear-gradient(135deg, #3b82f6, var(--sg-primary));
}

.window-main {
  padding: 28px 30px 34px 20px;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.window-header p {
  margin: 0;
  color: #313768;
  font-size: 20px;
  font-weight: 700;
}

.avatar-chip {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffcf4b, #ff6b8d);
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.flow-card {
  min-height: 126px;
  padding: 18px 16px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 0 1px rgba(229, 233, 246, 0.9);
}

.flow-card span {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.75);
}

.flow-card p {
  margin: 0;
  color: #4f5c7d;
  font-size: 13px;
  line-height: 1.55;
  font-weight: 600;
}

.flow-card.success {
  background: linear-gradient(180deg, #e7fff3, #d9f8e9);
}

.flow-card.warn {
  background: linear-gradient(180deg, #fff3ef, #ffe7e2);
}

.flow-card.info {
  background: linear-gradient(180deg, #fff8dd, #fff0bf);
}

.flow-card.neutral {
  background: linear-gradient(180deg, #f2f4ff, #ebefff);
}

.floating-card {
  position: absolute;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 24px 56px rgba(34, 46, 124, 0.18);
}

.chart-card {
  left: 250px;
  bottom: 72px;
  width: 230px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.pie-chart {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: conic-gradient(#4057eb 0 34%, #ff557f 34% 70%, #ffba19 70% 100%);
}

.chart-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #56617f;
  font-size: 12px;
  font-weight: 600;
}

.legend {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 8px;
}

.legend.blue {
  background: #4057eb;
}

.legend.pink {
  background: #ff557f;
}

.legend.gold {
  background: #ffba19;
}

.status-card {
  right: 0;
  top: 294px;
  width: 294px;
  padding: 24px 24px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.status-card strong {
  display: block;
  color: #303660;
  font-size: 22px;
  line-height: 1.2;
  margin-bottom: 10px;
}

.status-card p {
  margin: 0;
  color: #66748f;
  font-size: 13px;
  line-height: 1.6;
}

.mini-gear {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #f4f6ff;
  color: #5867db;
  font-size: 20px;
}

@media (max-width: 1240px) {
  .login-right {
    min-height: 620px;
  }
}

@media (max-width: 900px) {
  .chart-card {
    left: 50%;
    transform: translateX(-50%);
    bottom: 48px;
  }

  .status-card {
    right: 24px;
    top: 440px;
    width: 260px;
  }
}

@media (max-width: 640px) {
  .login-content {
    border-radius: 24px;
  }

  .login-left {
    padding: 26px 20px 34px;
  }

  .brand-text strong {
    font-size: 24px;
  }

  .intro h1 {
    font-size: 40px;
  }

  .intro-copy {
    font-size: 15px;

  }

  .login-right {
    display: none;
  }
}
</style>
