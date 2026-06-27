import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Variant = 'forbidden' | 'not-found' | 'error';

type ErrorPanelProps = {
  variant?: Variant;
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

function PRESETS(t: (key: string) => string): Record<Variant, { title: string; message: string }> {
  return {
    forbidden: {
      title: t('errors.403.title'),
      message: t('errors.403.message'),
    },
    'not-found': {
      title: t('errors.404.title'),
      message: t('errors.404.message'),
    },
    error: {
      title: t('errors.generic.title'),
      message: t('errors.generic.message'),
    },
  };
}

function ErrorPanel({ variant = 'error', title, message, action }: ErrorPanelProps) {
  const { t } = useTranslation();
  const preset = PRESETS(t)[variant] || PRESETS(t).error;
  return (
    <div className="bg-surface border border-border rounded-radius py-[32px] px-[28px] max-w-[520px] mx-auto my-[40px] text-center">
      <h2 className="text-[1.3rem] font-semibold mb-2">{title || preset.title}</h2>
      <p className="text-text-muted mb-5">{message || preset.message}</p>
      {action ?? <Link to="/" className="inline-block text-brand-secondary no-underline text-[0.95rem]">{t('errors.backHome')}</Link>}
    </div>
  );
}

export default ErrorPanel;
