import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CostController } from './cost.controller';
import { CostService } from './cost.service';
import { CostRepository } from './cost.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CostController],
  providers: [CostService, CostRepository],
  exports: [CostService],
})
export class CostModule {}
