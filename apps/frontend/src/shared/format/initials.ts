/**
 * Derive up-to-two-character avatar initials from a name, falling back to the
 * first two characters of the email when no name is present.
 */
export function initials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string,
): string {
  const f = (firstName ?? '').trim();
  const l = (lastName ?? '').trim();
  if (f || l) return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
  return (email ?? '?').slice(0, 2).toUpperCase();
}