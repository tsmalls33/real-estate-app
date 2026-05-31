import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanController } from './plan.controller';
import { PlanRepository } from './plan.repository';
import { PlanService } from './plan.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService],
})
export class PlanModule {}
