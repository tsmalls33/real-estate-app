import { useEffect, useState } from 'react';
import type { Property } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import { formatPrice } from '../../shared/format/price';
import '../components/PropertyList.css';

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
      {!error && items !== null && items.length === 0 && (
        <div className="cli-empty">You don't have any properties yet.</div>
      )}
      {!error && items && items.length > 0 && (
        <div className="cli-prop-grid">
          {items.map(p => {
            const price = formatPrice(p.salePrice);
            return (
              <div key={p.id_property} className="cli-prop-card">
                <div className="cli-prop-name">{p.propertyName}</div>
                <div className="cli-prop-addr">{p.propertyAddress}</div>
                <div className="cli-prop-row">
                  <span className="cli-status-pill">{p.status.replace('_', ' ')}</span>
                  {price && <span>{price}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
