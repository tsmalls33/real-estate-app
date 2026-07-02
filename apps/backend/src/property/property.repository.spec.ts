import { Test, TestingModule } from '@nestjs/testing';
import { Platform, ReservationStatus, SaleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyRepository } from './property.repository';

// now = 2026-07-15 (local). July has 31 days.
const NOW = new Date(2026, 6, 15, 12, 0, 0);

type ResOverrides = {
  id?: string;
  status?: ReservationStatus;
  start: Date;
  end: Date;
  totalCost?: number;
  platform?: Platform;
  guestName?: string;
  propertyId?: string;
  propertyName?: string;
  saleType?: SaleType;
};

const makeRes = (o: ResOverrides) => ({
  id_reservation: o.id ?? 'res-1',
  status: o.status ?? ReservationStatus.COMPLETED,
  startDate: o.start,
  endDate: o.end,
  totalCost: o.totalCost ?? 0,
  platform: o.platform ?? Platform.AIRBNB,
  guestName: o.guestName ?? 'Guest',
  property: {
    id_property: o.propertyId ?? 'prop-1',
    propertyName: o.propertyName ?? 'Test Property',
    saleType: o.saleType ?? SaleType.RENT,
  },
});

describe('PropertyRepository – getOwnerDashboardMetrics', () => {
  let repository: PropertyRepository;
  let mockPrisma: {
    reservation: { findMany: jest.Mock };
    property: { count: jest.Mock };
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(NOW);

    mockPrisma = {
      reservation: {
        findMany: jest.fn(),
      },
      property: {
        // Owner's rentable capacity; overridden per-test where occupancy matters.
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<PropertyRepository>(PropertyRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a zeroed payload when the owner has no reservations or rentals', async () => {
    mockPrisma.reservation.findMany.mockResolvedValue([]);
    mockPrisma.property.count.mockResolvedValue(0);

    const result = await repository.getOwnerDashboardMetrics('owner-1');

    expect(result).toEqual({
      kpis: {
        incomeLastMonth: { amount: 0, deltaPercent: 0 },
        nightsBooked: { booked: 0, total: 0, occupancyPct: 0 },
        avgNightly: { amount: 0, deltaPercent: 0 },
        nextPayout: { amount: 0, date: null },
      },
      incomeChart: [],
      upcomingCheckins: [],
    });
  });

  it('clips booked nights to the current month so occupancy never exceeds 100%', async () => {
    // One property, one reservation spanning Jun 20 -> Jul 20.
    // Only Jul 1 -> Jul 20 (19 nights) falls in the current month.
    mockPrisma.reservation.findMany.mockResolvedValue([
      makeRes({
        status: ReservationStatus.ACTIVE,
        start: new Date(2026, 5, 20),
        end: new Date(2026, 6, 20),
      }),
    ]);

    const { nightsBooked } = (
      await repository.getOwnerDashboardMetrics('owner-1')
    ).kpis;

    expect(nightsBooked.booked).toBe(19);
    expect(nightsBooked.total).toBe(31);
    expect(nightsBooked.occupancyPct).toBe(61);
    expect(nightsBooked.occupancyPct).toBeLessThanOrEqual(100);
  });

  it('sizes occupancy by the owner rental count, not just booked properties', async () => {
    // 4 rental units owned, but only one has a booking (19 nights in July).
    mockPrisma.property.count.mockResolvedValue(4);
    mockPrisma.reservation.findMany.mockResolvedValue([
      makeRes({
        status: ReservationStatus.ACTIVE,
        start: new Date(2026, 6, 1),
        end: new Date(2026, 6, 20),
      }),
    ]);

    const { nightsBooked } = (
      await repository.getOwnerDashboardMetrics('owner-1')
    ).kpis;

    // total = 4 units * 31 days, not 1 * 31
    expect(nightsBooked.total).toBe(124);
    expect(nightsBooked.booked).toBe(19);
    expect(nightsBooked.occupancyPct).toBe(15);

    // denominator only counts owned, non-deleted rental units
    const { where } = mockPrisma.property.count.mock.calls[0][0];
    expect(where).toEqual({
      id_owner: 'owner-1',
      isDeleted: false,
      saleType: SaleType.RENT,
    });
  });

  it('excludes non-rental properties from booked nights so occupancy stays <= 100%', async () => {
    // Denominator = 1 rental unit (31 nights). A reservation attached to a
    // SALE property must not add to the numerator, or occupancy would blow past 100%.
    mockPrisma.property.count.mockResolvedValue(1);
    mockPrisma.reservation.findMany.mockResolvedValue([
      makeRes({
        id: 'rent',
        status: ReservationStatus.ACTIVE,
        start: new Date(2026, 6, 1),
        end: new Date(2026, 6, 11), // 10 nights on the rental
      }),
      makeRes({
        id: 'sale',
        status: ReservationStatus.ACTIVE,
        propertyId: 'prop-sale',
        saleType: SaleType.SALE,
        start: new Date(2026, 6, 1),
        end: new Date(2026, 6, 31), // 30 nights on a for-sale unit — must be ignored
      }),
    ]);

    const { nightsBooked } = (
      await repository.getOwnerDashboardMetrics('owner-1')
    ).kpis;

    expect(nightsBooked.booked).toBe(10);
    expect(nightsBooked.total).toBe(31);
    expect(nightsBooked.occupancyPct).toBeLessThanOrEqual(100);
  });

  it('returns the soonest upcoming check-ins first, capped at 5', async () => {
    // Query returns startDate desc; the soonest arrivals must surface first.
    const desc = [
      makeRes({
        id: 'r6',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 11, 1),
        end: new Date(2026, 11, 5),
      }),
      makeRes({
        id: 'r5',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 10, 1),
        end: new Date(2026, 10, 4),
      }),
      makeRes({
        id: 'r4',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 9, 1),
        end: new Date(2026, 9, 3),
      }),
      makeRes({
        id: 'r3',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 8, 1),
        end: new Date(2026, 8, 3),
      }),
      makeRes({
        id: 'r2',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 7, 10),
        end: new Date(2026, 7, 12),
      }),
      makeRes({
        id: 'r1',
        status: ReservationStatus.UPCOMING,
        start: new Date(2026, 6, 25),
        end: new Date(2026, 6, 27),
      }),
    ];
    mockPrisma.reservation.findMany.mockResolvedValue(desc);

    const { upcomingCheckins } =
      await repository.getOwnerDashboardMetrics('owner-1');

    expect(upcomingCheckins.map((c) => c.id)).toEqual([
      'r1',
      'r2',
      'r3',
      'r4',
      'r5',
    ]);
    // check-in dates are returned in ascending (soonest-first) order
    const checkIns = upcomingCheckins.map((c) => c.checkIn);
    expect(checkIns).toEqual([...checkIns].sort());
  });

  it('computes avgNightly delta against the preceding 30-day window', async () => {
    mockPrisma.reservation.findMany.mockResolvedValue([
      // last 30 days (Jun 15 -> Jul 15): 10 nights, 1000 total => 100/night
      makeRes({
        id: 'cur',
        status: ReservationStatus.COMPLETED,
        start: new Date(2026, 5, 30),
        end: new Date(2026, 6, 10),
        totalCost: 1000,
      }),
      // preceding 30 days (May 16 -> Jun 15): 5 nights, 250 total => 50/night
      makeRes({
        id: 'prev',
        status: ReservationStatus.COMPLETED,
        start: new Date(2026, 5, 5),
        end: new Date(2026, 5, 10),
        totalCost: 250,
      }),
    ]);

    const { avgNightly } = (
      await repository.getOwnerDashboardMetrics('owner-1')
    ).kpis;

    expect(avgNightly.amount).toBe(100);
    expect(avgNightly.deltaPercent).toBe(100);
  });

  it('scopes the query to a single property when a propertyId is given', async () => {
    mockPrisma.reservation.findMany.mockResolvedValue([]);

    await repository.getOwnerDashboardMetrics('owner-1', 'prop-9');

    const { where } = mockPrisma.reservation.findMany.mock.calls[0][0];
    expect(where.id_property).toBe('prop-9');
    // ownership is still enforced by the owner relation filter
    expect(where.property).toEqual({ id_owner: 'owner-1', isDeleted: false });
  });

  it('omits id_property from the where clause for the combined view', async () => {
    mockPrisma.reservation.findMany.mockResolvedValue([]);

    await repository.getOwnerDashboardMetrics('owner-1');

    const { where } = mockPrisma.reservation.findMany.mock.calls[0][0];
    expect(where).not.toHaveProperty('id_property');
  });
});
