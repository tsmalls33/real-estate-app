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
      <h2 className="cli-section-h">Your properties</h2>
      {error && <div className="cli-empty">Couldn't load your properties: {error}</div>}
      {!error && properties === null && <div className="cli-empty">Loading…</div>}
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
