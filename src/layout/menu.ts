import {
  Connection,
  Grid,
  Histogram,
  Memo,
  Monitor,
  OfficeBuilding,
  Share
} from '@element-plus/icons-vue';

export interface MenuItem {
  title: string;
  path: string;
  icon?: unknown;
  children?: MenuItem[];
}

export const menus: MenuItem[] = [
  { title: '首页', path: '/dashboard', icon: Grid },
  {
    title: 'API管理',
    path: '/api',
    icon: Monitor,
    children: [
      { title: 'API列表', path: '/api/list' },
      { title: 'SmartDoc导入', path: '/api/smartdoc' },
      { title: '历史版本管理', path: '/api/version-history' }
    ]
  },
  {
    title: 'APP管理',
    path: '/app',
    icon: OfficeBuilding,
    children: [{ title: 'APP列表', path: '/app/list' }]
  },
  {
    title: '分组管理',
    path: '/groups',
    icon: Share,
    children: [
      { title: 'API分组', path: '/groups/api' },
      { title: 'APP分组', path: '/groups/app' }
    ]
  },
  {
    title: '权限管理',
    path: '/auth',
    icon: Connection,
    children: [
      { title: '单个应用授权', path: '/auth/app' },
      { title: '应用组授权', path: '/auth/app-group' }
    ]
  },
  {
    title: '日志查询',
    path: '/logs',
    icon: Histogram,
    children: [
      { title: '权限配置历史记录', path: '/logs/auth-config' },
      { title: 'SmartDoc导入历史记录', path: '/logs/smartdoc-import' },
      { title: '远程调用历史记录', path: '/logs/remote-call' }
    ]
  }
];
