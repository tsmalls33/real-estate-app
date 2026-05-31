import { PrismaClient } from '@prisma/client';

const DEFAULT_TENANTS = [
  { id_tenant: 'tenant-seed-0001', name: 'Default Tenant', customDomain: null as string | null },
  { id_tenant: 'tenant-seed-0002', name: 'Devomart', customDomain: 'www.devomart.es' },
];

export async function seedTenants(prisma: PrismaClient) {
  console.log('Seeding tenants...');

  for (const tenant of DEFAULT_TENANTS) {
    await prisma.tenant.upsert({
      where: { id_tenant: tenant.id_tenant },
      update: { id_tenant: tenant.id_tenant, customDomain: tenant.customDomain },
      create: tenant,
    });
  }

  console.log('Tenants seeded successfully');
}
