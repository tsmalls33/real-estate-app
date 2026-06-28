import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import SearchFilterBar from './SearchFilterBar';
import type {
  ResourceQuery,
  SearchableResourceProps,
  SearchableResourceState,
  SearchFilterValue,
} from './types';

const DEBOUNCE_MS = 300;

// Entity-agnostic container: owns URL state (search + filters + page), debounces
// the search text into the URL, fetches via the supplied `fetcher`, and renders
// the filter bar + pagination. It knows nothing about the resource it lists —
// the page supplies the config, fetcher, optional header, and the body renderer.
export default function SearchableResource<T>({
  config,
  fetcher,
  header,
  children,
}: SearchableResourceProps<T>) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQ = searchParams.get(config.searchParam) ?? '';
  // Local copy drives the input immediately; debounced into the URL below.
  const [qInput, setQInput] = useState(urlQ);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  // Debounce the search text into the URL; any search change also resets the page.
  useEffect(() => {
    if (qInput === urlQ) return;
    const id = setTimeout(() => {
      setSearchParams(
        prev => {
          if (qInput) prev.set(config.searchParam, qInput);
          else prev.delete(config.searchParam);
          prev.delete('page');
          return prev;
        },
        { replace: true },
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [qInput, urlQ, config.searchParam, setSearchParams]);

  const value: SearchFilterValue = useMemo(() => {
    const next: SearchFilterValue = { q: qInput };
    for (const group of config.filterGroups) next[group.param] = searchParams.get(group.param) ?? '';
    return next;
  }, [qInput, searchParams, config.filterGroups]);

  const handleChange = useCallback(
    (next: SearchFilterValue) => {
      if (next.q !== qInput) setQInput(next.q);
      const changed = config.filterGroups.filter(
        group => (next[group.param] ?? '') !== (searchParams.get(group.param) ?? ''),
      );
      if (changed.length > 0) {
        setSearchParams(prev => {
          for (const group of changed) {
            const v = next[group.param] ?? '';
            if (v) prev.set(group.param, v);
            else prev.delete(group.param);
          }
          prev.delete('page'); // filter change resets pagination
          return prev;
        });
      }
    },
    [qInput, searchParams, config.filterGroups, setSearchParams],
  );

  const query: ResourceQuery = useMemo(() => {
    const next: ResourceQuery = { page, limit: config.pageSize };
    const q = searchParams.get(config.searchParam);
    if (q) next.q = q;
    for (const group of config.filterGroups) {
      const v = searchParams.get(group.param);
      if (v) next[group.param] = v;
    }
    return next;
  }, [searchParams, page, config.searchParam, config.pageSize, config.filterGroups]);

  const queryKey = JSON.stringify(query);

  const [state, setState] = useState<SearchableResourceState<T>>({
    items: [],
    total: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, loading: true, error: null }));
    fetcher(query)
      .then(res => {
        if (!cancelled) setState({ items: res.items, total: res.total, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ items: [], total: 0, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
    // query is captured via queryKey; fetcher is expected to be stable (module-scope).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, fetcher]);

  const totalPages = Math.ceil(state.total / config.pageSize);
  const hasItems = !state.loading && !state.error && state.items.length > 0;
  const from = hasItems ? (page - 1) * config.pageSize + 1 : 0;
  const to = hasItems ? Math.min(page * config.pageSize, state.total) : 0;

  const setPage = useCallback(
    (p: number) => {
      setSearchParams(prev => {
        if (p <= 1) prev.delete('page');
        else prev.set('page', String(p));
        return prev;
      });
    },
    [setSearchParams],
  );

  const headerTotal = state.loading || state.error ? null : state.total;

  return (
    <section>
      {header?.(headerTotal)}

      <SearchFilterBar config={config} value={value} onChange={handleChange} />

      {children({ items: state.items, total: state.total, loading: state.loading, error: state.error })}

      {!state.loading && !state.error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-xs text-text-muted">
          <span>{t('common.paginationCount', { from, to, total: state.total })}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('common.back')}
            </button>
            {renderPages(totalPages, page, setPage)}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function renderPages(totalPages: number, current: number, go: (p: number) => void) {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages.map((p, i) =>
    p === 'ellipsis' ? (
      <span key={`e${i}`} className="px-1">
        …
      </span>
    ) : (
      <button
        key={p}
        onClick={() => go(p)}
        disabled={p === current}
        aria-current={p === current ? 'page' : undefined}
        className={`px-2 py-1 rounded hover:bg-hover disabled:cursor-not-allowed ${
          p === current ? 'font-bold text-text' : ''
        }`}
      >
        {p}
      </button>
    ),
  );
}
