import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant, Prisma } from '@prisma/client';
import { TENANT_PUBLIC_SELECT, TENANT_WITH_USERS_SELECT } from './projections/tenant.projection';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.TenantCreateInput): Promise<Tenant> {
    return await this.prisma.tenant.create({
      data,
      select: TENANT_PUBLIC_SELECT,
    }) as Tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return await this.prisma.tenant.findMany({
      where: { isDeleted: false },
      select: TENANT_PUBLIC_SELECT,
    }) as Tenant[];
  }

  async findById(id_tenant: string, includeUsers: boolean = false): Promise<Tenant | null> {
    return await this.prisma.tenant.findFirst({
      where: { id_tenant, isDeleted: false },
      select: includeUsers ? TENANT_WITH_USERS_SELECT : TENANT_PUBLIC_SELECT,
    }) as Tenant | null;
  }

  async existsByName(name: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { name },
      select: { id_tenant: true },
    });
    return tenant !== null;
  }

  async existsById(id_tenant: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id_tenant, isDeleted: false },
      select: { id_tenant: true },
    });
    return tenant !== null;
  }

  async update(id_tenant: string, data: Prisma.TenantUpdateInput): Promise<Tenant> {
    return await this.prisma.tenant.update({
      where: { id_tenant },
      data,
      select: TENANT_PUBLIC_SELECT,
    }) as Tenant;
  }

  async softDelete(id_tenant: string): Promise<Tenant> {
    return await this.prisma.tenant.update({
      where: { id_tenant },
      data: { isDeleted: true },
      select: TENANT_PUBLIC_SELECT,
    }) as Tenant;
  }

  async assignTheme(id_tenant: string, id_theme: string): Promise<Tenant> {
    return await this.prisma.tenant.update({
      where: { id_tenant },
      data: { id_theme },
      select: TENANT_PUBLIC_SELECT,
    }) as Tenant;
  }
}
