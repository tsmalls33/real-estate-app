import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRoles } from '@RealEstate/types';
import { signUpAs } from './auth';

export interface TestUserSession {
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}

/**
 * Sign up as a CLIENT user, then promote the DB record to the given role and
 * attach it to a fresh tenant. Returns a session with a brand new JWT that
 * reflects the updated role + tenantId.
 */
export async function createUserWithRole(
  app: INestApplication<App>,
  prisma: PrismaService,
  role: UserRoles,
  overrides: Partial<{ email: string }> = {},
): Promise<TestUserSession> {
  const email =
    overrides.email ?? `${role.toLowerCase()}-${Date.now()}@example.com`;

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: { name: `Tenant-${role}-${Date.now()}` },
  });

  // 1. Sign up via API → creates CLIENT user
  const session = await signUpAs(app, { email });

  // 2. Promote role + attach tenant in DB
  await prisma.user.update({
    where: { email },
    data: { role, id_tenant: tenant.id_tenant },
  });

  // 3. Sign in again to get a JWT with the updated role+tenant
  const signin = await request(app.getHttpServer())
    .post('/auth/signin')
    .send({ email, password: session.password })
    .expect(200);

  return {
    email,
    password: session.password,
    accessToken: signin.body.accessToken,
    refreshToken: signin.body.refreshToken,
    userId: signin.body.user.id_user,
    tenantId: tenant.id_tenant,
  };
}
