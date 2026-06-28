import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import type { Property } from '@RealEstate/types';
import { UserRoles } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import { useSession } from '../../shared/theme/ThemeContext';
import PropertyList from '../../shared/components/PropertyList/PropertyList';

const LIMIT = 12;

type State = { properties: Property[]; total: number } | null;

export default function Dashboard() {
  const { t } = useTranslation();
  const { me } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<State>(null);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  useEffect(() => {
    propertyApi.list({ page, limit: LIMIT })
      .then(setData)
      .catch((err: Error) => setError(err.message));
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
  const from = data ? (page - 1) * LIMIT + 1 : 0;
  const to = data ? Math.min(page * LIMIT, data.total) : 0;

  return (
    <section>
      <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">
        {title}{data ? ` (${data.total})` : ''}
      </h2>
      <p className="text-xs text-text-muted mt-1 mb-4">{scopeLabel}</p>
      {error && <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">{t('admin.dashboard.loadError', { message: error })}</div>}
      {!error && data === null && <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">{t('common.loading')}</div>}
      {!error && data !== null && (
        <PropertyList items={data.properties} variant="admin" showOwner />
      )}
      {!error && data !== null && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-xs text-text-muted">
          <span>{from}–{to} of {data.total}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 rounded hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {renderPages(totalPages, page, setPage)}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 rounded hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
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
        className={`px-2 py-1 rounded hover:bg-surface-alt ${
          p === current ? 'font-bold text-text' : ''
        }`}
      >
        {p}
      </button>
    ),
  );
}
