import {
  Connection,
  Grid,
  Histogram,
  Monitor,
  OfficeBuilding
} from '@element-plus/icons-vue';

export interface MenuItem {
  title: string;
  path: string;
  icon?: unknown;
  children?: MenuItem[];
}

export const menus: MenuItem[] = [
  { title: '首页', path: '/dashboard', icon: Grid },
  { title: 'API 授权拓扑图', path: '/dashboard/topology', icon: Connection },
  {
    title: 'API 管理',
    path: '/api',
    icon: Monitor,
    children: [
      { title: 'API 列表', path: '/api/list' },
      { title: 'SmartDoc 导入', path: '/api/smartdoc' }
    ]
  },
  {
    title: 'APP 管理',
    path: '/app',
    icon: OfficeBuilding,
    children: [{ title: 'APP 列表', path: '/app/list' }]
  },
  {
    title: '权限管理',
    path: '/auth',
    icon: Connection,
    children: [
      { title: '单个应用授权', path: '/auth/app' },
      { title: 'API 反向授权', path: '/auth/api-reverse' }
    ]
  },
  {
    title: '日志查询',
    path: '/logs',
    icon: Histogram,
    children: [
      { title: '权限配置历史记录', path: '/logs/auth-config' },
      { title: 'SmartDoc 导入历史记录', path: '/logs/smartdoc-import' },
      { title: '远程调用历史记录', path: '/logs/remote-call' }
    ]
  }
];
