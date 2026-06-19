import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import type { Property, PropertyOwnerSummary } from '@RealEstate/types';
import { formatPrice } from '../../format/price';
import './PropertyList.css';

type Variant = 'admin' | 'client';

// Each shell keeps its own visual identity (admin = primary brand, client =
// secondary brand); the variant selects the matching class set.
const CLASSES: Record<
  Variant,
  { grid: string; card: string; name: string; addr: string; row: string; status: string; empty: string }
> = {
  admin: {
    grid: 'prop-grid',
    card: 'prop-card',
    name: 'prop-card-name',
    addr: 'prop-card-addr',
    row: 'prop-card-row',
    status: 'prop-status',
    empty: 'prop-empty',
  },
  client: {
    grid: 'cli-prop-grid',
    card: 'cli-prop-card',
    name: 'cli-prop-name',
    addr: 'cli-prop-addr',
    row: 'cli-prop-row',
    status: 'cli-status-pill',
    empty: 'cli-empty',
  },
};

function ownerLabel(owner?: PropertyOwnerSummary | null): string {
  if (!owner) return 'Unassigned';
  const full = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim();
  return full || owner.email;
}

type Props = {
  items: Property[];
  variant: Variant;
  showOwner?: boolean;
  emptyLabel?: string;
};

export default function PropertyList({
  items,
  variant,
  showOwner = false,
  emptyLabel = 'No properties yet.',
}: Props) {
  const c = CLASSES[variant];
  if (items.length === 0) {
    return <div className={c.empty}>{emptyLabel}</div>;
  }
  return (
    <div className={c.grid}>
      {items.map(p => {
        const price = formatPrice(p.salePrice);
        return (
          <div key={p.id_property} className={c.card}>
            <div className={c.name}>{p.propertyName}</div>
            <div className={c.addr}>{p.propertyAddress}</div>
            {showOwner && (
              <div className="prop-card-owner">
                <FontAwesomeIcon icon={faUser} /> {ownerLabel(p.owner)}
              </div>
            )}
            <div className={c.row}>
              <span className={c.status}>{p.status.replace('_', ' ')}</span>
              {price && <span>{price}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
