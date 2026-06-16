import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPanel.css';

const PRESETS = {
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

function ErrorPanel({ variant = 'error', title, message, action }) {
  const preset = PRESETS[variant] || PRESETS.error;
  return (
    <div className="error-panel">
      <h2>{title || preset.title}</h2>
      <p>{message || preset.message}</p>
      {action ?? <Link to="/" className="error-panel-link">Back home</Link>}
    </div>
  );
}

export default ErrorPanel;
