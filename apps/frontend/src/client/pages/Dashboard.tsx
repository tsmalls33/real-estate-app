import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Property } from '@RealEstate/types';
import { ApiError } from '../../shared/api/client';
import { propertyApi } from '../../shared/api/services';
import PropertyList from '../../shared/components/PropertyList/PropertyList';
import ErrorPanel, { type Variant as ErrorVariant } from '../../shared/components/ErrorPanel/ErrorPanel';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-[14px] py-[18px] px-5 shadow-sm flex flex-col gap-2.5" aria-hidden>
      <div className="skeleton h-[15px] w-3/4 rounded" />
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
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<{ variant: ErrorVariant; message: string } | null>(null);

  useEffect(() => {
    propertyApi.list()
      .then(data => setProperties(data.properties))
      .catch((err: Error) => setError({
        variant: err instanceof ApiError ? 'api-error' : 'network-error',
        message: err.message,
      }));
  }, []);

  return (
    <section>
      <h2 className="text-[13px] font-bold text-text tracking-[-0.01em] mb-3">{t('client.dashboard.title')}</h2>
      {error && <ErrorPanel variant={error.variant} {...(error.variant === 'api-error' ? { message: error.message } : {})} />}
      {!error && properties === null && (
        <div role="status" aria-label={t('common.loading')}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-card:grid-cols-1">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}
      {!error && properties !== null && (
        <PropertyList
          items={properties}
          variant="client"
          emptyLabel={t('client.dashboard.empty')}
        />
      )}
    </section>
  );
}
