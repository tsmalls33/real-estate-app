import { createHash } from 'node:crypto';

// Deterministic UUIDv5 so human-readable seed slugs ('property-seed-0001') map
// to stable, valid UUIDs. Keeps the seed sources readable and their cross-file
// references intact while satisfying UUID validation (e.g. ?property on the
// owner dashboard). Re-running the seed always yields the same id for a slug.
const SEED_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

export function seedUuid(slug: string): string {
  const ns = Buffer.from(SEED_NAMESPACE.replace(/-/g, ''), 'hex');
  const bytes = createHash('sha1')
    .update(ns)
    .update(slug, 'utf8')
    .digest()
    .subarray(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
