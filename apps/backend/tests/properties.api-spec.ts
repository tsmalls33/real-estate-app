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

describe('Properties (api)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const propertyPayload = {
    propertyName: 'Test Villa',
    propertyAddress: '123 Test St',
    salePrice: 500000,
    saleType: 'SALE',
  };

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

  describe('POST /properties', () => {
    it('ADMIN creates a property', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);

      const res = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send(propertyPayload)
        .expect(201);

      expect(res.body.propertyName).toBe('Test Villa');
      expect(res.body.id_property).toBeDefined();
    });

    it('CLIENT gets 403', async () => {
      const client = await signUpAs(app, { email: 'client-prop@test.com' });
      await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(client.accessToken))
        .send(propertyPayload)
        .expect(403);
    });
  });

  describe('GET /properties', () => {
    it('returns paginated properties for the tenant', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send(propertyPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/properties')
        .set(...authHeader(admin.accessToken))
        .expect(200);

      expect(res.body).toHaveProperty('properties');
      expect(Array.isArray(res.body.properties)).toBe(true);
      expect(res.body.properties.length).toBe(1);
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBe(1);
    });

    it('filters by status', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send({ ...propertyPayload, status: 'AVAILABLE_SALE' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/properties')
        .set(...authHeader(admin.accessToken))
        .query({ status: 'AVAILABLE_SALE' })
        .expect(200);

      expect(res.body.properties.length).toBe(1);
      expect(res.body.properties[0].status).toBe('AVAILABLE_SALE');

      // Non-matching filter → empty
      const empty = await request(app.getHttpServer())
        .get('/properties')
        .set(...authHeader(admin.accessToken))
        .query({ status: 'SOLD' })
        .expect(200);

      expect(empty.body.properties.length).toBe(0);
    });

    it('CLIENT can list own properties (role override)', async () => {
      const { accessToken, userId } = await signUpAs(app, { email: 'client-own@test.com' });
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-for-client@test.com',
      });

      // Create property with CLIENT as owner
      await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send({ ...propertyPayload, id_owner: userId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/properties')
        .set(...authHeader(accessToken))
        .expect(200);

      expect(res.body).toHaveProperty('properties');
      expect(Array.isArray(res.body.properties)).toBe(true);
    });
  });

  describe('GET /properties/:id_property', () => {
    it('returns property detail', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const created = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send(propertyPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/properties/${created.body.id_property}`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      expect(res.body.id_property).toBe(created.body.id_property);
      expect(res.body.propertyName).toBe('Test Villa');
    });

    it('returns 404 for property in another tenant', async () => {
      const adminA = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-a-prop@test.com',
      });
      const adminB = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-b-prop@test.com',
      });

      const created = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(adminA.accessToken))
        .send(propertyPayload)
        .expect(201);

      await request(app.getHttpServer())
        .get(`/properties/${created.body.id_property}`)
        .set(...authHeader(adminB.accessToken))
        .expect(404);
    });
  });

  describe('PATCH /properties/:id_property', () => {
    it('updates property fields', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const created = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send(propertyPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/properties/${created.body.id_property}`)
        .set(...authHeader(admin.accessToken))
        .send({ propertyName: 'Updated Villa', salePrice: 550000 })
        .expect(200);

      expect(res.body.propertyName).toBe('Updated Villa');
    });
  });

  describe('DELETE /properties/:id_property', () => {
    it('soft-deletes a property (200)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const created = await request(app.getHttpServer())
        .post('/properties')
        .set(...authHeader(admin.accessToken))
        .send(propertyPayload)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/properties/${created.body.id_property}`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      const deleted = await prisma.property.findUnique({
        where: { id_property: created.body.id_property },
      });
      expect(deleted?.isDeleted).toBe(true);
    });
  });
});
