import { clearSessionToken, clearStoredUser, getSessionToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LOGIN_EXPIRED_CODES = new Set([40102, 40103]);
const SUCCESS_CODES = new Set([0, 200]);

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class RequestError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function request<T>(url: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const sessionToken = getSessionToken();
  if (!options.skipAuth && sessionToken) {
    // 后端统一从请求头读取 sessionToken，这里在请求层集中附带。
    headers.set('sessionToken', sessionToken);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  const result = (await response.json()) as ApiResponse<T>;
  if (!SUCCESS_CODES.has(result.code)) {
    if (LOGIN_EXPIRED_CODES.has(result.code)) {
      clearSessionToken();
      clearStoredUser();
      if (window.location.pathname !== '/login') {
        const redirect = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
      }
    }
    throw new RequestError(result.code, result.message || '请求失败');
  }
  return result.data;
}
