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
    propertyId?: string,
  ): Promise<OwnerDashboardResponse> {
    const raw = await this.prisma.reservation.findMany({
      where: {
        property: { id_owner: userId, isDeleted: false },
        status: { not: ReservationStatus.CANCELLED },
        ...(propertyId ? { id_property: propertyId } : {}),
      },
      include: {
        property: {
          select: { id_property: true, propertyName: true, saleType: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Occupancy is measured against the owner's rentable capacity, so the
    // denominator counts owned rental units (short/long-term), not the for-sale
    // listings and not just the ones that happen to have a booking this month.
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const rentalPropertyCount = await this.prisma.property.count({
      where: {
        id_owner: userId,
        isDeleted: false,
        saleType: SaleType.RENT,
        ...(propertyId ? { id_property: propertyId } : {}),
      },
    });
    const totalNights = rentalPropertyCount * daysInMonth;

    if (raw.length === 0) {
      return {
        kpis: {
          incomeLastMonth: { amount: 0, deltaPercent: 0 },
          nightsBooked: { booked: 0, total: totalNights, occupancyPct: 0 },
          avgNightly: { amount: 0, deltaPercent: 0 },
          nextPayout: { amount: 0, date: null },
        },
        incomeChart: [],
        upcomingCheckins: [],
      };
    }

    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startMonthBefore = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Nights of a reservation that fall inside [windowStart, windowEnd).
    const nightsInWindow = (
      r: { startDate: Date; endDate: Date },
      windowStart: Date,
      windowEnd: Date,
    ) => {
      const from = Math.max(r.startDate.getTime(), windowStart.getTime());
      const to = Math.min(r.endDate.getTime(), windowEnd.getTime());
      return to > from ? Math.ceil((to - from) / 86400000) : 0;
    };

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

    // Only count the portion of each stay that falls within the current month,
    // and only for rental units, so the numerator matches the RENT-scoped
    // denominator and occupancy can never exceed 100%.
    const bookedNights = raw
      .filter((r) => r.property.saleType === SaleType.RENT)
      .reduce(
        (s, r) => s + nightsInWindow(r, startThisMonth, startNextMonth),
        0,
      );

    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start60 = new Date(now.getTime() - 60 * 86400000);
    const avgNightlyOver = (windowStart: Date, windowEnd: Date) => {
      const inWindow = completed.filter(
        (r) => r.endDate >= windowStart && r.endDate < windowEnd,
      );
      const nights = inWindow.reduce(
        (s, r) =>
          s +
          Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / 86400000),
        0,
      );
      if (nights === 0) return 0;
      return Math.round(
        inWindow.reduce((s, r) => s + Number(r.totalCost), 0) / nights,
      );
    };
    const avgNightly = avgNightlyOver(start30, now);
    const avgNightlyPrev = avgNightlyOver(start60, start30);
    const avgNightlyDelta =
      avgNightlyPrev > 0
        ? Math.round(((avgNightly - avgNightlyPrev) / avgNightlyPrev) * 100)
        : 0;

    const completedThisMonth = completed.filter(
      (r) => r.endDate >= startThisMonth,
    );
    const incomeThisMonth = completedThisMonth.reduce(
      (s, r) => s + Number(r.totalCost),
      0,
    );
    const nextPayoutAmount = incomeThisMonth;

    // Date constructor normalizes month overflow (e.g. month 13 -> next year).
    const payoutDate = new Date(now.getFullYear(), now.getMonth() + 2, 5);
    // Format from local calendar parts. toISOString() would convert to UTC and
    // can shift the day by one on servers east of UTC (e.g. the 5th -> the 4th).
    const payoutDateStr = `${payoutDate.getFullYear()}-${String(payoutDate.getMonth() + 1).padStart(2, '0')}-${String(payoutDate.getDate()).padStart(2, '0')}`;

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
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
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
          deltaPercent: avgNightlyDelta,
        },
        nextPayout: {
          amount: nextPayoutAmount,
          date: nextPayoutAmount > 0 ? payoutDateStr : null,
        },
      },
      incomeChart,
      upcomingCheckins,
    };
  }
}
