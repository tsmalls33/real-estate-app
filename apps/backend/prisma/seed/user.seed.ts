import { PrismaClient, UserRoles } from '@prisma/client';
import { seedPasswordHash } from './_password';

const DEFAULT_USERS = [
  {
    email: 'superadmin@gmail.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRoles.SUPERADMIN,
    id_tenant: null as string | null,
  },
  {
    email: 'admin@default.com',
    firstName: 'Default',
    lastName: 'Admin',
    role: UserRoles.ADMIN,
    id_tenant: 'tenant-seed-0001',
  },
  {
    email: 'admin@devomart.es',
    firstName: 'Devomart',
    lastName: 'Admin',
    role: UserRoles.ADMIN,
    id_tenant: 'tenant-seed-0002',
  },
  {
    email: 'employee@devomart.es',
    firstName: 'Devomart',
    lastName: 'Employee',
    role: UserRoles.EMPLOYEE,
    id_tenant: 'tenant-seed-0002',
  },
];

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const passwordHash = await seedPasswordHash('Password123!');

  for (const user of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { firstName: user.firstName, lastName: user.lastName, role: user.role, id_tenant: user.id_tenant },
      create: { ...user, passwordHash },
    });
  }

  console.log('Users seeded successfully');
}
