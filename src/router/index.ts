import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'api',
        name: 'ApiManagement',
        component: () => import('@/views/api/ApiListView.vue'),
        meta: { title: 'API管理' }
      },
      {
        path: 'smartdoc',
        name: 'SmartDocImport',
        component: () => import('@/views/smartdoc/SmartDocImportView.vue'),
        meta: { title: 'SmartDoc导入' }
      },
      {
        path: 'versions',
        name: 'VersionManagement',
        component: () => import('@/views/version/VersionListView.vue'),
        meta: { title: '版本管理' }
      },
      {
        path: 'app-groups',
        name: 'AppGroupManagement',
        component: () => import('@/views/app-group/AppGroupView.vue'),
        meta: { title: '应用分组' }
      },
      {
        path: 'api-groups',
        name: 'ApiGroupManagement',
        component: () => import('@/views/api-group/ApiGroupView.vue'),
        meta: { title: 'API分组' }
      },
      {
        path: 'authorization',
        name: 'AuthorizationManagement',
        component: () => import('@/views/auth/AuthorizationView.vue'),
        meta: { title: '授权管理' }
      },
      {
        path: 'auth-history',
        name: 'AuthorizationHistory',
        component: () => import('@/views/history/AuthHistoryView.vue'),
        meta: { title: '权限配置历史' }
      },
      {
        path: 'version-history',
        name: 'VersionHistory',
        component: () => import('@/views/history/VersionHistoryView.vue'),
        meta: { title: '版本历史记录' }
      },
      {
        path: 'logs',
        name: 'RemoteLogs',
        component: () => import('@/views/logs/RemoteLogsView.vue'),
        meta: { title: '远程调用日志' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (!to.meta.public && !authStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.path === '/login' && authStore.isLoggedIn) {
    return '/dashboard';
  }
  document.title = `${to.meta.title ?? '服务治理管理平台'} - 服务治理管理平台`;
});

export default router;
