import { PrismaClient } from '@prisma/client';
import { seedUuid } from './_uuid';

const DEFAULT_TENANTS = [
  {
    id_tenant: 'tenant-seed-0001',
    name: 'Default Tenant',
    customDomain: null as string | null,
    id_theme: 'theme-seed-0001', // Default
  },
  {
    id_tenant: 'tenant-seed-0002',
    name: 'Devomart',
    customDomain: 'www.devomart.es',
    id_theme: 'theme-seed-0003', // Devomart Default
  },
];

export async function seedTenants(prisma: PrismaClient) {
  console.log('Seeding tenants...');

  for (const tenant of DEFAULT_TENANTS) {
    const id_tenant = seedUuid(tenant.id_tenant);
    const id_theme = seedUuid(tenant.id_theme);
    await prisma.tenant.upsert({
      where: { id_tenant },
      update: {
        customDomain: tenant.customDomain,
        id_theme,
      },
      create: { ...tenant, id_tenant, id_theme },
    });
  }

  console.log('Tenants seeded successfully');
}
