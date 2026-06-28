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

describe('Tenants / Plans (api)', () => {
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

  describe('Plans', () => {
    it('SUPERADMIN can create a plan', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      const res = await request(app.getHttpServer())
        .post('/plans')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Pro Plan', price: 29.99, pricePeriod: 'MONTHLY' })
        .expect(201);

      expect(res.body.name).toBe('Pro Plan');
    });

    it('ADMIN cannot create a plan (403)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);

      await request(app.getHttpServer())
        .post('/plans')
        .set(...authHeader(admin.accessToken))
        .send({ name: 'Pro Plan', price: 29.99, pricePeriod: 'MONTHLY' })
        .expect(403);
    });

    it('SUPERADMIN can list plans', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      await request(app.getHttpServer())
        .post('/plans')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Basic', price: 9.99, pricePeriod: 'MONTHLY' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/plans')
        .set(...authHeader(superadmin.accessToken))
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Tenants', () => {
    it('SUPERADMIN can create a tenant', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      const res = await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'New Agency' })
        .expect(201);

      expect(res.body.name).toBe('New Agency');
    });

    it('ADMIN cannot create a tenant (403)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);

      await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(admin.accessToken))
        .send({ name: 'New Agency' })
        .expect(403);
    });

    it('SUPERADMIN can list tenants', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Agency Alpha' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('SUPERADMIN can get a tenant by id', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      const created = await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Agency Beta' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/tenant/${created.body.id_tenant}`)
        .set(...authHeader(superadmin.accessToken))
        .expect(200);

      expect(res.body.id_tenant).toBe(created.body.id_tenant);
    });

    it('SUPERADMIN can update a tenant', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      const created = await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Agency Gamma' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/tenant/${created.body.id_tenant}`)
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Agency Gamma Updated' })
        .expect(200);

      expect(res.body.name).toBe('Agency Gamma Updated');
    });

    it('SUPERADMIN can delete a tenant', async () => {
      const superadmin = await createUserWithRole(app, prisma, UserRoles.SUPERADMIN);

      const created = await request(app.getHttpServer())
        .post('/tenant')
        .set(...authHeader(superadmin.accessToken))
        .send({ name: 'Agency Delta' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/tenant/${created.body.id_tenant}`)
        .set(...authHeader(superadmin.accessToken))
        .expect(200);

      const deleted = await prisma.tenant.findUnique({
        where: { id_tenant: created.body.id_tenant },
      });
      expect(deleted?.isDeleted).toBe(true);
    });
  });

  describe('Tenant isolation', () => {
    it('user from tenant A cannot read tenant B data via property endpoints', async () => {
      const adminA = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'iso-a@test.com',
      });
      const adminB = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'iso-b@test.com',
      });

      // adminA creates a property
      const property = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(adminA.accessToken))
        .send({
          propertyName: 'Isolation House',
          propertyAddress: '456 Isolate St',
          salePrice: 300000,
          saleType: 'SALE',
        })
        .expect(201);

      // adminB cannot read it (404)
      await request(app.getHttpServer())
        .get(`/properties/${property.body.id_property}`)
        .set(...authHeader(adminB.accessToken))
        .expect(404);
    });
  });
});
