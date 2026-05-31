import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { tenantFilter, type TenantScope } from '../common/types/tenant-scope';
import { CLIENT_SELECT } from './projections/client.projection';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClientUncheckedCreateInput) {
    return this.prisma.client.create({ data, select: CLIENT_SELECT });
  }

  async findAll(params: {
    search?: string;
    scope: TenantScope;
    page: number;
    limit: number;
  }) {
    const { search, scope, page, limit } = params;

    const where: Prisma.ClientWhereInput = {
      isDeleted: false,
      ...tenantFilter(scope),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        select: CLIENT_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id_client: string) {
    return this.prisma.client.findFirst({
      where: { id_client, isDeleted: false },
      select: CLIENT_SELECT,
    });
  }

  async existsById(id_client: string): Promise<boolean> {
    const client = await this.prisma.client.findFirst({
      where: { id_client, isDeleted: false },
      select: { id_client: true },
    });
    return client !== null;
  }

  async update(id_client: string, data: Prisma.ClientUncheckedUpdateInput) {
    return this.prisma.client.update({
      where: { id_client },
      data,
      select: CLIENT_SELECT,
    });
  }

  async softDelete(id_client: string) {
    return this.prisma.client.update({
      where: { id_client },
      data: { isDeleted: true },
      select: CLIENT_SELECT,
    });
  }
}
