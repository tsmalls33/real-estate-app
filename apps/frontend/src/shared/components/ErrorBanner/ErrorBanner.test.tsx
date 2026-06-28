import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the message', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<ErrorBanner message="Oops" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders a dismiss button when onDismiss is provided', () => {
    render(<ErrorBanner message="Oops" onDismiss={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render dismiss when onDismiss is omitted', () => {
    render(<ErrorBanner message="Oops" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
