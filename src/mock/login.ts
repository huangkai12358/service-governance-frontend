import type { UserInfo } from '@/types/business';
import { success, wait } from '@/utils/mock';

interface LoginPayload {
  username: string;
  password: string;
}

interface LogoutPayload {
  sessionToken: string;
}

const MOCK_USERNAME = 'admin';
const MOCK_PASSWORD = 'admin123';

export async function mockLogin(payload: LoginPayload) {
  if (payload.username !== MOCK_USERNAME || payload.password !== MOCK_PASSWORD) {
    throw new Error('用户名或密码错误');
  }

  return wait(success<UserInfo>({
    username: payload.username,
    sessionToken: btoa(`${payload.username}:${payload.password}`)
  })).then((result) => result.data);
}

export async function mockLogout(_payload: LogoutPayload) {
  return wait(success<void>(undefined)).then(() => undefined);
}
