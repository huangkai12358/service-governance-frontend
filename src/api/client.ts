import { getSessionToken } from '@/utils/storage';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8081';

export interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<BackendResponse<T>> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getSessionToken();
  if (token) {
    headers.set('sessionToken', token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `请求失败：${response.status}`);
  }
  return payload;
}

export function post<T>(path: string, body: unknown = {}) {
  return request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}

export function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}
