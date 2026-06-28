import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDb } from './utils/db';
import { createUserWithRole } from './utils/setup';
import { authHeader } from './utils/auth';
import { UserRoles, Platform } from '@RealEstate/types';

describe('Reservations / Costs (api)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Full ISO-8601 datetime strings — without the global ValidationPipe in the
  // test harness, class-transformer's @Type(() => Date) is not invoked, so
  // Prisma must be able to parse the raw string. Date-only ("2026-06-01")
  // is rejected as "premature end of input".
  const reservationPayload = {
    guestName: 'John Doe',
    numberOfGuests: 2,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-05T00:00:00.000Z',
    totalCost: 1200,
    platform: 'AIRBNB' as Platform,
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

  async function createProperty(admin: { accessToken: string }) {
    const res = await request(app.getHttpServer())
      .post('/properties')
      .set(...authHeader(admin.accessToken))
      .send({
        propertyName: `Resort-${Date.now()}`,
        propertyAddress: '789 Beach Ave',
        salePrice: 850000,
        saleType: 'SALE',
      })
      .expect(201);
    return res.body;
  }

  describe('POST /properties/:id_property/reservations', () => {
    it('creates a reservation', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      const res = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      expect(res.body.guestName).toBe('John Doe');
      expect(res.body.id_reservation).toBeDefined();
    });

    it('rejects endDate before startDate (400)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send({
          ...reservationPayload,
          startDate: '2026-06-10T00:00:00.000Z',
          endDate: '2026-06-05T00:00:00.000Z',
        })
        .expect(400);
    });

    it('rejects overlapping dates (409)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      const overlap = {
        ...reservationPayload,
        guestName: 'Jane Doe',
        startDate: '2026-06-03T00:00:00.000Z',
        endDate: '2026-06-07T00:00:00.000Z',
      };

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(overlap)
        .expect(409);
    });

    it('returns 404 for property in another tenant', async () => {
      const adminA = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-res-a@test.com',
      });
      const adminB = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-res-b@test.com',
      });
      const property = await createProperty(adminA);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(adminB.accessToken))
        .send(reservationPayload)
        .expect(404);
    });
  });

  describe('GET /properties/:id_property/reservations', () => {
    it('lists reservations for a property', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBe(1);
    });
  });

  describe('PATCH /reservations/:id_reservation', () => {
    it('updates reservation fields', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);
      const created = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/reservations/${created.body.id_reservation}`)
        .set(...authHeader(admin.accessToken))
        .send({ guestName: 'Jane Smith' })
        .expect(200);

      expect(res.body.guestName).toBe('Jane Smith');
    });
  });

  describe('PATCH /reservations/:id_reservation/cancel', () => {
    it('cancels an upcoming reservation', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);
      const created = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/reservations/${created.body.id_reservation}/cancel`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      const cancelled = await prisma.reservation.findUnique({
        where: { id_reservation: created.body.id_reservation },
      });
      expect(cancelled?.status).toBe('CANCELLED');
    });

    it('returns 400 when cancelling an already-cancelled reservation', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);
      const created = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/reservations/${created.body.id_reservation}/cancel`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/reservations/${created.body.id_reservation}/cancel`)
        .set(...authHeader(admin.accessToken))
        .expect(400);
    });
  });

  describe('Costs', () => {
    it('creates a property-level cost', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      const res = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/costs`)
        .set(...authHeader(admin.accessToken))
        .send({ costType: 'CLEANING', date: '2026-06-10T00:00:00.000Z', amount: 150 })
        .expect(201);

      expect(res.body.costType).toBe('CLEANING');
      expect(res.body.id_cost).toBeDefined();
    });

    it('creates a reservation-level cost', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);
      const reservation = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/reservations`)
        .set(...authHeader(admin.accessToken))
        .send(reservationPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/costs`)
        .set(...authHeader(admin.accessToken))
        .send({
          costType: 'PLATFORM_FEE',
          date: '2026-06-10T00:00:00.000Z',
          amount: 50,
          id_reservation: reservation.body.id_reservation,
        })
        .expect(201);

      expect(res.body.id_reservation).toBe(reservation.body.id_reservation);
    });

    it('lists costs for a property (paginated)', async () => {
      const admin = await createUserWithRole(app, prisma, UserRoles.ADMIN);
      const property = await createProperty(admin);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/costs`)
        .set(...authHeader(admin.accessToken))
        .send({ costType: 'CLEANING', date: '2026-06-10T00:00:00.000Z', amount: 150 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/properties/${property.id_property}/costs`)
        .set(...authHeader(admin.accessToken))
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body).toHaveProperty('total');
    });

    it('returns 404 when managing costs in a different tenant', async () => {
      const adminA = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-cost-a@test.com',
      });
      const adminB = await createUserWithRole(app, prisma, UserRoles.ADMIN, {
        email: 'admin-cost-b@test.com',
      });
      const property = await createProperty(adminA);

      await request(app.getHttpServer())
        .post(`/properties/${property.id_property}/costs`)
        .set(...authHeader(adminB.accessToken))
        .send({ costType: 'CLEANING', date: '2026-06-10T00:00:00.000Z', amount: 150 })
        .expect(404);
    });
  });
});
