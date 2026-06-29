export default {
  'apps/backend/**/*.ts':
    'pnpm --filter @RealEstate/backend exec eslint --fix',

  'apps/frontend/**/*.{ts,tsx,js,jsx}':
    'pnpm --filter @RealEstate/frontend exec eslint --fix',
};
