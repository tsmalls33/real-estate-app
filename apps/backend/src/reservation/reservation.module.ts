import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CostModule } from '../cost/cost.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';

@Module({
  imports: [PrismaModule, CostModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationService],
})
export class ReservationModule {}
