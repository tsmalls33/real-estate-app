import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // CRA keeps JSX in plain `.js` files; the `tsx` loader parses JSX in `.js`
  // and also handles `.ts`/`.tsx` type syntax (a superset of jsx).
  esbuild: { loader: 'tsx', include: /src\/.*\.[jt]sx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
