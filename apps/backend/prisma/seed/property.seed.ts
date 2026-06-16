import { PrismaClient, PropertyStatus, SaleType } from '@prisma/client';

type PropertySeed = {
  id_property: string;
  id_tenant: string;
  ownerEmail: string;
  agentEmail: string;
  propertyName: string;
  propertyAddress: string;
  status: PropertyStatus;
  saleType?: SaleType;
};

const PROPERTIES: PropertySeed[] = [
  // Default Tenant — agent: admin@default.com
  // Alice — 1 property
  {
    id_property: 'property-seed-0001',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'alice.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 1',
    propertyAddress: '12 Default Street, Springfield',
    status: PropertyStatus.AVAILABLE_RENTAL,
  },
  // Bob — 2 properties
  {
    id_property: 'property-seed-0002',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'bob.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 2',
    propertyAddress: '34 Default Avenue, Springfield',
    status: PropertyStatus.AVAILABLE_RENTAL,
  },
  {
    id_property: 'property-seed-0003',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'bob.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 3',
    propertyAddress: '56 Default Lane, Springfield',
    status: PropertyStatus.AVAILABLE_SALE,
    saleType: SaleType.SALE,
  },
  // Carol — 3 properties
  {
    id_property: 'property-seed-0004',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'carol.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 4',
    propertyAddress: '78 Default Boulevard, Springfield',
    status: PropertyStatus.UNDER_RENTAL,
  },
  {
    id_property: 'property-seed-0005',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'carol.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 5',
    propertyAddress: '90 Default Road, Springfield',
    status: PropertyStatus.AVAILABLE_RENTAL,
  },
  {
    id_property: 'property-seed-0006',
    id_tenant: 'tenant-seed-0001',
    ownerEmail: 'carol.owner@default.com',
    agentEmail: 'admin@default.com',
    propertyName: 'Default Property 6',
    propertyAddress: '11 Default Place, Springfield',
    status: PropertyStatus.INACTIVE,
  },

  // Devomart — agents split between admin and employee
  // Diego — 1 property
  {
    id_property: 'property-seed-0007',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'diego.propietario@devomart.es',
    agentEmail: 'employee@devomart.es',
    propertyName: 'Devomart Property 1',
    propertyAddress: 'Calle Mayor 1, Madrid',
    status: PropertyStatus.AVAILABLE_RENTAL,
  },
  // Elena — 2 properties
  {
    id_property: 'property-seed-0008',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'elena.propietaria@devomart.es',
    agentEmail: 'employee@devomart.es',
    propertyName: 'Devomart Property 2',
    propertyAddress: 'Avenida del Sol 22, Barcelona',
    status: PropertyStatus.UNDER_RENTAL,
  },
  {
    id_property: 'property-seed-0009',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'elena.propietaria@devomart.es',
    agentEmail: 'admin@devomart.es',
    propertyName: 'Devomart Property 3',
    propertyAddress: 'Paseo del Prado 47, Madrid',
    status: PropertyStatus.AVAILABLE_SALE,
    saleType: SaleType.SALE,
  },
  // Fernando — 3 properties
  {
    id_property: 'property-seed-0010',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'fernando.propietario@devomart.es',
    agentEmail: 'admin@devomart.es',
    propertyName: 'Devomart Property 4',
    propertyAddress: 'Gran Via 130, Madrid',
    status: PropertyStatus.AVAILABLE_RENTAL,
  },
  {
    id_property: 'property-seed-0011',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'fernando.propietario@devomart.es',
    agentEmail: 'employee@devomart.es',
    propertyName: 'Devomart Property 5',
    propertyAddress: 'Carrer de Provença 88, Barcelona',
    status: PropertyStatus.UNDER_RENTAL,
  },
  {
    id_property: 'property-seed-0012',
    id_tenant: 'tenant-seed-0002',
    ownerEmail: 'fernando.propietario@devomart.es',
    agentEmail: 'admin@devomart.es',
    propertyName: 'Devomart Property 6',
    propertyAddress: 'Plaza de España 9, Sevilla',
    status: PropertyStatus.SOLD,
    saleType: SaleType.SALE,
  },
];

export async function seedProperties(prisma: PrismaClient) {
  console.log('Seeding properties...');

  const emails = Array.from(
    new Set(PROPERTIES.flatMap((p) => [p.ownerEmail, p.agentEmail])),
  );
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id_user: true, email: true },
  });
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id_user]));

  for (const p of PROPERTIES) {
    const id_owner = userIdByEmail.get(p.ownerEmail);
    const id_agent = userIdByEmail.get(p.agentEmail);
    if (!id_owner || !id_agent) {
      throw new Error(
        `Missing seeded user for property ${p.id_property} (owner=${p.ownerEmail}, agent=${p.agentEmail})`,
      );
    }

    const data = {
      propertyName: p.propertyName,
      propertyAddress: p.propertyAddress,
      id_tenant: p.id_tenant,
      id_owner,
      id_agent,
      status: p.status,
      saleType: p.saleType ?? null,
    };

    await prisma.property.upsert({
      where: { id_property: p.id_property },
      update: data,
      create: { id_property: p.id_property, ...data },
    });
  }

  console.log('Properties seeded successfully');
}
