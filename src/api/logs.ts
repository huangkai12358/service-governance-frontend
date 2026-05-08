import { request } from '@/utils/request';
import type { PageResult } from '@/types/common';

export interface SmartDocImportLogQuery {
  page: number;
  pageSize: number;
  app_code?: string;
  app_name?: string;
  version?: string;
}

export interface SmartDocImportLogItem {
  api_version_id: number;
  app_code: string;
  app_name: string;
  version: string;
  file_name: string;
  file_path: string;
  remark: string;
  importer_name: string;
  create_time: string;
}

interface SmartDocImportLogBackendItem {
  apiVersionId: number;
  appCode: string | null;
  appName: string | null;
  version: string | null;
  fileName: string | null;
  filePath: string | null;
  remark: string | null;
  importerName: string | null;
  createTime: string | null;
}

interface SmartDocImportLogBackendResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  records: SmartDocImportLogBackendItem[];
}

function formatDateTime(value: string | null | undefined) {
  return value ? value.replace('T', ' ') : '-';
}

function mapSmartDocImportLogItem(item: SmartDocImportLogBackendItem): SmartDocImportLogItem {
  return {
    api_version_id: item.apiVersionId,
    app_code: item.appCode || '',
    app_name: item.appName || '',
    version: item.version || '',
    file_name: item.fileName || '',
    file_path: item.filePath || '',
    remark: item.remark || '',
    importer_name: item.importerName || '',
    create_time: formatDateTime(item.createTime)
  };
}

/**
 * 分页查询 SmartDoc 导入历史记录。
 */
export async function fetchSmartDocImportLogPage(
  query: SmartDocImportLogQuery
): Promise<PageResult<SmartDocImportLogItem>> {
  const data = await request<SmartDocImportLogBackendResponse>('/api/logs/smartdoc-import/list', {
    method: 'POST',
    body: JSON.stringify({
      pageNum: query.page,
      pageSize: query.pageSize,
      appCode: query.app_code || undefined,
      appName: query.app_name || undefined,
      version: query.version || undefined
    })
  });

  return {
    list: data.records.map(mapSmartDocImportLogItem),
    total: data.total,
    page: data.pageNum,
    pageSize: data.pageSize
  };
}

/**
 * 查询 SmartDoc 导入历史页面使用的版本号候选项。
 */
export async function fetchSmartDocImportVersionOptions(): Promise<string[]> {
  return request<string[]>('/api/logs/smartdoc-import/version-options');
}
