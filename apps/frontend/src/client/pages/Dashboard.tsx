import { useEffect, useState } from 'react';
import type { Property } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import PropertyList from '../../shared/components/PropertyList/PropertyList';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.list()
      .then(data => setProperties(data.properties))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <section>
      <h2 className="text-[13px] font-bold text-text tracking-[-0.01em] mb-3">Your properties</h2>
      {error && <div className="border border-dashed border-border-strong rounded-[14px] py-9 px-5 text-center text-text-muted bg-surface">Couldn't load your properties: {error}</div>}
      {!error && properties === null && <div className="border border-dashed border-border-strong rounded-[14px] py-9 px-5 text-center text-text-muted bg-surface">Loading…</div>}
      {!error && properties !== null && (
        <PropertyList
          items={properties}
          variant="client"
          emptyLabel="You don't have any properties yet."
        />
      )}
    </section>
  );
}
