<template>
  <div class="layout-shell">
    <aside class="sider panel-card">
      <div class="brand">
        <div class="brand-mark">SG</div>
        <div>
          <strong>服务治理管理平台</strong>
          <p>API调用控制组件</p>
        </div>
      </div>
      <el-menu :default-active="route.path" :default-openeds="defaultOpeneds" router class="menu" background-color="transparent">
        <template v-for="item in menus" :key="item.path">
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <div class="main">
      <header class="topbar panel-card">
        <div>
          <h3>{{ currentTitle }}</h3>
          <p>统一管理服务资产、授权关系、文档版本与远程调用日志</p>
        </div>
        <div class="topbar-actions">
          <el-tag type="success">当前环境：Mock Sandbox</el-tag>
          <el-dropdown>
            <span class="user-trigger">
              {{ authStore.user?.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { menus } from './menu';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const currentTitle = computed(() => route.meta.title || '服务治理管理平台');
const defaultOpeneds = menus.filter((item) => item.children?.length).map((item) => item.path);

function logout() {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
}
</script>

<style scoped>
.layout-shell {
  display: grid;
  grid-template-columns: 248px 1fr;
  min-height: 100vh;
  padding: 16px;
  gap: 16px;
  background:
    radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 26%),
    radial-gradient(circle at right 20%, rgba(14, 165, 233, 0.08), transparent 18%),
    var(--sg-bg);
}

.sider {
  padding: 20px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 20px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1d4ed8, #0f766e);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.brand p {
  margin: 4px 0 0;
  color: var(--sg-subtext);
  font-size: 12px;
}

.menu {
  border-right: none;
}

.menu :deep(.el-menu-item) {
  height: 44px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.menu :deep(.el-sub-menu__title) {
  height: 44px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.menu :deep(.is-active) {
  background: var(--sg-primary-light);
  color: var(--sg-primary);
  font-weight: 600;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

.topbar h3 {
  margin: 0 0 4px;
  font-size: 22px;
}

.topbar p {
  margin: 0;
  color: var(--sg-subtext);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.content {
  min-height: 0;
}
</style>
