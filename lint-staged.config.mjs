// lint-staged runs each key's command against the matching staged files.
// ESLint is run inside each workspace so the correct eslint.config.mjs is resolved.
export default {
  'apps/backend/**/*.ts': (files) =>
    `pnpm --filter @RealEstate/backend exec eslint --fix ${files.join(' ')}`,

  'apps/frontend/**/*.{ts,tsx,js,jsx}': (files) =>
    `pnpm --filter @RealEstate/frontend exec eslint --fix ${files.join(' ')}`,
};
