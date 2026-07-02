import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Property } from '@RealEstate/types';
import { propertyApi } from '../../shared/api/services';
import ScrollFade from '../../shared/components/ScrollFade/ScrollFade';

export default function PropertySwitcher() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedId = searchParams.get('property') || 'all';

  useEffect(() => {
    propertyApi.list()
      .then(res => setProperties(res.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || properties.length === 0) return null;

  const handleSelect = (id: string) => {
    setSearchParams(id === 'all' ? {} : { property: id }, { replace: true });
  };

  const pillClass = (isActive: boolean) =>
    `flex-shrink-0 flex items-center gap-[10px] pl-[8px] pr-[16px] py-[7px] rounded-full text-left cursor-pointer transition-all duration-150 border ${
      isActive
        ? 'bg-brand-primary border-brand-secondary text-brand-on-primary'
        : 'bg-surface border-border text-text hover:border-brand-secondary hover:shadow-sm'
    }`;

  const chip = (
    id: string,
    label: string,
    subtitle: string,
    leading: ReactNode,
    isActive: boolean,
  ) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => handleSelect(id)}
      className={pillClass(isActive)}
    >
      {leading}
      <span className="flex flex-col leading-[1.2] min-w-0">
        <span className="text-[12.5px] font-semibold truncate">{label}</span>
        <span className={`text-[10.5px] truncate ${isActive ? 'text-brand-on-primary/70' : 'text-text-muted'}`}>
          {subtitle}
        </span>
      </span>
    </button>
  );

  const radio = (isActive: boolean) => (
    <span
      className={`w-[30px] h-[30px] rounded-full flex-shrink-0 grid place-items-center border-2 ${
        isActive ? 'border-brand-on-primary/60' : 'border-border-strong'
      }`}
    >
      <span className={`w-[10px] h-[10px] rounded-full ${isActive ? 'bg-brand-on-primary' : 'bg-transparent'}`} />
    </span>
  );

  const thumb = (p: Property) => (
    <span className="w-[30px] h-[30px] rounded-[8px] flex-shrink-0 overflow-hidden grid place-items-center bg-surface-2 text-[15px]">
      {p.coverImage
        ? <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
        : <span aria-hidden>🏠</span>}
    </span>
  );

  return (
    <ScrollFade className="flex gap-2 py-[4px]" role="tablist" aria-label={t('client.dashboard.title')}>
      {chip('all', t('client.dashboard.allProperties'), t('client.dashboard.combinedView'), radio(selectedId === 'all'), selectedId === 'all')}
      {properties.map(p =>
        chip(p.id_property, p.propertyName, p.propertyAddress, thumb(p), selectedId === p.id_property),
      )}
    </ScrollFade>
  );
}
