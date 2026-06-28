/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Responsive is DESKTOP-FIRST: base classes target desktop, and these
      // max-width breakpoints layer mobile overrides on top (e.g.
      // `max-card:grid-cols-1`). Adjust a threshold here and every usage
      // follows. Do not introduce mobile-first min-width `sm:`/`md:` — it
      // fights the desktop base classes. See frontend CLAUDE.md → Responsive.
      screens: {
        'max-admin':  { max: '899px' }, // admin shell: sidebar → off-canvas drawer
        'max-client': { max: '699px' }, // client shell: topbar → off-canvas drawer
        'max-card':   { max: '599px' }, // cards/forms: grids → 1 col, labels stack, rows wrap
      },
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
