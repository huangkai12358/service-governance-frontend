export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type DecisionResult = 'SUCCESS' | 'FAIL' | 'BYPASS';
export type ChangeType = '新增API' | '修改API' | '废弃API';

export interface UserInfo {
  username: string;
  token: string;
}

export interface OverviewStats {
  api_total: number;
  app_total: number;
  auth_relation_total: number;
  smartdoc_import_total: number;
  today_call_total: number;
}

export type AuthServiceMode = 'ENABLED' | 'BYPASS';

export interface AuthServiceSettings {
  mode: AuthServiceMode;
  updated_at: string;
}

export interface ActivityRecord {
  id: number;
  title: string;
  description: string;
  time: string;
}

export interface AppItem {
  id: number;
  app_code: string;
  app_name: string;
  app_description: string;
  primary_password: string;
  secondary_password: string;
  current_version: string;
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface AppEditorPayload {
  id?: number;
  app_code: string;
  app_name: string;
  app_description: string;
  primary_password: string;
  secondary_password: string;
}

export interface AppPasswordPayload {
  id: number;
  password?: string;
  target?: 'primary' | 'secondary';
}

export interface ApiItem {
  id: number;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  api_version_id: bigint;
  version: string;
  api_description: string;
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface AppGroupItem {
  id: number;
  app_group_name: string;
  app_group_description: string;
  app_codes: string[];
  app_names: string[];
  create_time: string;
  update_time: string;
  is_deleted: 0 | 1;
}

export interface VersionDiffItem {
  id: number;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  api_description: string;
}

export interface ModifiedApiDiff {
  id: number;
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
  unchanged_count: number;
  additions: VersionDiffItem[];
  modifications: ModifiedApiDiff[];
  deprecations: VersionDiffItem[];
}

export interface VersionHistoryItem {
  id: number;
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
    id: number;
    api_name: string;
    api_path: string;
    api_method: HttpMethod;
  }>;
}

export interface SingleAppAuthorization {
  id: number;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  api_paths: string[];
}

export interface AuthorizationAppOption {
  app_code: string;
  app_name: string;
}

export interface AppGroupAuthorization {
  id: number;
  app_group_name: string;
  app_codes: string[];
  app_names: string[];
}

export interface AuthorizationEditorData {
  apis: Array<{
    id: number;
    api_name: string;
    api_path: string;
    app_code: string;
  }>;
  checked_api_ids: number[];
}

export interface SingleAppAuthorizationEditorPayload {
  caller_app_code: string;
  callee_app_code: string;
  checked_api_ids: number[];
}

export interface SingleAppAuthorizationDialogData {
  current?: SingleAppAuthorization;
  app_options: AuthorizationAppOption[];
  data: AuthorizationEditorData;
}

export interface AuthorizationDelta {
  added_api_paths: string[];
  revoked_api_paths: string[];
}

export interface ReverseAuthListItem {
  api_id: number;
  app_code: string;
  app_name: string;
  api_name: string;
  api_path: string;
  api_method: HttpMethod;
  authorized_app_count: number;
}

export interface ReverseAuthEditorData {
  selected_apis: Array<{
    id: number;
    api_name: string;
    api_path: string;
    api_method: HttpMethod;
    app_code: string;
    app_name: string;
  }>;
  apps: Array<{
    app_code: string;
    app_name: string;
  }>;
  checked_app_codes: string[];
}

export interface ReverseAuthorizedTargetDetail {
  api: {
    id: number;
    app_code: string;
    app_name: string;
    api_name: string;
    api_path: string;
    api_method: HttpMethod;
  };
  apps: Array<{
    app_code: string;
    app_name: string;
  }>;
}

export interface AuthConfigLogItem {
  auth_log_id: bigint;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  api_name: string;
  api_path: string;
  operation_type: '新增' | '撤销';
  log_time: string;
}

export interface SmartDocImportLogItem {
  api_version_id: bigint;
  app_code: string;
  app_name: string;
  version: string;
  file_name: string;
  file_path: string;
  remark: string;
  create_time: string;
}

export interface RemoteCallLogItem {
  call_decision_log_id: bigint;
  caller_app_code: string;
  caller_app_name: string;
  callee_app_code: string;
  callee_app_name: string;
  result: DecisionResult;
  decision_reason: string;
  log_time: string;
}
