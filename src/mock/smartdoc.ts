import { post } from '@/api/client';
import type { VersionDiffItem } from '@/types/business';

let latestImportedAdditions: VersionDiffItem[] = [];

export async function analyzeSmartDoc() {
  return post<any>('/api/smartdoc/diffPreview', {});
}

export async function confirmSmartDocImport(payload?: { version?: string; remark?: string }) {
  const response = await post<any>('/api/smartdoc/confirm', payload || {});
  latestImportedAdditions = response.data?.additions || [];
  return response;
}

export function getLatestImportedAdditions() {
  return latestImportedAdditions.map((item) => ({ ...item }));
}
