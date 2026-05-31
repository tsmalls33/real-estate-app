import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { tenantFilter, type TenantScope } from '../common/types/tenant-scope';
import { AGENT_PAYMENT_SELECT } from './projections/agent-payment.projection';

@Injectable()
export class AgentPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AgentPaymentUncheckedCreateInput) {
    return this.prisma.agentPayment.create({
      data,
      select: AGENT_PAYMENT_SELECT,
    });
  }

  async findAll(params: {
    isPaid?: boolean;
    id_user?: string;
    scope: TenantScope;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const { isPaid, id_user, scope, startDate, endDate, page, limit } =
      params;

    const where: Prisma.AgentPaymentWhereInput = {
      isDeleted: false,
      ...(isPaid !== undefined && { isPaid }),
      ...(id_user && { id_user }),
      ...tenantFilter(scope),
      ...((startDate || endDate) && {
        dueDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.agentPayment.findMany({
        where,
        select: AGENT_PAYMENT_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.agentPayment.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id_agent_payment: string) {
    return this.prisma.agentPayment.findFirst({
      where: { id_agent_payment, isDeleted: false },
      select: AGENT_PAYMENT_SELECT,
    });
  }

  async existsById(id_agent_payment: string): Promise<boolean> {
    const record = await this.prisma.agentPayment.findFirst({
      where: { id_agent_payment, isDeleted: false },
      select: { id_agent_payment: true },
    });
    return record !== null;
  }

  async update(
    id_agent_payment: string,
    data: Prisma.AgentPaymentUncheckedUpdateInput,
  ) {
    return this.prisma.agentPayment.update({
      where: { id_agent_payment },
      data,
      select: AGENT_PAYMENT_SELECT,
    });
  }

  async softDelete(id_agent_payment: string) {
    return this.prisma.agentPayment.update({
      where: { id_agent_payment },
      data: { isDeleted: true },
      select: AGENT_PAYMENT_SELECT,
    });
  }

  async findUserTenant(id_user: string): Promise<string | null | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { id_user, isDeleted: false },
      select: { id_tenant: true },
    });
    // `undefined` means the user does not exist; `null` means the user has no tenant.
    return user === null ? undefined : user.id_tenant;
  }
}
