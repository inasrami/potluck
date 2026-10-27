const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SK = 'potluck_session';

export const getSession = () => { try { return JSON.parse(localStorage.getItem(SK)); } catch { return null; } };
export const saveSession = (s) => (s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK));
const toSession = (d) => ({ access_token: d.access_token, refresh_token: d.refresh_token,
  expires_at: Date.now() + d.expires_in * 1000, user: { id: d.user.id, email: d.user.email } });

async function call(path, { method = 'GET', body, token, signal, headers = {} } = {}) {
  const res = await fetch(new URL(path, BASE), { method, signal, body: body && JSON.stringify(body),
    headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...headers } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || data?.msg || data?.error_description || 'Request failed');
  return data;
}

export async function register(email, password) {
  const d = await call('/auth/v1/signup', { method: 'POST', body: { email, password } });
  return d.access_token ? toSession(d) : null; // null = email confirmation required
}
export const login = async (email, password) =>
  toSession(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
export const logout = (token) => call('/auth/v1/logout?scope=local', { method: 'POST', token });

async function freshToken() {
  let s = getSession();
  if (!s) throw new Error('Please log in first');
  if (s.expires_at - Date.now() < 60000) {
    try {
      s = toSession(await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } }));
      saveSession(s);
    } catch (e) {
      saveSession(null);
      window.dispatchEvent(new Event('session-expired'));
      throw new Error('Your session expired. Please log in again.');
    }
  }
  return s.access_token;
}
const write = async (path, method, body) =>
  call(path, { method, body, token: await freshToken(), headers: { Prefer: 'return=representation' } });

export const getRecipes = (signal, extra = '') => call(`/rest/v1/recipes?order=created_at.desc${extra}`, { signal });
export const getRecipe = async (id, signal) => (await call(`/rest/v1/recipes?id=eq.${encodeURIComponent(id)}`, { signal }))[0] || null;
export const createRecipe = async (r) => (await write('/rest/v1/recipes', 'POST', r))[0];
export async function updateRecipe(id, r) {
  const d = await write(`/rest/v1/recipes?id=eq.${id}`, 'PATCH', r);
  if (!d.length) throw new Error('Nothing changed: you can only edit your own recipes.');
  return d[0];
}
export async function deleteRecipe(id) {
  const d = await write(`/rest/v1/recipes?id=eq.${id}`, 'DELETE');
  if (!d.length) throw new Error('Nothing deleted: you can only delete your own recipes.');
}
export const getComments = (id, signal) => call(`/rest/v1/comments?recipe_id=eq.${id}&order=created_at.asc`, { signal });
export const addComment = async (c) => (await write('/rest/v1/comments', 'POST', c))[0];
