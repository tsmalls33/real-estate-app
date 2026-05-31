import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AgentPaymentRepository } from './agent-payment.repository';
import { CreateAgentPaymentDto } from './dto/create-agent-payment.dto';
import { UpdateAgentPaymentDto } from './dto/update-agent-payment.dto';
import { GetAgentPaymentsQueryParams } from './dto/get-agent-payments-query-params';
import { type TenantScope, assertTenantMatch } from '../common/types/tenant-scope';

@Injectable()
export class AgentPaymentService {
  constructor(
    private readonly agentPaymentRepository: AgentPaymentRepository,
  ) {}

  async create(dto: CreateAgentPaymentDto, scope: TenantScope) {
    // A payment inherits its tenant from the user it's attributed to. This
    // keeps payments from ever being orphaned and prevents a tenant-scoped
    // caller from creating a payment for a user in another tenant.
    const userTenant = await this.agentPaymentRepository.findUserTenant(
      dto.id_user,
    );
    if (userTenant === undefined) {
      throw new NotFoundException(`User '${dto.id_user}' not found`);
    }

    assertTenantMatch(scope, userTenant);

    if (!userTenant) {
      throw new BadRequestException(
        'Cannot create an agent payment for a user with no tenant',
      );
    }

    return this.agentPaymentRepository.create({
      ...(dto as Prisma.AgentPaymentUncheckedCreateInput),
      id_tenant: userTenant,
    });
  }

  async findAll(query: GetAgentPaymentsQueryParams, scope: TenantScope) {
    return this.agentPaymentRepository.findAll({
      isPaid: query.isPaid,
      id_user: query.id_user,
      scope,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  async findOne(id_agent_payment: string, scope?: TenantScope) {
    const payment =
      await this.agentPaymentRepository.findById(id_agent_payment);
    if (!payment)
      throw new NotFoundException(
        `AgentPayment '${id_agent_payment}' not found`,
      );

    if (scope) assertTenantMatch(scope, payment.id_tenant);

    return payment;
  }

  async update(id_agent_payment: string, dto: UpdateAgentPaymentDto, scope?: TenantScope) {
    const payment =
      await this.agentPaymentRepository.findById(id_agent_payment);
    if (!payment)
      throw new NotFoundException(
        `AgentPayment '${id_agent_payment}' not found`,
      );

    if (scope) assertTenantMatch(scope, payment.id_tenant);

    return this.agentPaymentRepository.update(
      id_agent_payment,
      dto as Prisma.AgentPaymentUncheckedUpdateInput,
    );
  }

  async remove(id_agent_payment: string, scope?: TenantScope) {
    const payment =
      await this.agentPaymentRepository.findById(id_agent_payment);
    if (!payment)
      throw new NotFoundException(
        `AgentPayment '${id_agent_payment}' not found`,
      );

    if (scope) assertTenantMatch(scope, payment.id_tenant);

    return this.agentPaymentRepository.softDelete(id_agent_payment);
  }
}
