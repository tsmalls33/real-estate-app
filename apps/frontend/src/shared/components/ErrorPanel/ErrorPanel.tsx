import React from 'react';
import { Link } from 'react-router-dom';

type Variant = 'forbidden' | 'not-found' | 'error';

const PRESETS: Record<Variant, { title: string; message: string }> = {
  forbidden: {
    title: '403 — Forbidden',
    message: "You don't have permission to view this resource.",
  },
  'not-found': {
    title: '404 — Not found',
    message: "We couldn't find what you were looking for.",
  },
  error: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

type ErrorPanelProps = {
  variant?: Variant;
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

function ErrorPanel({ variant = 'error', title, message, action }: ErrorPanelProps) {
  const preset = PRESETS[variant] || PRESETS.error;
  return (
    <div className="bg-surface border border-border rounded-radius py-[32px] px-[28px] max-w-[520px] mx-auto my-[40px] text-center">
      <h2 className="text-[1.3rem] font-semibold mb-2">{title || preset.title}</h2>
      <p className="text-text-muted mb-5">{message || preset.message}</p>
      {action ?? <Link to="/" className="inline-block text-brand-secondary no-underline text-[0.95rem]">Back home</Link>}
    </div>
  );
}

export default ErrorPanel;
