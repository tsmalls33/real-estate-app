import { render, screen } from '@testing-library/react';

// Scaffold smoke test: proves the Vitest + jsdom + Testing Library +
// jest-dom harness is wired correctly. Real component/page tests come later.
test('test harness renders a component into jsdom', () => {
  render(<h1>scaffold ok</h1>);
  expect(
    screen.getByRole('heading', { name: /scaffold ok/i }),
  ).toBeInTheDocument();
});
