import { PrismaClient, CostType } from '@prisma/client';
import { seedUuid } from './_uuid';

// Same deterministic PRNG approach as reservation.seed — re-running produces
// identical amounts for a given property.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function atNoon(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(12, 0, 0, 0);
  return x;
}
function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}
// Jitter a base amount by ±pct and round to cents → plausible, non-round values.
function jitter(rng: () => number, base: number, pct: number): number {
  return +(base * (1 + (rng() - 0.5) * 2 * pct)).toFixed(2);
}

// Costs are seeded for every held property except the sold (0012) and inactive
// (0006) ones. Sale properties still incur mortgage/utilities/tax but no
// cleaning (no guest turnover).
type CostProp = {
  id_property: string;
  rental: boolean;
  mortgage: number;
  utilities: number;
  cleaning: number;
};
const COST_PROPS: CostProp[] = [
  {
    id_property: 'property-seed-0001',
    rental: true,
    mortgage: 720,
    utilities: 95,
    cleaning: 65,
  },
  {
    id_property: 'property-seed-0002',
    rental: true,
    mortgage: 640,
    utilities: 80,
    cleaning: 55,
  },
  {
    id_property: 'property-seed-0003',
    rental: false,
    mortgage: 880,
    utilities: 70,
    cleaning: 0,
  },
  {
    id_property: 'property-seed-0004',
    rental: true,
    mortgage: 1020,
    utilities: 110,
    cleaning: 70,
  },
  {
    id_property: 'property-seed-0005',
    rental: true,
    mortgage: 960,
    utilities: 105,
    cleaning: 80,
  },
  {
    id_property: 'property-seed-0007',
    rental: true,
    mortgage: 1180,
    utilities: 120,
    cleaning: 90,
  },
  {
    id_property: 'property-seed-0008',
    rental: true,
    mortgage: 1040,
    utilities: 100,
    cleaning: 60,
  },
  {
    id_property: 'property-seed-0009',
    rental: false,
    mortgage: 1320,
    utilities: 90,
    cleaning: 0,
  },
  {
    id_property: 'property-seed-0010',
    rental: true,
    mortgage: 1460,
    utilities: 140,
    cleaning: 110,
  },
  {
    id_property: 'property-seed-0011',
    rental: true,
    mortgage: 1090,
    utilities: 115,
    cleaning: 85,
  },
];

type CostRow = {
  id_property: string;
  costType: CostType;
  date: Date;
  amount: number;
};

function buildCosts(prop: CostProp, index: number, now: Date): CostRow[] {
  const rng = mulberry32(0xc057_0000 + index * 1009);
  const rows: CostRow[] = [];

  // Month anchors: the current month plus the previous 10.
  const months: Date[] = [];
  for (let i = 10; i >= 0; i--) {
    months.push(
      atNoon(
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)),
      ),
    );
  }

  for (const month of months) {
    const m = month.getUTCMonth();
    const seasonal = m >= 5 && m <= 7 ? 1.3 : m === 11 || m <= 1 ? 1.2 : 1.0;

    // Mortgage — fixed monthly, tiny jitter only.
    rows.push({
      id_property: prop.id_property,
      costType: CostType.MORTGAGE,
      date: atNoon(
        new Date(Date.UTC(month.getUTCFullYear(), m, randInt(rng, 1, 5))),
      ),
      amount: jitter(rng, prop.mortgage, 0.01),
    });

    // Utilities — seasonal swing.
    rows.push({
      id_property: prop.id_property,
      costType: CostType.UTILITIES,
      date: atNoon(
        new Date(Date.UTC(month.getUTCFullYear(), m, randInt(rng, 8, 16))),
      ),
      amount: jitter(rng, prop.utilities * seasonal, 0.15),
    });

    // Cleaning — rentals only, tracks turnover loosely.
    if (prop.rental) {
      rows.push({
        id_property: prop.id_property,
        costType: CostType.CLEANING,
        date: atNoon(
          new Date(Date.UTC(month.getUTCFullYear(), m, randInt(rng, 12, 26))),
        ),
        amount: jitter(rng, prop.cleaning, 0.25),
      });
    }
  }

  // One-off repairs — a few scattered through the year.
  const repairCount = randInt(rng, 2, 4);
  for (let i = 0; i < repairCount; i++) {
    const month = months[randInt(rng, 0, months.length - 1)];
    rows.push({
      id_property: prop.id_property,
      costType: CostType.REPAIRS,
      date: atNoon(
        new Date(
          Date.UTC(
            month.getUTCFullYear(),
            month.getUTCMonth(),
            randInt(rng, 1, 27),
          ),
        ),
      ),
      amount: jitter(rng, randInt(rng, 80, 900), 0.1),
    });
  }

  // Annual property tax — single larger entry.
  const taxMonth = months[randInt(rng, 0, months.length - 1)];
  rows.push({
    id_property: prop.id_property,
    costType: CostType.TAX,
    date: atNoon(
      new Date(
        Date.UTC(
          taxMonth.getUTCFullYear(),
          taxMonth.getUTCMonth(),
          randInt(rng, 1, 27),
        ),
      ),
    ),
    amount: jitter(rng, randInt(rng, 300, 1200), 0.05),
  });

  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function seedCosts(prisma: PrismaClient) {
  console.log('Seeding costs...');

  const now = atNoon(new Date());
  const rows = COST_PROPS.flatMap((p, i) => buildCosts(p, i, now));

  let n = 0;
  for (const row of rows) {
    const id_cost = seedUuid(`cost-seed-${String(++n).padStart(4, '0')}`);
    const data = { ...row, id_property: seedUuid(row.id_property) };
    await prisma.cost.upsert({
      where: { id_cost },
      update: data,
      create: { id_cost, ...data },
    });
  }

  console.log(`Costs seeded successfully (${rows.length} rows)`);
}
