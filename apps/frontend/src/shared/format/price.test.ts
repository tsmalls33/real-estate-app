import { describe, it, expect } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
  it('formats a number as a grouped euro amount', () => {
    expect(formatPrice(500000)).toBe('€500,000');
  });

  it('coerces a Prisma Decimal-as-string into a euro amount', () => {
    // The whole reason this helper exists: Prisma serializes Decimal columns as
    // strings over JSON even though the type says number.
    expect(formatPrice('1250')).toBe('€1,250');
  });

  it('returns null for null / undefined', () => {
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(undefined)).toBeNull();
  });

  it('returns null for a non-numeric / non-finite value', () => {
    expect(formatPrice('not-a-number')).toBeNull();
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('formats zero rather than treating it as missing', () => {
    expect(formatPrice(0)).toBe('€0');
  });
});
