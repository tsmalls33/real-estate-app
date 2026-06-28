import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDb } from './utils/db';
import { createUserWithRole } from './utils/setup';
import { signUpAs, authHeader } from './utils/auth';
import { UserRoles } from '@RealEstate/types';

describe('Users (api)', () => {
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

  describe('POST /user — create user', () => {
    it('ADMIN creates an EMPLOYEE in own tenant', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);

      const res = await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(admin.accessToken))
        .send({ email: 'employee@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(201);

      expect(res.body.email).toBe('employee@test.com');
      expect(res.body.role).toBe('EMPLOYEE');
      expect(res.body.id_tenant).toBe(admin.tenantId);

      const user = await prisma.user.findUnique({ where: { email: 'employee@test.com' } });
      expect(user).not.toBeNull();
    });

    it('CLIENT gets 403', async () => {
      const client = await signUpAs(app, { email: 'client@test.com' });
      await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(client.accessToken))
        .send({ email: 'should-fail@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(403);
    });

    it('rejects duplicate email (409)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(admin.accessToken))
        .send({ email: 'dup@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(201);

      await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(admin.accessToken))
        .send({ email: 'dup@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(409);
    });
  });

  describe('GET /user — list users', () => {
    it('returns paginated response with users array', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);

      const res = await request(app.getHttpServer())
        .get('/user')
        .set(...authHeader(admin.accessToken))
        .expect(200);

      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThanOrEqual(1);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
    });

    it('CLIENT gets 403', async () => {
      const client = await signUpAs(app, { email: 'client-list@test.com' });
      await request(app.getHttpServer())
        .get('/user')
        .set(...authHeader(client.accessToken))
        .expect(403);
    });
  });

  describe('GET /user/me', () => {
    it('returns the authenticated user', async () => {
      const { accessToken } = await signUpAs(app, { email: 'me-get@test.com' });
      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set(...authHeader(accessToken))
        .expect(200);

      expect(res.body.email).toBe('me-get@test.com');
    });
  });

  describe('PATCH /user/me', () => {
    it('updates own profile preferences', async () => {
      const { accessToken } = await signUpAs(app, { email: 'me-patch@test.com' });

      await request(app.getHttpServer())
        .patch('/user/me')
        .set(...authHeader(accessToken))
        .send({ preferredThemeMode: 'DARK', language: 'ES' })
        .expect(200);

      const user = await prisma.user.findUnique({ where: { email: 'me-patch@test.com' } });
      expect(user?.preferredThemeMode).toBe('DARK');
      expect(user?.preferredLanguage).toBe('ES');
    });
  });

  describe('PATCH /user/:id_user', () => {
    it('ADMIN updates a user in own tenant', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const target = await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(admin.accessToken))
        .send({ email: 'target@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/user/${target.body.id_user}`)
        .set(...authHeader(admin.accessToken))
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(res.body.firstName).toBe('Updated');
    });

    it('ADMIN gets 404 for user in another tenant', async () => {
      const adminA = await createUserWithRole(app, prisma, UserRoles.ADMIN, { email: 'admin-a@test.com' });
      const adminB = await createUserWithRole(app, prisma, UserRoles.ADMIN, { email: 'admin-b@test.com' });

      const target = await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(adminA.accessToken))
        .send({ email: 'other-tenant@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/user/${target.body.id_user}`)
        .set(...authHeader(adminB.accessToken))
        .send({ firstName: 'Hacker' })
        .expect(404);
    });
  });

  describe('DELETE /user/:id_user', () => {
    it('ADMIN soft-deletes a user in own tenant', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const target = await request(app.getHttpServer())
        .post('/user')
        .set(...authHeader(admin.accessToken))
        .send({ email: 'delete-me@test.com', password: 'Password123!', role: UserRoles.EMPLOYEE })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/user/${target.body.id_user}`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      const deleted = await prisma.user.findUnique({ where: { email: 'delete-me@test.com' } });
      expect(deleted?.isDeleted).toBe(true);
    });
  });
});
