export type ApiStatus = 'ONLINE' | 'OFFLINE' | 'DRAFT';
export type CheckResult = 'SUCCESS' | 'FAIL' | 'BYPASS';
export type VersionStatus = 'CURRENT' | 'ROLLED_BACK' | 'ARCHIVED';
export type GrantMode = 'api' | 'group';

export interface UserInfo {
  username: string;
  token: string;
}

export interface OverviewStats {
  apiCount: number;
  appCount: number;
  appGroupCount: number;
  apiGroupCount: number;
  grantCount: number;
  todayCalls: number;
  todayAuthFail: number;
}

export interface ActivityRecord {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'IMPORT' | 'AUTH' | 'LOG';
}

export interface ApiItem {
  id: string;
  appId: string;
  appName: string;
  groupIds: string[];
  groupNames: string[];
  name: string;
  description: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  version: string;
  status: ApiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppItem {
  id: string;
  name: string;
  owner: string;
}

export interface AppGroupItem {
  id: string;
  name: string;
  description: string;
  appIds: string[];
  appNames: string[];
  updatedAt: string;
}

export interface ApiGroupItem {
  id: string;
  appId: string;
  appName: string;
  name: string;
  description: string;
  apiIds: string[];
  apiNames: string[];
  updatedAt: string;
}

export interface ApiChangeRecord {
  id: string;
  operator: string;
  action: string;
  content: string;
  time: string;
}

export interface AuthorizationRecord {
  id: string;
  callerType: 'APP' | 'APP_GROUP';
  callerName: string;
  calleeAppId: string;
  calleeAppName: string;
  resourceType: 'API' | 'API_GROUP';
  resourceId: string;
  resourceName: string;
  path: string;
  version: string;
  operationType: 'GRANT' | 'REVOKE';
  operator: string;
  time: string;
}

export interface VersionItem {
  id: string;
  version: string;
  importedAt: string;
  summary: string;
  changeCount: number;
  status: VersionStatus;
  scope: string;
}

export interface RollbackRecord {
  id: string;
  version: string;
  operator: string;
  time: string;
  reason: string;
}

export interface SmartDocDiffApi {
  id: string;
  appName: string;
  name: string;
  path: string;
  method: string;
  description?: string;
}

export interface SmartDocModifiedApi {
  id: string;
  before: SmartDocDiffApi;
  after: SmartDocDiffApi;
  fields: string[];
}

export interface SmartDocDiffResult {
  version: VersionItem;
  additions: SmartDocDiffApi[];
  modifications: SmartDocModifiedApi[];
  deletions: SmartDocDiffApi[];
}

export interface VersionDetail {
  base: VersionItem;
  changeList: Array<{
    id: string;
    type: '新增' | '修改' | '删除';
    target: string;
    detail: string;
  }>;
  rollbackRecords: RollbackRecord[];
}

export interface RemoteLogItem {
  id: string;
  callerApp: string;
  calleeApp: string;
  checkResult: CheckResult;
  reason: string;
  responseCode: number;
  path: string;
  time: string;
}

export interface AuthorizationPanelData {
  callers: Array<{ id: string; name: string; type: 'APP' | 'APP_GROUP' }>;
  callees: AppItem[];
  apiTree: Array<{ id: string; label: string; children?: Array<{ id: string; label: string }> }>;
  groupTree: Array<{ id: string; label: string; children?: Array<{ id: string; label: string }> }>;
  selectedGrants: AuthorizationRecord[];
}
