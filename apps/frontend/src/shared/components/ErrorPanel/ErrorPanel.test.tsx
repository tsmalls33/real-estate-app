import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorPanel from './ErrorPanel';

const renderPanel = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ErrorPanel', () => {
  it('renders preset copy for the forbidden variant', () => {
    renderPanel(<ErrorPanel variant="forbidden" />);
    expect(screen.getByRole('heading', { name: '403 — Forbidden' })).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to view this resource.")).toBeInTheDocument();
  });

  it('renders preset copy for the not-found variant', () => {
    renderPanel(<ErrorPanel variant="not-found" />);
    expect(screen.getByRole('heading', { name: '404 — Not found' })).toBeInTheDocument();
  });

  it('defaults to the error variant with a Back home link', () => {
    renderPanel(<ErrorPanel />);
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back home' })).toBeInTheDocument();
  });

  it('renders preset copy for network-error variant', () => {
    renderPanel(<ErrorPanel variant="network-error" />);
    expect(screen.getByRole('heading', { name: 'Network error' })).toBeInTheDocument();
  });

  it('renders preset copy for api-error variant', () => {
    renderPanel(<ErrorPanel variant="api-error" />);
    expect(screen.getByRole('heading', { name: 'Server error' })).toBeInTheDocument();
  });

  it('renders preset copy for validation-error variant', () => {
    renderPanel(<ErrorPanel variant="validation-error" />);
    expect(screen.getByRole('heading', { name: 'Validation error' })).toBeInTheDocument();
  });

  it('lets custom title/message/action override the preset', () => {
    renderPanel(
      <ErrorPanel variant="error" title="Boom" message="It broke" action={<button>Retry</button>} />,
    );
    expect(screen.getByRole('heading', { name: 'Boom' })).toBeInTheDocument();
    expect(screen.getByText('It broke')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back home' })).not.toBeInTheDocument();
  });
});
