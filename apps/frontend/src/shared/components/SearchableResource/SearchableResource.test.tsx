import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchableResource from './SearchableResource';
import type { ResourceQuery, ResourceSearchConfig, SearchableResourceState } from './types';

type Item = { id: string };

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

const body = (state: SearchableResourceState<Item>) =>
  state.items.map(item => <div key={item.id}>{item.id}</div>);

function renderAt(route: string, fetcher: (q: ResourceQuery) => Promise<{ items: Item[]; total: number }>) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SearchableResource<Item> config={config} fetcher={fetcher}>
        {body}
      </SearchableResource>
    </MemoryRouter>,
  );
}

afterEach(() => vi.useRealTimers());

describe('SearchableResource', () => {
  it('fetches with the search + filter + page params read from the URL', async () => {
    const fetcher = vi.fn(async (_q: ResourceQuery) => ({ items: [] as Item[], total: 0 }));
    renderAt('/?q=foo&status=SOLD&page=2', fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(fetcher).toHaveBeenCalledWith({ q: 'foo', status: 'SOLD', page: 2, limit: 12 });
  });

  it('renders the fetched items through children', async () => {
    const fetcher = vi.fn(async (_q: ResourceQuery) => ({
      items: [{ id: 'x1' }, { id: 'x2' }] as Item[],
      total: 2,
    }));
    renderAt('/', fetcher);
    expect(await screen.findByText('x1')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
  });

  it('resets the page when a filter changes', async () => {
    const fetcher = vi.fn(async (_q: ResourceQuery) => ({ items: [] as Item[], total: 0 }));
    renderAt('/?page=2', fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));

    fetcher.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Sold' }));

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    const last = fetcher.mock.calls.at(-1)![0];
    expect(last.status).toBe('SOLD');
    expect(last.page).toBe(1);
  });

  it('debounces the search text before re-fetching', async () => {
    const fetcher = vi.fn(async (_q: ResourceQuery) => ({ items: [] as Item[], total: 0 }));
    renderAt('/', fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1)); // initial fetch

    fetcher.mockClear();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cas' } });
    expect(fetcher).not.toHaveBeenCalled(); // not until the debounce elapses

    await waitFor(
      () => expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ q: 'cas', page: 1, limit: 12 })),
      { timeout: 1000 },
    );
  });
});
