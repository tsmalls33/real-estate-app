import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDb } from './utils/db';
import { signUpAs } from './utils/auth';

describe('Auth (api)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

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

  describe('POST /auth/signup', () => {
    it('creates a user and returns tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'new@example.com', password: 'Password123!', firstName: 'New', lastName: 'User' })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();

      const user = await prisma.user.findUnique({ where: { email: 'new@example.com' } });
      expect(user).not.toBeNull();
    });

    it('rejects duplicate email (409)', async () => {
      await signUpAs(app, { email: 'dup@example.com' });
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'dup@example.com', password: 'Password123!' })
        .expect(409);
    });
  });

  describe('POST /auth/signin', () => {
    it('returns tokens for valid credentials', async () => {
      await signUpAs(app, { email: 'signin@example.com' });

      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'signin@example.com', password: 'Password123!' })
        .expect(200);

      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
    });

    it('rejects wrong password (401)', async () => {
      await signUpAs(app, { email: 'wrong@example.com' });
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'wrong@example.com', password: 'WrongPass1!' })
        .expect(401);
    });

    it('rejects unknown email (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nobody@example.com', password: 'Password123!' })
        .expect(401);
    });
  });

  describe('protected route access', () => {
    it('rejects request without token (401)', async () => {
      await request(app.getHttpServer()).get('/user/me').expect(401);
    });

    it('rejects request with malformed token (401)', async () => {
      await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', 'Bearer not-a-jwt')
        .expect(401);
    });

    it('allows request with valid token', async () => {
      const { accessToken } = await signUpAs(app, { email: 'me@example.com' });

      await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('POST /auth/refresh', () => {
    it('issues new tokens with valid refresh token', async () => {
      const { refreshToken } = await signUpAs(app, { email: 'refresh@example.com' });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
    });

    it('rejects revoked refresh token (401)', async () => {
      const { refreshToken } = await signUpAs(app, { email: 'revoke@example.com' });

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
