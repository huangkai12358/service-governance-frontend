<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-header">
        <p class="eyebrow">WELCOME BACK</p>
        <h1>登录系统</h1>
        <p class="login-subtitle">请输入账号和密码进入服务治理平台</p>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const route = useRoute();
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

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  try {
    submitting.value = true;
    const userInfo = await login({
      username: form.username,
      password: form.password
    });
    authStore.login(userInfo);
    ElMessage.success('登录成功');
    await router.push((route.query.redirect as string) || '/dashboard');
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败';
    ElMessage.error(message);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 28%),
    radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.1), transparent 26%),
    linear-gradient(135deg, #f5f7fb 0%, #edf2fb 52%, #e8eef9 100%);
}

.login-card {
  width: min(100%, 440px);
  padding: 40px 36px 32px;
  border: 1px solid rgba(220, 227, 242, 0.9);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.08),
    0 6px 16px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(10px);
}

.login-header {
  margin-bottom: 28px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--sg-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.login-header h1 {
  margin: 0;
  color: #162033;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
}

.login-subtitle {
  margin: 12px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.login-panel :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-panel :deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: #5b6787;
  font-size: 14px;
  font-weight: 600;
}

.login-panel :deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(216, 223, 240, 0.95) inset;
  background: #fff;
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
  height: 50px;
  margin-top: 4px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, var(--sg-primary));
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.18);
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 640px) {
  .login-shell {
    padding: 16px;
  }

  .login-card {
    padding: 32px 20px 24px;
    border-radius: 16px;
  }

  .login-header h1 {
    font-size: 26px;
  }
}
</style>
