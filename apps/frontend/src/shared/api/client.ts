import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/tokens';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? '';

function handleUnauthorized() {
  clearTokens();
  window.location.href = '/signin';
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Shared in-flight refresh: concurrent 401s await one request to /auth/refresh
// instead of stampeding it. Resolves to whether a fresh token is now stored.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const payload = (await response.json()) as { data?: { accessToken?: string; refreshToken?: string } };
    const { accessToken, refreshToken: rotated } = payload.data ?? {};
    if (!accessToken || !rotated) return false;

    setTokens(accessToken, rotated);
    return true;
  } catch {
    // Network/parse failure during refresh — treat as a dead session.
    return false;
  }
}

function ensureRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T,>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      // Access token likely expired: refresh once and replay the request.
      if (retry && getRefreshToken() && (await ensureRefresh())) {
        return request<T>(method, path, body, false);
      }
      handleUnauthorized();
    }
    const payload = await response.json().catch(() => ({} as { message?: string }));
    throw new ApiError(payload.message ?? 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get:   <T,>(path: string)               => request<T>('GET',    path),
  post:  <T,>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:   <T,>(path: string, body: unknown) => request<T>('PUT',    path, body),
  patch: <T,>(path: string, body: unknown) => request<T>('PATCH',  path, body),
  del:   <T,>(path: string)               => request<T>('DELETE', path),
};

export type Envelope<T> = { code: number; message: string; data: T };
