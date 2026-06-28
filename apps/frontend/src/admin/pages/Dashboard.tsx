import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import type { Property } from '@RealEstate/types';
import { UserRoles } from '@RealEstate/types';
import { ApiError } from '../../shared/api/client';
import { propertyApi } from '../../shared/api/services';
import { useSession } from '../../shared/theme/ThemeContext';
import PropertyList from '../../shared/components/PropertyList/PropertyList';
import ErrorPanel, { type Variant as ErrorVariant } from '../../shared/components/ErrorPanel/ErrorPanel';

const LIMIT = 12;

type State = { properties: Property[]; total: number } | null;
type ErrorState = { variant: ErrorVariant; message: string };

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-radius py-4 px-[18px] shadow-sm flex flex-col gap-2" aria-hidden>
      <div className="skeleton h-[14px] w-3/4 rounded" />
      <div className="skeleton h-[12px] w-1/2 rounded" />
      <div className="flex items-center justify-between mt-1.5">
        <div className="skeleton h-[10px] w-[80px] rounded-full" />
        <div className="skeleton h-[12px] w-[60px] rounded" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { me } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<State>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  useEffect(() => {
    setData(null);
    setError(null);
    propertyApi.list({ page, limit: LIMIT })
      .then(setData)
      .catch((err: Error) => setError({
        variant: err instanceof ApiError ? 'api-error' : 'network-error',
        message: err.message,
      }));
  }, [page]);

  const setPage = useCallback((p: number) => {
    setSearchParams(prev => {
      if (p <= 1) prev.delete('page');
      else prev.set('page', String(p));
      return prev;
    });
  }, [setSearchParams]);

  const scopeLabel = me?.role === UserRoles.SUPERADMIN
    ? t('admin.dashboard.scopeAll')
    : t('admin.dashboard.scopeTenant', { tenant: me?.tenant?.name ?? t('admin.dashboard.scopeTenantFallback') });

  const title = me?.role === UserRoles.SUPERADMIN ? t('admin.dashboard.titleAll') : t('admin.dashboard.titleTenant');

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const hasItems = data !== null && data.properties.length > 0;
  const from = hasItems ? (page - 1) * LIMIT + 1 : 0;
  const to = hasItems ? Math.min(page * LIMIT, data.total) : 0;

  return (
    <section>
      <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">
        {title}{data ? ` (${data.total})` : ''}
      </h2>
      <p className="text-xs text-text-muted mt-1 mb-4">{scopeLabel}</p>
      {error && <ErrorPanel variant={error.variant} {...(error.variant === 'api-error' ? { message: error.message } : {})} />}
      {!error && data === null && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-card:grid-cols-1">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {!error && data !== null && (
        <PropertyList items={data.properties} variant="admin" showOwner />
      )}
      {!error && data !== null && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-xs text-text-muted">
          <span>{t('admin.dashboard.paginationCount', { from, to, total: data.total })}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 rounded hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('common.back')}
            </button>
            {renderPages(totalPages, page, setPage)}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 rounded hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
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
      <span key={`e${i}`} className="px-1">…</span>
    ) : (
      <button
        key={p}
        onClick={() => go(p)}
        disabled={p === current}
        aria-current={p === current ? 'page' : undefined}
        className={`px-2 py-1 rounded hover:bg-surface-alt disabled:cursor-not-allowed ${
          p === current ? 'font-bold text-text' : ''
        }`}
      >
        {p}
      </button>
    ),
  );
}
