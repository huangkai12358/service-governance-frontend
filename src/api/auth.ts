import type { UserInfo } from '@/types/business';
import { mockLogin, mockLogout } from '@/mock/login';
import { shouldUseMockAuthFallback } from '@/utils/authFallback';
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
  }).catch((error) => {
    if (shouldUseMockAuthFallback(error)) {
      return mockLogin(payload);
    }
    throw error;
  });
}

export function logout(payload: LogoutPayload) {
  return request<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  }).catch((error) => {
    if (shouldUseMockAuthFallback(error)) {
      return mockLogout(payload);
    }
    throw error;
  });
}

export function checkSession() {
  return request<void>('/api/auth/session/check', {
    method: 'POST'
  });
}
