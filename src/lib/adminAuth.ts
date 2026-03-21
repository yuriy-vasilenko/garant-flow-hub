const SESSION_KEY = 'garant_site_admin_v1';

export const SITE_ADMIN_USER = 'admin';
export const SITE_ADMIN_PASS = 'admin';

export function isSiteAdmin(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function loginSiteAdmin(username: string, password: string): boolean {
  if (username.trim() === SITE_ADMIN_USER && password === SITE_ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function logoutSiteAdmin(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
