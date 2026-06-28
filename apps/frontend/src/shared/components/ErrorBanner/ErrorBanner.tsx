import { useTranslation } from 'react-i18next';

type Variant = 'error' | 'warning' | 'info';

type Props = {
  message: string;
  variant?: Variant;
  onDismiss?: () => void;
};

const BORDER: Record<Variant, string> = {
  error: 'border-danger text-danger',
  warning: 'border-warning text-warning',
  info: 'border-info text-info',
};

const BG: Record<Variant, string> = {
  error: 'bg-danger-soft',
  warning: 'bg-warning/10',
  info: 'bg-info/10',
};

export default function ErrorBanner({ message, variant = 'error', onDismiss }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 px-3 py-2 rounded-radius-sm text-[13px] ${BG[variant]} border-l-[3px] ${BORDER[variant]}`}
    >
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="bg-transparent border-0 cursor-pointer opacity-60 hover:opacity-100 p-0 leading-none"
          aria-label={t('common.close')}
        >
          &times;
        </button>
      )}
    </div>
  );
}
