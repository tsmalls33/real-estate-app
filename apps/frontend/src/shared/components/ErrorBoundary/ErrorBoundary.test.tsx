import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

function Boom(): React.ReactElement {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <div>all good</div>
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('catches a render error and shows the error panel', () => {
    // React logs the caught error to console.error; silence it for this case.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    spy.mockRestore();
  });
});
