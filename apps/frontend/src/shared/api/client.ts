const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function handleUnauthorized() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/signin';
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({} as { message?: string }));
    const error = new ApiError(payload.message ?? 'Request failed', response.status);
    if (response.status === 401 && !path.startsWith('/auth/')) {
      handleUnauthorized();
    }
    throw error;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get:   <T>(path: string)              => request<T>('GET',    path),
  post:  <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:   <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH',  path, body),
  del:   <T>(path: string)              => request<T>('DELETE', path),
};

export type Envelope<T> = { code: number; message: string; data: T };
