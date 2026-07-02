// @ts-check
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Advisory perf hint (react-hooks v7), not a correctness rule; it flags
      // legitimate patterns (fetch-then-setState, reset-on-nav). Keep as a warning.
      'react-hooks/set-state-in-effect': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // admin/ may not import from client/ (and vice versa)
  {
    files: ['src/admin/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/client/**', '../client/*', '../../client/*'],
              message: "admin/ may not import from client/. Move shared code to shared/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/client/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/admin/**', '../admin/*', '../../admin/*'],
              message: "client/ may not import from admin/. Move shared code to shared/.",
            },
          ],
        },
      ],
    },
  },
);
