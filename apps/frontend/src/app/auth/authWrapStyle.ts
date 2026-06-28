// Pre-login the user/tenant is unknown — auth always renders on a fixed,
// neutral-dark platform palette. Locally re-declared vars defeat any stale
// tenant vars left inline on :root and the [data-theme] neutral block.
export const authWrapStyle = {
  '--bg': '#0E1116',
  '--surface': '#161A21',
  '--surface-2': '#0E1116',
  '--border': '#262B34',
  '--border-strong': '#2C323C',
  '--text': '#E6E9EF',
  '--text-muted': '#8B93A1',
  '--text-faint': '#5B626D',
  '--brand-primary': '#5B68E0',
  '--brand-primary-soft': 'rgba(91, 104, 224, 0.20)',
  '--brand-on-primary': '#FFFFFF',
  '--focus-ring': '#8AB4FF',
  '--danger': '#E5707A',
  '--shadow-md': '0 18px 44px rgba(0, 0, 0, 0.5)',
  background:
    'radial-gradient(1200px 600px at 80% -10%, var(--brand-primary-soft), transparent 60%), var(--surface-2)',
} as React.CSSProperties;
