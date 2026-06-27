import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDb } from './utils/db';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Pull the Prisma client off the booted app so DB assertions read the
    // exact connection the request handlers wrote through.
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    // PrismaService is a bare `extends PrismaClient` with no onModuleDestroy,
    // so app.close() won't disconnect it — do it explicitly to avoid leaking
    // a DB handle that keeps Jest open/flaky in CI.
    await prisma.$disconnect();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /auth/signup persists a user (asserted via Prisma read)', async () => {
    const email = 'smoke-test@example.com';
    // Password must satisfy PASSWORD_PATTERN (upper/lower/digit/special, 8+).
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, firstName: 'Smoke', lastName: 'Test' })
      .expect(200); // auth.controller signUp is decorated @HttpCode(OK)

    // Assert the DB row, NOT the response body: the e2e harness lacks the
    // global ResponseInterceptor so the envelope differs from prod, and the
    // signup response body is changing under a concurrent ticket.
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(email);
    expect(user?.passwordHash).toBeTruthy();
    expect(user?.passwordHash).not.toBe(password);
  });
});
