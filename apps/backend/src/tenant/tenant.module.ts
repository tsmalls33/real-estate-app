import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantRepository } from './tenant.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ThemeModule } from '../theme/theme.module';

@Module({
  imports: [PrismaModule, ThemeModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
})
export class TenantModule {}
