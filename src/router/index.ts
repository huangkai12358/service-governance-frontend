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
        meta: { title: '首页概览' }
      },
      {
        path: 'dashboard/topology',
        name: 'ApiAuthTopology',
        component: () => import('@/views/dashboard/ApiAuthTopologyView.vue'),
        meta: { title: 'API授权拓扑图' }
      },
      {
        path: 'api/list',
        name: 'ApiList',
        component: () => import('@/views/api/ApiListView.vue'),
        meta: { title: 'API 列表' }
      },
      {
        path: 'api/smartdoc',
        name: 'SmartDocImport',
        component: () => import('@/views/smartdoc/SmartDocImportView.vue'),
        meta: { title: 'SmartDoc 导入' }
      },
      {
        path: 'api/version-history',
        name: 'ApiVersionHistory',
        component: () => import('@/views/version/VersionListView.vue'),
        meta: { title: '历史版本管理' }
      },
      {
        path: 'app/list',
        name: 'AppList',
        component: () => import('@/views/app/AppListView.vue'),
        meta: { title: 'APP 列表' }
      },
      {
        path: 'groups/api',
        name: 'ApiGroupList',
        component: () => import('@/views/groups/ApiGroupListView.vue'),
        meta: { title: 'API 分组' }
      },
      {
        path: 'groups/app',
        name: 'AppGroupList',
        component: () => import('@/views/groups/AppGroupListView.vue'),
        meta: { title: 'APP 分组' }
      },
      {
        path: 'auth/app',
        name: 'SingleAppAuth',
        component: () => import('@/views/auth/SingleAppAuthView.vue'),
        meta: { title: '单个应用授权' }
      },
      {
        path: 'auth/app-group',
        name: 'AppGroupAuth',
        component: () => import('@/views/auth/AppGroupAuthView.vue'),
        meta: { title: '应用组授权' }
      },
      {
        path: 'logs/auth-config',
        name: 'AuthConfigLog',
        component: () => import('@/views/logs/AuthConfigLogView.vue'),
        meta: { title: '权限配置历史记录' }
      },
      {
        path: 'logs/smartdoc-import',
        name: 'SmartDocImportLog',
        component: () => import('@/views/logs/SmartDocImportLogView.vue'),
        meta: { title: 'SmartDoc 导入历史记录' }
      },
      {
        path: 'logs/remote-call',
        name: 'RemoteCallLog',
        component: () => import('@/views/logs/RemoteCallLogView.vue'),
        meta: { title: '远程调用历史记录' }
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
  document.title = `${to.meta.title ?? '服务治理平台'} - 服务治理平台`;
});

export default router;
