const TOKEN_KEY = 'sg_token';
const USER_KEY = 'sg_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  return localStorage.getItem(USER_KEY);
}

export function setStoredUser(user: string) {
  localStorage.setItem(USER_KEY, user);
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}
