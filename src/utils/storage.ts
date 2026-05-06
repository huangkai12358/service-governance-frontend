const SESSION_TOKEN_KEY = 'sg_session_token';
const USER_KEY = 'sg_user';

export function getSessionToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(sessionToken: string) {
  localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
}

export function clearSessionToken() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
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
