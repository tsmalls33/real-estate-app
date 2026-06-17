import { useEffect, useState } from 'react';
import type { Property } from '@RealEstate/types';
import { UserRoles } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import { useSession } from '../../shared/theme/ThemeContext';
import PropertyList from '../../shared/components/PropertyList/PropertyList';

type State = { properties: Property[]; total: number } | null;

export default function Dashboard() {
  const { me } = useSession();
  const [data, setData] = useState<State>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.list()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const scopeLabel = me?.role === UserRoles.SUPERADMIN
    ? 'All properties across all tenants'
    : `Properties for ${me?.tenant?.name ?? 'your agency'}`;

  const title = me?.role === UserRoles.SUPERADMIN ? 'All Properties' : 'Properties';

  return (
    <section>
      <h2 className="section-title">
        {title}{data ? ` (${data.total})` : ''}
      </h2>
      <p className="section-sub">{scopeLabel}</p>
      {error && <div className="prop-empty">Couldn't load properties: {error}</div>}
      {!error && data === null && <div className="prop-empty">Loading…</div>}
      {!error && data !== null && (
        <PropertyList items={data.properties} variant="admin" showOwner />
      )}
    </section>
  );
}
