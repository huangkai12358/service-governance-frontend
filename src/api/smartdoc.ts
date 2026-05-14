import { request } from '@/utils/request';
import type {
  HttpMethod,
  ModifiedApiDiff,
  SmartDocDiffResult,
  SmartDocImportResult,
  VersionDiffItem
} from '@/types/business';

interface SmartDocAnalyzeBackendRequest {
  file: File;
  app_code?: string;
  version?: string;
  remark?: string;
}

interface SmartDocAnalyzeBackendDraft {
  appCode: string;
  version: string;
  remark: string | null;
  fileName: string;
  filePath: string;
}

interface SmartDocAnalyzeBackendItem {
  id: number | null;
  appCode: string;
  appName: string;
  apiName: string;
  apiPath: string;
  apiMethod: HttpMethod;
  apiDescription: string | null;
}

interface SmartDocAnalyzeBackendModification {
  id: number;
  before: SmartDocAnalyzeBackendItem;
  after: SmartDocAnalyzeBackendItem;
  changedFields: Array<'api_name' | 'api_method' | 'api_description'>;
}

interface SmartDocAnalyzeBackendResponse {
  parseId: string;
  draft: SmartDocAnalyzeBackendDraft;
  unchangedCount: number;
  additions: SmartDocAnalyzeBackendItem[];
  modifications: SmartDocAnalyzeBackendModification[];
  deprecations: SmartDocAnalyzeBackendItem[];
}

interface SmartDocConfirmBackendRequest {
  parse_id: string;
  app_code: string;
  version: string;
  remark?: string;
}

interface SmartDocConfirmBackendResponse {
  apiVersionId: number;
  appCode: string;
  appName: string;
  version: string;
  fileName: string;
  filePath: string;
  remark: string | null;
  unchangedCount: number;
  additionCount: number;
  modificationCount: number;
  deprecationCount: number;
  revokedAuthCount: number;
  additions: SmartDocAnalyzeBackendItem[];
}

function mapDiffItem(item: SmartDocAnalyzeBackendItem): VersionDiffItem {
  return {
    id: item.id ?? 0,
    app_code: item.appCode,
    app_name: item.appName,
    api_name: item.apiName,
    api_path: item.apiPath,
    api_method: item.apiMethod,
    api_description: item.apiDescription || ''
  };
}

function mapModifiedItem(item: SmartDocAnalyzeBackendModification): ModifiedApiDiff {
  return {
    id: item.id,
    before: mapDiffItem(item.before),
    after: mapDiffItem(item.after),
    changed_fields: item.changedFields
  };
}

export async function analyzeSmartDoc(payload: SmartDocAnalyzeBackendRequest) {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.app_code) {
    formData.append('appCode', payload.app_code);
  }
  if (payload.version) {
    formData.append('version', payload.version);
  }
  if (payload.remark) {
    formData.append('remark', payload.remark);
  }

  const data = await request<SmartDocAnalyzeBackendResponse>('/api/smartdoc/analyze', {
    method: 'POST',
    body: formData
  });

  const mapped: SmartDocDiffResult & { parse_id: string } = {
    parse_id: data.parseId,
    draft: {
      app_code: data.draft.appCode,
      version: data.draft.version,
      remark: data.draft.remark || '',
      file_name: data.draft.fileName,
      file_path: data.draft.filePath
    },
    unchanged_count: data.unchangedCount,
    additions: data.additions.map(mapDiffItem),
    modifications: data.modifications.map(mapModifiedItem),
    deprecations: data.deprecations.map(mapDiffItem)
  };

  return { data: mapped };
}

export async function confirmSmartDocImport(payload: SmartDocConfirmBackendRequest) {
  const data = await request<SmartDocConfirmBackendResponse>('/api/smartdoc/import/confirm', {
    method: 'POST',
    body: JSON.stringify({
      parseId: payload.parse_id,
      appCode: payload.app_code,
      version: payload.version,
      remark: payload.remark || ''
    })
  });

  const mapped: SmartDocImportResult = {
    api_version_id: data.apiVersionId,
    app_code: data.appCode,
    app_name: data.appName,
    version: data.version,
    file_name: data.fileName,
    file_path: data.filePath,
    remark: data.remark || '',
    unchanged_count: data.unchangedCount,
    addition_count: data.additionCount,
    modification_count: data.modificationCount,
    deprecation_count: data.deprecationCount,
    revoked_auth_count: data.revokedAuthCount,
    additions: data.additions.map(mapDiffItem)
  };

  return {
    data: mapped,
    message: '导入成功'
  };
}
