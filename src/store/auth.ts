import { defineStore } from 'pinia';
import type { UserInfo } from '@/types/business';
import {
  clearSessionToken,
  clearStoredUser,
  getSessionToken,
  getStoredUser,
  setSessionToken,
  setStoredUser
} from '@/utils/storage';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser() ? (JSON.parse(getStoredUser() as string) as UserInfo) : null as UserInfo | null,
    sessionToken: getSessionToken() || ''
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.sessionToken)
  },
  actions: {
    login(payload: UserInfo) {
      this.user = payload;
      this.sessionToken = payload.sessionToken;
      setSessionToken(payload.sessionToken);
      setStoredUser(JSON.stringify(payload));
    },
    logout() {
      this.user = null;
      this.sessionToken = '';
      clearSessionToken();
      clearStoredUser();
    }
  }
});
