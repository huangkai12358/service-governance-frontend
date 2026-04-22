<template>
  <div class="login-shell">
    <div class="login-panel panel-card">
      <div class="intro">
        <el-tag type="primary" effect="dark">Basic Auth Mock</el-tag>
        <h1>服务治理管理平台</h1>
        <p>统一管理 API 资产、授权关系、SmartDoc 导入版本与远程调用日志。</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" show-password @keyup.enter="submit" />
        </el-form-item>
        <el-alert title="演示账号：admin / admin123" type="info" :closable="false" show-icon />
        <el-button type="primary" class="submit-btn" @click="submit">登录系统</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();

const form = reactive({
  username: 'admin',
  password: 'admin123'
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  if (form.username === 'admin' && form.password === 'admin123') {
    authStore.login({
      username: form.username,
      token: btoa(`${form.username}:${form.password}`)
    });
    ElMessage.success('登录成功');
    router.push((route.query.redirect as string) || '/dashboard');
    return;
  }
  ElMessage.error('用户名或密码错误');
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(29, 78, 216, 0.12), rgba(15, 118, 110, 0.08)),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9) 18px, rgba(241, 245, 249, 0.9) 18px, rgba(241, 245, 249, 0.9) 36px);
}

.login-panel {
  width: 460px;
  padding: 34px;
}

.intro h1 {
  margin: 16px 0 12px;
  font-size: 34px;
}

.intro p {
  margin: 0 0 24px;
  color: var(--sg-subtext);
  line-height: 1.6;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}
</style>
