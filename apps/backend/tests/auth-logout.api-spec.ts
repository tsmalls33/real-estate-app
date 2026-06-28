import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDb } from './utils/db';

// Acceptance (#42): after logout, replaying the old refresh token against
// /auth/refresh must 401.
describe('Auth logout + refresh-token revocation (api)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const email = 'logout-test@example.com';
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // Sign up then return the issued refresh token. NOTE: the integration harness
  // boots AppModule without the global ResponseInterceptor, so the body is the
  // raw SignInResponseDto ({ user, accessToken, refreshToken }) — not enveloped.
  async function signUpAndGetRefreshToken(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, firstName: 'Logout', lastName: 'Test' })
      .expect(200);
    return res.body.refreshToken as string;
  }

  it('revokes the refresh token: replay after logout → 401', async () => {
    const refreshToken = await signUpAndGetRefreshToken();

    // Sanity: the token works before logout. Rotation issues a new token but
    // does NOT invalidate this one (reuse detection is out of scope), so the
    // original token is still valid here.
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('logout is idempotent and best-effort: repeated + garbage tokens → 200', async () => {
    const refreshToken = await signUpAndGetRefreshToken();

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);

    // Double logout must not 500.
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);

    // Unverifiable token: still 200 (no info leak), but not stored.
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken: 'not-a-real-jwt' })
      .expect(200);

    const count = await prisma.revokedRefreshToken.count();
    expect(count).toBe(1);
  });
});
