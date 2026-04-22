import {
  Connection,
  DataAnalysis,
  Document,
  Files,
  Grid,
  Histogram,
  Lock,
  Memo,
  Monitor,
  Share
} from '@element-plus/icons-vue';

export const menus = [
  { name: 'Dashboard', title: '首页', path: '/dashboard', icon: Grid },
  { name: 'ApiManagement', title: 'API管理', path: '/api', icon: Monitor },
  { name: 'SmartDocImport', title: 'SmartDoc导入', path: '/smartdoc', icon: Document },
  { name: 'VersionManagement', title: '版本管理', path: '/versions', icon: Files },
  { name: 'AppGroupManagement', title: '应用分组', path: '/app-groups', icon: Share },
  { name: 'ApiGroupManagement', title: 'API分组', path: '/api-groups', icon: Memo },
  { name: 'AuthorizationManagement', title: '授权管理', path: '/authorization', icon: Lock },
  { name: 'AuthorizationHistory', title: '权限配置历史', path: '/auth-history', icon: Connection },
  { name: 'VersionHistory', title: '版本历史记录', path: '/version-history', icon: DataAnalysis },
  { name: 'RemoteLogs', title: '远程调用日志', path: '/logs', icon: Histogram }
];
