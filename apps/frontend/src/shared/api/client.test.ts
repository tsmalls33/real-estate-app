import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

type Body = Record<string, unknown>;

function jsonResponse(status: number, body: Body): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const refreshOk = (): Body => ({
  code: 200,
  message: 'ok',
  data: { accessToken: 'access-new', refreshToken: 'refresh-new' },
});

beforeEach(() => {
  localStorage.setItem('accessToken', 'access-old');
  localStorage.setItem('refreshToken', 'refresh-old');
  // jsdom's window.location.href assignment is a silent no-op; stub it so the
  // redirect path is observable.
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('attaches the access token and returns the envelope on success', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { code: 200, message: 'ok', data: { id: 1 } }));

    const result = await api.get<Body>('/properties');

    expect(result).toEqual({ code: 200, message: 'ok', data: { id: 1 } });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer access-old');
  });

  it('refreshes and retries once on 401, persisting both rotated tokens', async () => {
    let protectedCalls = 0;
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) return jsonResponse(200, refreshOk());
      protectedCalls += 1;
      if (protectedCalls === 1) return jsonResponse(401, { message: 'expired' });
      return jsonResponse(200, { code: 200, message: 'ok', data: { ok: true } });
    });

    const result = await api.get<Body>('/properties');

    expect(result).toEqual({ code: 200, message: 'ok', data: { ok: true } });
    expect(localStorage.getItem('accessToken')).toBe('access-new');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-new');
    // the retry must carry the freshly minted access token
    const retryInit = fetchMock.mock.calls.at(-1)?.[1] as RequestInit;
    expect((retryInit.headers as Record<string, string>).Authorization).toBe('Bearer access-new');
  });

  it('shares a single in-flight refresh across concurrent 401s', async () => {
    let refreshCalls = 0;
    let protectedCalls = 0;
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse(200, refreshOk());
      }
      protectedCalls += 1;
      if (protectedCalls <= 2) return jsonResponse(401, { message: 'expired' });
      return jsonResponse(200, { code: 200, message: 'ok', data: { n: protectedCalls } });
    });

    const [a, b] = await Promise.all([api.get<Body>('/properties'), api.get<Body>('/tenant')]);

    expect(refreshCalls).toBe(1);
    expect(a.data).toBeDefined();
    expect(b.data).toBeDefined();
  });

  it('clears tokens and redirects to /signin when the refresh itself 401s', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) return jsonResponse(401, { message: 'invalid' });
      return jsonResponse(401, { message: 'expired' });
    });

    await expect(api.get('/properties')).rejects.toThrow();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(window.location.href).toBe('/signin');
  });

  it('redirects immediately on 401 when no refresh token is stored', async () => {
    localStorage.removeItem('refreshToken');
    let refreshCalls = 0;
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      if (String(input).endsWith('/auth/refresh')) refreshCalls += 1;
      return jsonResponse(401, { message: 'expired' });
    });

    await expect(api.get('/properties')).rejects.toThrow();
    expect(refreshCalls).toBe(0);
    expect(window.location.href).toBe('/signin');
  });

  it('does not attempt refresh for 401s from /auth/ endpoints', async () => {
    let refreshCalls = 0;
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      if (String(input).endsWith('/auth/refresh')) refreshCalls += 1;
      return jsonResponse(401, { message: 'bad credentials' });
    });

    await expect(api.post('/auth/signin', { email: 'a', password: 'b' })).rejects.toThrow();
    expect(refreshCalls).toBe(0);
  });
});
