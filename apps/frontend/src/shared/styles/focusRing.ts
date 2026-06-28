// Shared keyboard-focus indicator. Applied to every interactive element so the
// ring is consistent and uses the dedicated --focus-ring token (see tokens.css),
// never the brand color. focus-visible keeps it keyboard-only (no ring on click).
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
