/**
 * Property money fields arrive as strings: Prisma serializes Decimal columns
 * as strings over JSON, even though the shared type annotates them as number.
 * Coerce defensively and return a formatted euro string, or null when there is
 * no usable amount.
 */
export function formatPrice(
  value: number | string | null | undefined,
): string | null {
  if (value == null) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `€${amount.toLocaleString()}`;
}
