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
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormDataBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const sessionToken = getSessionToken();
  if (!options.skipAuth && sessionToken) {
    // 后台管理接口统一使用 sessionToken 请求头，业务接口和外部 Basic 鉴权接口按调用方单独传入。
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
        // 登录态过期后回到登录页，重新登录成功后统一进入首页。
        window.location.href = '/login';
      }
    }
    throw new RequestError(result.code, result.message || '请求失败');
  }
  return result.data;
}
