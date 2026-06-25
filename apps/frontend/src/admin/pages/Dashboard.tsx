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
      .catch((err: Error) => setError(err.message));
  }, []);

  const scopeLabel = me?.role === UserRoles.SUPERADMIN
    ? 'All properties across all tenants'
    : `Properties for ${me?.tenant?.name ?? 'your agency'}`;

  const title = me?.role === UserRoles.SUPERADMIN ? 'All Properties' : 'Properties';

  return (
    <section>
      <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">
        {title}{data ? ` (${data.total})` : ''}
      </h2>
      <p className="text-xs text-text-muted mt-1 mb-4">{scopeLabel}</p>
      {error && <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">Couldn't load properties: {error}</div>}
      {!error && data === null && <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">Loading…</div>}
      {!error && data !== null && (
        <PropertyList items={data.properties} variant="admin" showOwner />
      )}
    </section>
  );
}
