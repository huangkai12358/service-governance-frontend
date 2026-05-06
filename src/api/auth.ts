import type { UserInfo } from '@/types/business';
import { request } from '@/utils/request';

interface LoginPayload {
  username: string;
  password: string;
}

interface LogoutPayload {
  sessionToken: string;
}

export function login(payload: LoginPayload) {
  return request<UserInfo>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });
}

export function logout(payload: LogoutPayload) {
  return request<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });
}
