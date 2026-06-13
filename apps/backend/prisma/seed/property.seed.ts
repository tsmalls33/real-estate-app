import { PrismaClient, Property } from '@prisma/client';

const DEFAULT_PROPERTIES: Partial<Property>[] = [
  {
    id_tenant: 'tenant-seed-0001',
    id_property: 'property-seed-0001',
    propertyName: 'Default Property 1',
    propertyAddress: 'Default address 1',
  },
  {
    id_tenant: 'tenant-seed-0002',
    id_property: 'property-seed-0002',
    propertyName: 'Devomart Property 1',
    propertyAddress: 'Devomart address 1',
  }
];

export async function seedProperties(prisma: PrismaClient) {
  console.log('Seeding properties...');

  for (const property of DEFAULT_PROPERTIES) {
    await prisma.property.upsert({
      where: { id_property: property.id_property },
      update: { propertyName: property.propertyName, propertyAddress: property.propertyAddress, id_tenant: property.id_tenant },
      create: { ...property as Property },
    });
  }

  console.log('Properties seeded successfully');
}
