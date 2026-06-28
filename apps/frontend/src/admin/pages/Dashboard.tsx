import { useTranslation } from 'react-i18next';
import type { Property } from '@RealEstate/types';
import { UserRoles } from '@RealEstate/types';
import { ApiError } from '../../shared/api/client';
import { propertyApi } from '../../shared/api/services';
import PropertyList from '../../shared/components/PropertyList/PropertyList';
import { useSession } from '../../shared/theme/ThemeContext';
import SearchableResource from '../../shared/components/SearchableResource/SearchableResource';
import type { ResourceQuery } from '../../shared/components/SearchableResource/types';
import { propertiesSearchConfig } from './dashboardSearchConfig';
import ErrorPanel from '../../shared/components/ErrorPanel/ErrorPanel';

const fetchProperties = (query: ResourceQuery) =>
  propertyApi.list(query).then(({ properties, total }) => ({ items: properties, total }));

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

  const scopeLabel = me?.role === UserRoles.SUPERADMIN
    ? t('admin.dashboard.scopeAll')
    : t('admin.dashboard.scopeTenant', { tenant: me?.tenant?.name ?? t('admin.dashboard.scopeTenantFallback') });

  const title = me?.role === UserRoles.SUPERADMIN ? t('admin.dashboard.titleAll') : t('admin.dashboard.titleTenant');

  return (
    <SearchableResource<Property>
      config={propertiesSearchConfig}
      fetcher={fetchProperties}
      header={total => (
        <>
          <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">
            {title}{total !== null ? ` (${total})` : ''}
          </h2>
          <p className="text-xs text-text-muted mt-1">{scopeLabel}</p>
        </>
      )}
    >
      {({ items, loading, error }) => {
        if (error) return <ErrorPanel variant={error instanceof ApiError ? 'api-error' : 'network-error'} />;
        if (loading) return (
          <div role="status" aria-label={t('common.loading')}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-card:grid-cols-1">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        );
        return <PropertyList items={items} variant="admin" showOwner />;
      }}
    </SearchableResource>
  );
}
