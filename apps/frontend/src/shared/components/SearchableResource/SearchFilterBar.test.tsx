import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilterBar from './SearchFilterBar';
import type { ResourceSearchConfig, SearchFilterValue } from './types';

const config: ResourceSearchConfig = {
  searchParam: 'q',
  searchPlaceholderKey: 'admin.dashboard.searchPlaceholder',
  resetLabelKey: 'admin.dashboard.filters.reset',
  pageSize: 12,
  filterGroups: [
    {
      param: 'status',
      allLabelKey: 'admin.dashboard.filters.all',
      options: [
        { value: 'SOLD', labelKey: 'admin.dashboard.filters.sold' },
        { value: 'INACTIVE', labelKey: 'admin.dashboard.filters.inactive' },
      ],
    },
  ],
};

const empty: SearchFilterValue = { q: '', status: '' };

describe('SearchFilterBar', () => {
  it('renders the All chip + one chip per option from config', () => {
    render(<SearchFilterBar config={config} value={empty} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inactive' })).toBeInTheDocument();
  });

  it('marks the All chip pressed when the group has no value', () => {
    render(<SearchFilterBar config={config} value={empty} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sold' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('emits the selected option value when a chip is clicked', async () => {
    const onChange = vi.fn();
    render(<SearchFilterBar config={config} value={empty} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sold' }));
    expect(onChange).toHaveBeenCalledWith({ q: '', status: 'SOLD' });
  });

  it('clears the group when All is clicked', async () => {
    const onChange = vi.fn();
    render(<SearchFilterBar config={config} value={{ q: '', status: 'SOLD' }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).toHaveBeenCalledWith({ q: '', status: '' });
  });

  it('emits the typed text on the q field', async () => {
    const onChange = vi.fn();
    render(<SearchFilterBar config={config} value={empty} onChange={onChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'a');
    expect(onChange).toHaveBeenCalledWith({ q: 'a', status: '' });
  });

  it('hides Reset when nothing is active and shows + clears it when active', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchFilterBar config={config} value={empty} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();

    rerender(<SearchFilterBar config={config} value={{ q: '', status: 'SOLD' }} onChange={onChange} />);
    const reset = screen.getByRole('button', { name: 'Reset' });
    await userEvent.click(reset);
    expect(onChange).toHaveBeenCalledWith({ q: '', status: '' });
  });
});
