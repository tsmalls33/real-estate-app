import { PrismaClient, Platform, ReservationStatus } from '@prisma/client';

// Deterministic PRNG (mulberry32) so re-running the seed produces identical
// values for a given property. Seeded per property by index.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_MS = 86_400_000;

// Dates are pinned to noon UTC so day-boundary comparisons are timezone-stable.
function atNoon(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(12, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  return atNoon(new Date(d.getTime() + n * DAY_MS));
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

const GUEST_NAMES = [
  'James Carter',
  'Sofia Rossi',
  'Liam Murphy',
  'Emma Schneider',
  'Noah Dubois',
  'Olivia Bianchi',
  'Lucas Andersen',
  'Mia Hansen',
  'Ethan Walsh',
  'Chloé Martin',
  'Hannah Becker',
  'Marco Ferrari',
  'Aoife Kelly',
  'Daniel Fischer',
  'Júlia Costa',
  'Thomas Nilsson',
] as const;

const LONG_TERM_TENANTS = ['Pere Soler', 'Marta Ruiz'] as const;

// Short-term / hybrid rentals get a rich 12-month history (10mo past + 2mo
// future). Sale, inactive and sold properties are intentionally excluded.
type ShortTermProp = { id_property: string; nightlyRate: number };
const SHORT_TERM: ShortTermProp[] = [
  { id_property: 'property-seed-0001', nightlyRate: 92 }, // Springfield
  { id_property: 'property-seed-0002', nightlyRate: 78 },
  { id_property: 'property-seed-0005', nightlyRate: 115 },
  { id_property: 'property-seed-0007', nightlyRate: 134 }, // Madrid
  { id_property: 'property-seed-0010', nightlyRate: 168 }, // Gran Via, hybrid
  { id_property: 'property-seed-0011', nightlyRate: 124 }, // Barcelona
];

// Long-term tenancies: one ongoing ACTIVE stay each (no turnover).
type LongTermProp = { id_property: string; monthlyRate: number };
const LONG_TERM: LongTermProp[] = [
  { id_property: 'property-seed-0004', monthlyRate: 1450 },
  { id_property: 'property-seed-0008', monthlyRate: 1280 },
];

function platformFor(r: number): Platform {
  if (r < 0.5) return Platform.AIRBNB;
  if (r < 0.85) return Platform.BOOKING;
  return Platform.OTHER; // direct
}

type ReservationRow = {
  id_property: string;
  guestName: string;
  numberOfGuests: number;
  startDate: Date;
  endDate: Date;
  totalCost: number;
  platform: Platform;
  status: ReservationStatus;
  dateCancelled: Date | null;
};

// Fixed stays per property over a 360-day window (10mo back + 2mo ahead),
// one per 20-day slot. A fixed count keeps position-based IDs stable as `now`
// advances, so upsert stays genuinely idempotent (no orphaned high-N rows).
const STAYS_PER_PROPERTY = 18;
const SLOT_DAYS = 20;

function buildShortTermStays(
  prop: ShortTermProp,
  index: number,
  now: Date,
): ReservationRow[] {
  const rng = mulberry32(0x5eed_0000 + index * 1009);
  const windowStart = addDays(now, -300); // ~10 months back
  const rows: ReservationRow[] = [];

  for (let i = 0; i < STAYS_PER_PROPERTY; i++) {
    const slotStart = addDays(windowStart, i * SLOT_DAYS);
    const start = addDays(slotStart, randInt(rng, 0, 6));
    const month = start.getUTCMonth(); // 0-indexed
    const isSummer = month >= 5 && month <= 7; // Jun–Aug peak

    // Summer stays run longer → higher occupancy. Max start jitter (6) + max
    // nights (9) < SLOT_DAYS, so consecutive slots never overlap.
    const nights = isSummer ? randInt(rng, 3, 9) : randInt(rng, 2, 6);
    const end = addDays(start, nights);

    let status: ReservationStatus;
    let dateCancelled: Date | null = null;
    if (rng() < 0.07) {
      status = ReservationStatus.CANCELLED;
      const d = addDays(start, -randInt(rng, 2, 11));
      dateCancelled = d < now ? d : now;
    } else if (end < now) {
      status = ReservationStatus.COMPLETED;
    } else if (start <= now && now < end) {
      status = ReservationStatus.ACTIVE;
    } else {
      status = ReservationStatus.UPCOMING;
    }

    rows.push({
      id_property: prop.id_property,
      guestName: pick(rng, GUEST_NAMES),
      numberOfGuests: isSummer ? randInt(rng, 2, 6) : randInt(rng, 1, 4),
      startDate: start,
      endDate: end,
      totalCost: +(prop.nightlyRate * nights).toFixed(2),
      platform: platformFor(rng()),
      status,
      dateCancelled,
    });
  }

  return rows;
}

function buildLongTermStay(
  prop: LongTermProp,
  index: number,
  now: Date,
): ReservationRow {
  const start = addDays(now, -120 - index * 15);
  const end = addDays(now, 240 - index * 15);
  const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  return {
    id_property: prop.id_property,
    guestName: LONG_TERM_TENANTS[index % LONG_TERM_TENANTS.length],
    numberOfGuests: randInt(mulberry32(index + 1), 1, 3),
    startDate: start,
    endDate: end,
    totalCost: +((prop.monthlyRate * nights) / 30).toFixed(2),
    platform: Platform.OTHER,
    status: ReservationStatus.ACTIVE,
    dateCancelled: null,
  };
}

export async function seedReservations(prisma: PrismaClient) {
  console.log('Seeding reservations...');

  const now = atNoon(new Date());

  const rows: ReservationRow[] = [
    ...SHORT_TERM.flatMap((p, i) => buildShortTermStays(p, i, now)),
    ...LONG_TERM.map((p, i) => buildLongTermStay(p, i, now)),
  ];

  let n = 0;
  for (const row of rows) {
    const id_reservation = `reservation-seed-${String(++n).padStart(4, '0')}`;
    await prisma.reservation.upsert({
      where: { id_reservation },
      update: row,
      create: { id_reservation, ...row },
    });
  }

  console.log(`Reservations seeded successfully (${rows.length} rows)`);
}
