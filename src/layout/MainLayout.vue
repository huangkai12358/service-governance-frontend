<template>
  <div class="layout-shell">
    <aside class="sider panel-card">
      <div class="brand">
        <div class="brand-mark">SG</div>
        <div>
          <strong>服务治理管理平台</strong>
          <p>API 调用控制组件</p>
        </div>
      </div>
      <el-menu :default-active="route.path" router class="menu" background-color="transparent">
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
      <div class="userbar">
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
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { menus } from './menu';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

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

.menu :deep(.el-menu-item.is-active) {
  background: var(--sg-primary-light);
  color: var(--sg-primary);
  font-weight: 600;
}

.menu :deep(.el-sub-menu .el-menu-item) {
  font-size: 13px;
  padding-left: 52px !important;
}

.main {
  position: relative;
  min-width: 0;
  padding: 10px 0px;
}

.userbar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px 0 14px;
  border: 1px solid var(--sg-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  color: var(--sg-text);
  font-size: 14px;
  font-weight: 500;
}

.content {
  min-height: 0;
  min-width: 0;
  width: 100%;
  padding-top: 2px;
}

.content :deep(.page-title) {
  padding-right: 148px;
}
</style>
