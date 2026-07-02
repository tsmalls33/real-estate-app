import { PrismaClient, PlanPeriod } from '@prisma/client';
import { seedUuid } from './_uuid';

const DEFAULT_PLANS = [
  {
    id_plan: 'plan-seed-0001',
    name: 'Basic',
    price: 0,
    pricePeriod: PlanPeriod.MONTHLY,
  },
  {
    id_plan: 'plan-seed-0002',
    name: 'Pro',
    price: 29.99,
    pricePeriod: PlanPeriod.MONTHLY,
  },
  {
    id_plan: 'plan-seed-0003',
    name: 'Premium',
    price: 49.99,
    pricePeriod: PlanPeriod.MONTHLY,
  },
];

export async function seedPlans(prisma: PrismaClient) {
  console.log('Seeding plans...');

  for (const plan of DEFAULT_PLANS) {
    const id_plan = seedUuid(plan.id_plan);
    await prisma.plan.upsert({
      where: { id_plan },
      update: {
        name: plan.name,
        price: plan.price,
        pricePeriod: plan.pricePeriod,
      },
      create: { ...plan, id_plan },
    });
  }

  console.log('Plans seeded successfully');
}
