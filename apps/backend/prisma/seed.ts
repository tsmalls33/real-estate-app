import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { seedThemes } from './seed/theme.seed';
import { seedTenants } from './seed/tenant.seed';
import { seedUsers } from './seed/user.seed';
import { seedPlans } from './seed/plan.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Running seeds......');
  await seedThemes(prisma);
  await seedTenants(prisma);
  await seedUsers(prisma);
  await seedPlans(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
