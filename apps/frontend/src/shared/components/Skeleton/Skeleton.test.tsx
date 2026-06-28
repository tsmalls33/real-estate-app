import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders a single skeleton element by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll('.skeleton')).toHaveLength(1);
  });

  it('renders the requested count', () => {
    const { container } = render(<Skeleton count={4} />);
    expect(container.querySelectorAll('.skeleton')).toHaveLength(4);
  });

  it('applies className', () => {
    const { container } = render(<Skeleton className="h-[14px] w-full" />);
    const el = container.querySelector('.skeleton');
    expect(el).toHaveClass('h-[14px]', 'w-full');
  });

  it('renders aria-hidden on skeleton divs', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
