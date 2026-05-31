import { Injectable } from '@nestjs/common';
import {
  Platform,
  Prisma,
  Property,
  PropertyStatus,
  Reservation,
  ReservationStatus,
  SaleType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { tenantFilter, type TenantScope } from '../common/types/tenant-scope';
import {
  PROPERTY_DETAIL_SELECT,
  PROPERTY_LIST_SELECT,
} from './projections/property.projection';

@Injectable()
export class PropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PropertyUncheckedCreateInput): Promise<Property> {
    return (await this.prisma.property.create({
      data,
      select: PROPERTY_LIST_SELECT,
    })) as Property;
  }

  async findAll(filters: {
    status?: PropertyStatus;
    saleType?: SaleType;
    scope: TenantScope;
    id_agent?: string;
    page: number;
    limit: number;
  }): Promise<{ data: Property[]; total: number }> {
    const { page, limit, scope, ...filterFields } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      isDeleted: false,
      ...(filterFields.status && { status: filterFields.status }),
      ...(filterFields.saleType && { saleType: filterFields.saleType }),
      ...tenantFilter(scope),
      ...(filterFields.id_agent && { id_agent: filterFields.id_agent }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        select: PROPERTY_LIST_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data: data as Property[], total };
  }

  async findById(id_property: string): Promise<Property | null> {
    return (await this.prisma.property.findUnique({
      where: { id_property, isDeleted: false },
      select: PROPERTY_DETAIL_SELECT,
    })) as Property | null;
  }

  async existsById(id_property: string): Promise<boolean> {
    const property = await this.prisma.property.findFirst({
      where: { id_property, isDeleted: false },
      select: { id_property: true },
    });
    return property !== null;
  }

  async update(
    id_property: string,
    data: Prisma.PropertyUncheckedUpdateInput,
  ): Promise<Property> {
    return (await this.prisma.property.update({
      where: { id_property },
      data,
      select: PROPERTY_LIST_SELECT,
    })) as Property;
  }

  async softDelete(id_property: string): Promise<Property> {
    return (await this.prisma.property.update({
      where: { id_property },
      data: { isDeleted: true },
      select: PROPERTY_LIST_SELECT,
    })) as Property;
  }

  async findReservations(
    id_property: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      status?: ReservationStatus;
      platform?: Platform;
      page: number;
      limit: number;
    },
  ): Promise<{ data: Reservation[]; total: number }> {
    const { page, limit, startDate, endDate, status, platform } = filters;

    const where = {
      id_property,
      ...(status && { status }),
      ...(platform && { platform }),
      ...((startDate || endDate) && {
        startDate: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return { data, total };
  }

}
