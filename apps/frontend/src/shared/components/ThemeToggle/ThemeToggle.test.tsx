import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeMode } from '@RealEstate/types';

const setMode = vi.fn();
vi.mock('../../theme/ThemeContext', () => ({
  useSession: () => ({ mode: ThemeMode.SYSTEM, setMode }),
}));

import ThemeToggle from './ThemeToggle';

beforeEach(() => vi.clearAllMocks());

describe('ThemeToggle', () => {
  it('renders the three options with the current mode active', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls setMode with the chosen mode', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(setMode).toHaveBeenCalledWith(ThemeMode.DARK);
  });
});
