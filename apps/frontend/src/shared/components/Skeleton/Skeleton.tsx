import { useTranslation } from 'react-i18next';

type Props = {
  className?: string;
  count?: number;
};

export default function Skeleton({ className, count = 1 }: Props) {
  const { t } = useTranslation();
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton ${className ?? ''}`} role="status" aria-label={t('common.loading')} />
      ))}
    </>
  );
}
