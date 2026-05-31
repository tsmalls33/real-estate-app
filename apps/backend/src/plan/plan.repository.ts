import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, Prisma } from '@prisma/client';
import {
  PLAN_PUBLIC_SELECT,
  PLAN_WITH_TENANT_COUNT_SELECT,
} from './projections/plan.projection';

@Injectable()
export class PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlanCreateInput): Promise<Plan> {
    return (await this.prisma.plan.create({
      data,
      select: PLAN_PUBLIC_SELECT,
    })) as Plan;
  }

  async findAll(isActive?: boolean): Promise<Plan[]> {
    const where = isActive !== undefined ? { isActive } : {};
    return (await this.prisma.plan.findMany({
      where,
      select: PLAN_PUBLIC_SELECT,
    })) as Plan[];
  }

  async findById(
    id_plan: string,
  ): Promise<(Plan & { tenantCount: number }) | null> {
    const result = await this.prisma.plan.findUnique({
      where: { id_plan },
      select: PLAN_WITH_TENANT_COUNT_SELECT,
    });
    if (!result) return null;
    const { _count, ...rest } = result as any;
    return { ...rest, tenantCount: _count.tenants };
  }

  async existsById(id_plan: string): Promise<boolean> {
    const plan = await this.prisma.plan.findUnique({
      where: { id_plan },
      select: { id_plan: true },
    });
    return plan !== null;
  }

  async existsByName(name: string): Promise<boolean> {
    const plan = await this.prisma.plan.findUnique({
      where: { name },
      select: { id_plan: true },
    });
    return plan !== null;
  }

  async countTenants(id_plan: string): Promise<number> {
    return this.prisma.tenant.count({ where: { id_plan } });
  }

  async update(id_plan: string, data: Prisma.PlanUpdateInput): Promise<Plan> {
    return (await this.prisma.plan.update({
      where: { id_plan },
      data,
      select: PLAN_PUBLIC_SELECT,
    })) as Plan;
  }

  async softDelete(id_plan: string): Promise<Plan> {
    return (await this.prisma.plan.update({
      where: { id_plan },
      data: { isActive: false },
      select: PLAN_PUBLIC_SELECT,
    })) as Plan;
  }
}
