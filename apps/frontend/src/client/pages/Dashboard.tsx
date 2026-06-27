import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Property } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import PropertyList from '../../shared/components/PropertyList/PropertyList';

export default function Dashboard() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.list()
      .then(data => setProperties(data.properties))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <section>
      <h2 className="text-[13px] font-bold text-text tracking-[-0.01em] mb-3">{t('client.dashboard.title')}</h2>
      {error && <div className="border border-dashed border-border-strong rounded-[14px] py-9 px-5 text-center text-text-muted bg-surface">{t('client.dashboard.loadError', { message: error })}</div>}
      {!error && properties === null && <div className="border border-dashed border-border-strong rounded-[14px] py-9 px-5 text-center text-text-muted bg-surface">{t('common.loading')}</div>}
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
