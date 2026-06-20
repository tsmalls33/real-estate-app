---
applyTo: "apps/frontend/**/*.{ts,tsx,js,jsx}"
---

# Frontend review rules (React)

Be concise; one comment per real issue. Skip formatting/Prettier nits.

## Module isolation
- `admin/` and `client/` must not import from each other; shared code goes in
  `shared/`. Flag any cross-import.

## Theming
- Use theme tokens / CSS vars (`--brand-*`, `--sidebar-*`, etc.); flag hardcoded
  colors. Changes must work in both light and dark mode.

## Shared types
- `@RealEstate/types` (packages/types) is the BE↔FE contract. When a consumed
  DTO/enum changes, flag UI code that wasn't updated to match.

## Do NOT comment on
- The CRA/ESLint-9 build config or `DISABLE_ESLINT_PLUGIN` (deliberate; lint is
  intentionally not a CI gate yet).
- Requests for E2E/Playwright or visual-regression tests.
- Browserslist / caniuse-lite "out of date" warnings.
