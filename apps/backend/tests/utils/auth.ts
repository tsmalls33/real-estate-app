import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';

const SIGNUP_PASSWORD = 'Password123!';

export async function signUpAs(
  app: INestApplication<App>,
  overrides: Partial<{ email: string; firstName: string; lastName: string }> = {},
) {
  const email = overrides.email ?? `test-${Date.now()}@example.com`;
  const res = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({
      email,
      password: SIGNUP_PASSWORD,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
    })
    .expect(200);
  return {
    email,
    password: SIGNUP_PASSWORD,
    accessToken: res.body.accessToken as string,
    refreshToken: res.body.refreshToken as string,
    user: res.body.user,
  };
}

export function authHeader(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`];
}
