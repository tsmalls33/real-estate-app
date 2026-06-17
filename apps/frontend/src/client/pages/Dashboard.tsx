import { useEffect, useState } from 'react';
import type { Property } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import PropertyList from '../../shared/components/PropertyList/PropertyList';

export default function Dashboard() {
  const [items, setItems] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.list()
      .then(d => setItems(d.properties))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section>
      <h2 className="cli-section-h">Your properties</h2>
      {error && <div className="cli-empty">Couldn't load your properties: {error}</div>}
      {!error && items === null && <div className="cli-empty">Loading…</div>}
      {!error && items !== null && (
        <PropertyList
          items={items}
          variant="client"
          emptyLabel="You don't have any properties yet."
        />
      )}
    </section>
  );
}
