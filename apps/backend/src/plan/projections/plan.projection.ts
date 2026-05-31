export const PLAN_PUBLIC_SELECT = {
  id_plan: true,
  name: true,
  price: true,
  pricePeriod: true,
  isActive: true,
} as const;

export const PLAN_WITH_TENANT_COUNT_SELECT = {
  ...PLAN_PUBLIC_SELECT,
  _count: {
    select: { tenants: true },
  },
} as const;
