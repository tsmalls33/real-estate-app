import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tenant } from '@RealEstate/types';
import { ApiError } from '../../shared/api/client';
import { tenantApi } from '../../shared/api/services';
import ErrorPanel, { type Variant as ErrorVariant } from '../../shared/components/ErrorPanel/ErrorPanel';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-radius py-4 px-[18px] shadow-sm flex flex-col gap-2" aria-hidden>
      <div className="skeleton h-[14px] w-3/4 rounded" />
      <div className="skeleton h-[12px] w-1/2 rounded" />
      <div className="skeleton h-[10px] w-[60px] rounded-full mt-1.5" />
    </div>
  );
}

export default function Tenants() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<{ variant: ErrorVariant; message: string } | null>(null);

  useEffect(() => {
    tenantApi.list()
      .then(setTenants)
      .catch((err: Error) => setError({
        variant: err instanceof ApiError ? 'api-error' : 'network-error',
        message: err.message,
      }));
  }, []);

  return (
    <section>
      <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">{t('admin.tenants.title')}</h2>
      <p className="text-xs text-text-muted mt-1 mb-4">{t('admin.tenants.description')}</p>
      {error && <ErrorPanel variant={error.variant} {...(error.variant === 'api-error' ? { message: error.message } : {})} />}
      {!error && tenants === null && (
        <div role="status" aria-label={t('common.loading')}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-card:grid-cols-1">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}
      {!error && tenants !== null && tenants.length === 0 && (
        <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">
          {t('admin.tenants.empty')}
        </div>
      )}
      {!error && tenants && tenants.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-card:grid-cols-1">
          {tenants.map(tenant => (
            <div
              key={tenant.id_tenant}
              className="bg-surface border border-border rounded-radius py-4 px-[18px] shadow-sm flex flex-col gap-2"
            >
              <div className="text-[14px] font-bold text-text tracking-[-0.01em]">{tenant.name}</div>
              <div className="text-xs text-text-muted">{tenant.customDomain ?? t('admin.tenants.noDomain')}</div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-text-muted">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.06em] uppercase bg-brand-primary-soft text-brand-primary">
                  {tenant.id_plan ? t('admin.tenants.onPlan') : t('admin.tenants.noPlan')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
