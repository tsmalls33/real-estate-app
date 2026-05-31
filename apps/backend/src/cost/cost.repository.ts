import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { tenantFilter, type TenantScope } from '../common/types/tenant-scope';
import { GetCostsQueryParams } from './dto/get-costs-query-params';
import { COST_SELECT } from './projections/cost.projection';

@Injectable()
export class CostRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.CostUncheckedCreateInput) {
    return this.prisma.cost.create({ data, select: COST_SELECT });
  }

  async findAll(query: GetCostsQueryParams, scope: TenantScope) {
    const { costType, id_property, id_reservation } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.CostWhereInput = {
      isDeleted: false,
      ...(costType && { costType: costType }),
      ...(id_property && { id_property }),
      ...(id_reservation && { id_reservation }),
      ...tenantFilter(scope, 'property'),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cost.findMany({
        where,
        select: COST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.cost.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id_cost: string) {
    return this.prisma.cost.findFirst({
      where: { id_cost, isDeleted: false },
      select: COST_SELECT,
    });
  }

  async existsById(id_cost: string): Promise<boolean> {
    const cost = await this.prisma.cost.findFirst({
      where: { id_cost, isDeleted: false },
      select: { id_cost: true },
    });
    return cost !== null;
  }

  async update(id_cost: string, data: Prisma.CostUncheckedUpdateInput) {
    return this.prisma.cost.update({
      where: { id_cost },
      data,
      select: COST_SELECT,
    });
  }

  async softDelete(id_cost: string) {
    return this.prisma.cost.update({
      where: { id_cost },
      data: { isDeleted: true },
      select: COST_SELECT,
    });
  }

  async findReservationProperty(id_reservation: string): Promise<string | null> {
    const res = await this.prisma.reservation.findUnique({
      where: { id_reservation },
      select: { id_property: true },
    });
    return res?.id_property ?? null;
  }

  async findPropertyTenant(id_property: string): Promise<string | null> {
    const property = await this.prisma.property.findUnique({
      where: { id_property },
      select: { id_tenant: true },
    });
    return property?.id_tenant ?? null;
  }
}
