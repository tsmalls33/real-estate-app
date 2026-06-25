/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        brand: {
          primary: 'var(--brand-primary)',
          'primary-soft': 'var(--brand-primary-soft)',
          'primary-tint': 'var(--brand-primary-tint)',
          secondary: 'var(--brand-secondary)',
          'secondary-soft': 'var(--brand-secondary-soft)',
          'secondary-tint': 'var(--brand-secondary-tint)',
        },
        'brand-on-primary': 'var(--brand-on-primary)',
        'brand-on-secondary': 'var(--brand-on-secondary)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        info: 'var(--info)',
        hover: 'var(--hover)',
      },
      borderRadius: {
        radius: 'var(--radius)',
        'radius-sm': 'var(--radius-sm)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
};
