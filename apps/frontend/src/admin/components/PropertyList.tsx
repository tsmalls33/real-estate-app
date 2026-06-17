import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import type { Property, PropertyOwnerSummary } from '@RealEstate/types';
import { formatPrice } from '../../shared/format/price';
import './PropertyList.css';

function ownerLabel(owner?: PropertyOwnerSummary | null): string {
  if (!owner) return 'Unassigned';
  const full = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim();
  return full || owner.email;
}

export default function PropertyList({ items }: { items: Property[] }) {
  if (items.length === 0) {
    return <div className="prop-empty">No properties yet.</div>;
  }
  return (
    <div className="prop-grid">
      {items.map(p => {
        const price = formatPrice(p.salePrice);
        return (
          <div key={p.id_property} className="prop-card">
            <div className="prop-card-name">{p.propertyName}</div>
            <div className="prop-card-addr">{p.propertyAddress}</div>
            <div className="prop-card-owner"><FontAwesomeIcon icon={faUser} /> {ownerLabel(p.owner)}</div>
            <div className="prop-card-row">
              <span className="prop-status">{p.status.replace('_', ' ')}</span>
              {price && <span>{price}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
