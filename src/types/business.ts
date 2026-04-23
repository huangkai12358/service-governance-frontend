export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type DecisionResult = 'SUCCESS' | 'FAIL' | 'BYPASS';
export type ChangeType = '新增API' | '修改API' | '删除API';

export interface UserInfo {
  username: string;
  token: string;
}

export interface OverviewStats {
  api_total: number;
  app_total: number;
  api_group_total: number;
  app_group_total: number;
  auth_relation_total: number;
  smartdoc_import_total: number;
  today_call_total: number;
}

export interface ActivityRecord {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface AppItem {
  id: string;
  app_code: string;
  app_name: string;
  app_description: string;
  current_version: string;
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface ApiItem {
  id: string;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  api_version_id: string;
  api_description: string;
  api_group_ids: string[];
  api_group_names: string[];
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface ApiGroupItem {
  id: string;
  api_group_name: string;
  api_group_description: string;
  app_code: string;
  app_name: string;
  api_ids: string[];
  api_paths: string[];
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface AppGroupItem {
  id: string;
  app_group_name: string;
  app_group_description: string;
  app_codes: string[];
  app_names: string[];
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface VersionDiffItem {
  id: string;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  api_description: string;
}

export interface ModifiedApiDiff {
  id: string;
  before: VersionDiffItem;
  after: VersionDiffItem;
  changed_fields: Array<'api_name' | 'api_method' | 'api_description'>;
}

export interface SmartDocImportDraft {
  app_code: string;
  version: string;
  remark: string;
  file_name: string;
  file_path: string;
}

export interface SmartDocDiffResult {
  draft: SmartDocImportDraft;
  additions: VersionDiffItem[];
  modifications: ModifiedApiDiff[];
  deletions: VersionDiffItem[];
}

export interface VersionHistoryItem {
  id: string;
  api_version_id: bigint;
  app_code: string;
  app_name: string;
  version: string;
  file_name: string;
  file_path: string;
  remark: string;
  create_time: string;
}

export interface VersionDetail {
  version: VersionHistoryItem;
  apis: Array<{
    id: string;
    api_name: string;
    api_path: string;
    api_method: HttpMethod;
  }>;
  rollback_preview: {
    additions: VersionDiffItem[];
    modifications: ModifiedApiDiff[];
    deletions: VersionDiffItem[];
  };
}

export interface SingleAppAuthorization {
  id: string;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  api_paths: string[];
  api_group_ids: string[];
}

export interface AppGroupAuthorization {
  id: string;
  app_group_name: string;
  app_codes: string[];
  app_names: string[];
}

export interface AuthorizationEditorData {
  apis: Array<{
    id: string;
    api_name: string;
    api_path: string;
    app_code: string;
  }>;
  api_groups: Array<{
    id: string;
    api_group_name: string;
    app_code: string;
    api_ids: string[];
  }>;
  checked_api_ids: string[];
  checked_group_ids: string[];
}

export interface AuthorizationDelta {
  added_api_paths: string[];
  revoked_api_paths: string[];
}

export interface AuthConfigLogItem {
  auth_log_id: bigint;
  caller_app_code: string;
  callee_app_code: string;
  api_name: string;
  api_path: string;
  operation_type: '新增' | '撤销';
  log_time: string;
}

export interface SmartDocImportLogItem {
  api_version_id: bigint;
  app_code: string;
  version: string;
  file_name: string;
  file_path: string;
  remark: string;
  create_time: string;
}

export interface RemoteCallLogItem {
  call_decision_log_id: bigint;
  caller_app_code: string;
  callee_app_code: string;
  result: DecisionResult;
  decision_reason: string;
  log_time: string;
}
