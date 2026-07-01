import { Injectable } from '@nestjs/common';
import {
  Platform,
  Prisma,
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
  presentOwner,
  type PropertyDetail,
  type PropertyListItem,
} from './projections/property.projection';
import type {
  IncomeChartItem,
  OwnerDashboardResponse,
  UpcomingCheckin,
} from '@RealEstate/types';

@Injectable()
export class PropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.PropertyUncheckedCreateInput,
  ): Promise<PropertyListItem> {
    return presentOwner(
      await this.prisma.property.create({
        data,
        select: PROPERTY_LIST_SELECT,
      }),
    );
  }

  async findAll(filters: {
    status?: PropertyStatus;
    saleType?: SaleType;
    q?: string;
    scope: TenantScope;
    id_agent?: string;
    id_owner?: string;
    page: number;
    limit: number;
  }): Promise<{ properties: PropertyListItem[]; total: number }> {
    const { page, limit, scope, ...filterFields } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      isDeleted: false,
      ...(filterFields.status && { status: filterFields.status }),
      ...(filterFields.saleType && { saleType: filterFields.saleType }),
      ...(filterFields.q && {
        OR: [
          { propertyName: { contains: filterFields.q, mode: 'insensitive' } },
          {
            propertyAddress: { contains: filterFields.q, mode: 'insensitive' },
          },
          {
            owner: {
              firstName: { contains: filterFields.q, mode: 'insensitive' },
              isDeleted: false,
            },
          },
          {
            owner: {
              lastName: { contains: filterFields.q, mode: 'insensitive' },
              isDeleted: false,
            },
          },
        ],
      }),
      ...tenantFilter(scope),
      ...(filterFields.id_agent && { id_agent: filterFields.id_agent }),
      ...(filterFields.id_owner && { id_owner: filterFields.id_owner }),
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

    return { properties: data.map(presentOwner), total };
  }

  async findById(id_property: string): Promise<PropertyDetail | null> {
    const property = await this.prisma.property.findUnique({
      where: { id_property, isDeleted: false },
      select: PROPERTY_DETAIL_SELECT,
    });
    return property ? presentOwner(property) : null;
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
  ): Promise<PropertyListItem> {
    return presentOwner(
      await this.prisma.property.update({
        where: { id_property },
        data,
        select: PROPERTY_LIST_SELECT,
      }),
    );
  }

  async softDelete(id_property: string): Promise<PropertyListItem> {
    return presentOwner(
      await this.prisma.property.update({
        where: { id_property },
        data: { isDeleted: true },
        select: PROPERTY_LIST_SELECT,
      }),
    );
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

  async getOwnerDashboardMetrics(
    userId: string,
  ): Promise<OwnerDashboardResponse> {
    const raw = await this.prisma.reservation.findMany({
      where: {
        property: { id_owner: userId, isDeleted: false },
        status: { not: ReservationStatus.CANCELLED },
      },
      include: {
        property: { select: { id_property: true, propertyName: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    if (raw.length === 0) {
      return {
        kpis: {
          incomeLastMonth: { amount: 0, deltaPercent: 0 },
          nightsBooked: { booked: 0, total: 0, occupancyPct: 0 },
          avgNightly: { amount: 0, deltaPercent: 0 },
          nextPayout: { amount: 0, date: '' },
        },
        incomeChart: [],
        upcomingCheckins: [],
      };
    }

    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startMonthBefore = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const completed = raw.filter(
      (r) => r.status === ReservationStatus.COMPLETED,
    );
    const lastMonthCompleted = completed.filter(
      (r) => r.endDate >= startLastMonth && r.endDate < startThisMonth,
    );
    const prevMonthCompleted = completed.filter(
      (r) => r.endDate >= startMonthBefore && r.endDate < startLastMonth,
    );

    const incomeLastMonth = lastMonthCompleted.reduce(
      (s, r) => s + Number(r.totalCost),
      0,
    );
    const incomePrevMonth = prevMonthCompleted.reduce(
      (s, r) => s + Number(r.totalCost),
      0,
    );
    const deltaPercent =
      incomePrevMonth > 0
        ? Math.round(
            ((incomeLastMonth - incomePrevMonth) / incomePrevMonth) * 100,
          )
        : 0;

    const proms = [...new Set(raw.map((r) => r.property.id_property))];
    const nightsPerProperty = raw
      .filter((r) => r.endDate >= startThisMonth)
      .reduce(
        (acc, r) => {
          const id = r.property.id_property;
          acc[id] =
            (acc[id] ?? 0) +
            Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / 86400000);
          return acc;
        },
        {} as Record<string, number>,
      );

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const totalNights = proms.length * daysInMonth;
    const bookedNights = Object.values(nightsPerProperty).reduce(
      (s, v) => s + v,
      0,
    );

    const completedLast30 = completed.filter(
      (r) => r.endDate >= new Date(now.getTime() - 30 * 86400000),
    );
    const totalNightsLast30 = completedLast30.reduce(
      (s, r) =>
        s + Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / 86400000),
      0,
    );
    const avgNightly =
      totalNightsLast30 > 0
        ? Math.round(
            completedLast30.reduce((s, r) => s + Number(r.totalCost), 0) /
              totalNightsLast30,
          )
        : 0;

    const completedThisMonth = completed.filter(
      (r) => r.endDate >= startThisMonth,
    );
    const incomeThisMonth = completedThisMonth.reduce(
      (s, r) => s + Number(r.totalCost),
      0,
    );
    const nextPayoutAmount = incomeThisMonth;

    const payoutMonth = now.getMonth() + 2;
    const payoutYear =
      payoutMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
    const payoutDate = new Date(
      payoutYear,
      payoutMonth > 11 ? payoutMonth - 12 : payoutMonth,
      5,
    );

    const incomeChart: IncomeChartItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthCompleted = completed.filter(
        (r) => r.endDate >= monthStart && r.endDate < monthEnd,
      );

      incomeChart.push({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        airbnb: monthCompleted
          .filter((r) => r.platform === Platform.AIRBNB)
          .reduce((s, r) => s + Number(r.totalCost), 0),
        booking: monthCompleted
          .filter((r) => r.platform === Platform.BOOKING)
          .reduce((s, r) => s + Number(r.totalCost), 0),
        other: monthCompleted
          .filter((r) => r.platform === Platform.OTHER)
          .reduce((s, r) => s + Number(r.totalCost), 0),
      });
    }

    const upcomingCheckins: UpcomingCheckin[] = raw
      .filter((r) => r.status === ReservationStatus.UPCOMING)
      .slice(0, 5)
      .map((r) => ({
        id: r.id_reservation,
        guestName: r.guestName,
        propertyName: r.property.propertyName,
        checkIn: r.startDate.toISOString().split('T')[0],
        nights: Math.ceil(
          (r.endDate.getTime() - r.startDate.getTime()) / 86400000,
        ),
        channel: r.platform as UpcomingCheckin['channel'],
      }));

    return {
      kpis: {
        incomeLastMonth: { amount: incomeLastMonth, deltaPercent },
        nightsBooked: {
          booked: bookedNights,
          total: totalNights,
          occupancyPct:
            totalNights > 0
              ? Math.round((bookedNights / totalNights) * 100)
              : 0,
        },
        avgNightly: {
          amount: avgNightly,
          deltaPercent: 0,
        },
        nextPayout: {
          amount: nextPayoutAmount,
          date: `${payoutDate.toISOString().split('T')[0]}`,
        },
      },
      incomeChart,
      upcomingCheckins,
    };
  }
}
