import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgentPaymentController } from './agent-payment.controller';
import { AgentPaymentService } from './agent-payment.service';
import { AgentPaymentRepository } from './agent-payment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AgentPaymentController],
  providers: [AgentPaymentService, AgentPaymentRepository],
  exports: [AgentPaymentService],
})
export class AgentPaymentModule {}
