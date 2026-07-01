import { Test, TestingModule } from '@nestjs/testing';
import { Platform, ReservationStatus } from '@prisma/client';
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
  },
});

describe('PropertyRepository – getOwnerDashboardMetrics', () => {
  let repository: PropertyRepository;
  let mockPrisma: { reservation: { findMany: jest.Mock } };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(NOW);

    mockPrisma = {
      reservation: {
        findMany: jest.fn(),
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

  it('returns a zeroed payload when the owner has no reservations', async () => {
    mockPrisma.reservation.findMany.mockResolvedValue([]);

    const result = await repository.getOwnerDashboardMetrics('owner-1');

    expect(result).toEqual({
      kpis: {
        incomeLastMonth: { amount: 0, deltaPercent: 0 },
        nightsBooked: { booked: 0, total: 0, occupancyPct: 0 },
        avgNightly: { amount: 0, deltaPercent: 0 },
        nextPayout: { amount: 0, date: '' },
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
});
