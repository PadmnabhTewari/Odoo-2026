const API_BASE = 'http://localhost:4000';

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('assetflow_token');
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed');
  }

  return data;
}
