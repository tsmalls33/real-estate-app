import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import type { Property, PropertyOwnerSummary } from '@RealEstate/types';
import { PropertyStatus } from '@RealEstate/types';
import { formatPrice } from '../../format/price';

const STATUS_KEY: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE_SALE]: 'availableSale',
  [PropertyStatus.AVAILABLE_RENTAL]: 'availableRental',
  [PropertyStatus.INACTIVE]: 'inactive',
  [PropertyStatus.SOLD]: 'sold',
  [PropertyStatus.UNDER_RENTAL]: 'underRental',
};

type Variant = 'admin' | 'client';

type ClassSet = {
  grid: string;
  card: string;
  name: string;
  addr: string;
  row: string;
  status: string;
  empty: string;
};

// Each shell keeps its own visual identity (admin = primary brand, client =
// secondary brand); the variant selects the matching class set.
const CLASSES: Record<Variant, ClassSet> = {
  admin: {
    grid: 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-card:grid-cols-1',
    card: 'bg-surface border border-border rounded-radius py-4 px-[18px] shadow-sm flex flex-col gap-2',
    name: 'text-[14px] font-bold text-text tracking-[-0.01em]',
    addr: 'text-xs text-text-muted',
    row: 'flex items-center justify-between mt-1.5 text-xs text-text-muted',
    status:
      'px-2.5 py-[3px] rounded-full bg-brand-secondary text-brand-on-secondary text-[10px] font-bold tracking-[0.06em] uppercase',
    empty:
      'border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface',
  },
  client: {
    grid: 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-card:grid-cols-1',
    card: 'bg-surface border border-border rounded-[14px] py-[18px] px-5 shadow-sm flex flex-col gap-2.5',
    name: 'text-[15px] font-bold text-text tracking-[-0.01em]',
    addr: 'text-xs text-text-muted',
    row: 'flex justify-between items-center mt-1.5 text-xs text-text-muted',
    status:
      'px-2.5 py-[3px] rounded-full bg-brand-secondary text-brand-on-secondary text-[10px] font-bold tracking-[0.06em] uppercase',
    empty:
      'border border-dashed border-border-strong rounded-[14px] py-9 px-5 text-center text-text-muted bg-surface',
  },
};

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
  emptyLabel,
}: Props) {
  const { t } = useTranslation();

  function ownerLabel(owner?: PropertyOwnerSummary | null): string {
    if (!owner) return t('propertyList.unassigned');
    const full = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim();
    return full || owner.email;
  }

  const c = CLASSES[variant];
  const resolvedEmpty = emptyLabel ?? t('propertyList.empty');
  if (items.length === 0) {
    return <div className={c.empty}>{resolvedEmpty}</div>;
  }
  return (
    <div className={c.grid} data-variant={variant}>
      {items.map(p => {
        const price = formatPrice(p.salePrice);
        return (
          <div key={p.id_property} className={c.card}>
            <div className={c.name}>{p.propertyName}</div>
            <div className={c.addr}>{p.propertyAddress}</div>
            {showOwner && (
              <div className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">
                <FontAwesomeIcon icon={faUser} aria-hidden /> {ownerLabel(p.owner)}
              </div>
            )}
            <div className={c.row}>
              <span className={c.status}>{t(`propertyStatus.${STATUS_KEY[p.status]}`)}</span>
              {price && <span>{price}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
