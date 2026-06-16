const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function getToken() {
  return localStorage.getItem('accessToken');
}

function handleUnauthorized() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/signin';
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;

    // Global session-expired handling only applies to authenticated requests.
    // Auth endpoints (/auth/*) return 401 to mean "bad credentials" — surface that to the page.
    if (response.status === 401 && !path.startsWith('/auth/')) {
      handleUnauthorized();
    }

    throw error;
  }

  return response.json();
}

export const client = {
  get:   (path)        => request('GET',    path),
  post:  (path, body)  => request('POST',   path, body),
  put:   (path, body)  => request('PUT',    path, body),
  patch: (path, body)  => request('PATCH',  path, body),
  del:   (path)        => request('DELETE', path),
};
