import { defineStore } from 'pinia';
import type { UserInfo } from '@/types/business';
import { clearStoredUser, clearToken, getStoredUser, getToken, setStoredUser, setToken } from '@/utils/storage';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser() ? (JSON.parse(getStoredUser() as string) as UserInfo) : null as UserInfo | null,
    token: getToken() || ''
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    login(payload: UserInfo) {
      this.user = payload;
      this.token = payload.token;
      setToken(payload.token);
      setStoredUser(JSON.stringify(payload));
    },
    logout() {
      this.user = null;
      this.token = '';
      clearToken();
      clearStoredUser();
    }
  }
});
