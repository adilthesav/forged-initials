// The admin password is typed in by the owner and checked on the server.
// It must never be written into frontend code, which anyone can read.
const STORAGE_KEY = 'fi_admin_token';

export function getAdminToken(): string {
  try { return sessionStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const res = await fetch('/.netlify/functions/admin-products', { headers: { 'x-admin-token': password } });
  if (!res.ok) return false;
  try { sessionStorage.setItem(STORAGE_KEY, password); } catch { /* storage unavailable */ }
  return true;
}
