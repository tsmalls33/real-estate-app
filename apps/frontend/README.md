# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Accessibility

Component-level a11y (landmarks, `aria-current`, decorative-icon hiding, focus
visibility) is asserted in the Vitest specs and runs with `pnpm test`. Static
JSX a11y rules come from `eslint-plugin-jsx-a11y/recommended`, wired into the
`eslintConfig` in `package.json`.

> Note: CRA's ESLint pass is disabled in CI (`DISABLE_ESLINT_PLUGIN`) because
> react-scripts 5 can't drive the ESLint 9 hoisted into the workspace, so the
> `jsx-a11y` rules are not yet a CI gate. Standing up a dedicated frontend lint
> runner is tracked separately. To run the a11y rules locally against the
> workspace ESLint 9 with a flat config:
>
> ```js
> // eslint.a11y.mjs
> import jsxA11y from 'eslint-plugin-jsx-a11y';
> import tsParser from '@typescript-eslint/parser';
> export default [
>   { files: ['src/**/*.{tsx,jsx}'], ...jsxA11y.flatConfigs.recommended,
>     languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } },
> ];
> ```
> ```bash
> npx eslint --config eslint.a11y.mjs "src/**/*.tsx"
> ```

### Manual pass (axe-core + keyboard)

Two acceptance checks for issue #57 are manual and must be run against the dev
build (`pnpm dev`) before sign-off — they are not automated here:

1. **axe-core** — open DevTools on the admin dashboard, client dashboard, and
   settings pages and run an [axe DevTools](https://www.deque.com/axe/devtools/)
   scan (or `axe.run()` from the console). Resolve any serious/critical issues.
   Target: Lighthouse accessibility score ≥ 95 on those three views.
2. **Keyboard-only walkthrough** — with the mouse unused, complete both flows
   (sign in → dashboard → settings → sign out) for admin and client. Every
   interactive element must take focus with a visible ring and nothing should
   trap focus.
