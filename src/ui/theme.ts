/**
 * Centralized Aura Design Tokens
 * Modeled after the warm editorial aesthetic in aura.html
 * Compliance: RULES.md § 5 (No Hardcoded UI — Centralized Design Schema)
 */

export const THEME = {
  colors: {
    bg: '#F7F5F0',
    bgAlt: '#FBF9F5',
    card: '#FFFFFF',
    well: '#F2EFEB',
    wellBorder: 'rgba(44, 40, 37, 0.08)',
    border: 'rgba(44, 40, 37, 0.10)',
    borderSubtle: 'rgba(44, 40, 37, 0.05)',
    text: '#2C2825',
    textMuted: 'rgba(44, 40, 37, 0.58)',
    textFaint: 'rgba(44, 40, 37, 0.35)',
    accent: '#C27A63',
    accentHover: '#B06852',
    accentSoft: 'rgba(194, 122, 99, 0.10)',
    accentBorder: 'rgba(194, 122, 99, 0.30)',
    success: '#2E7D52',
    successSoft: 'rgba(46, 125, 82, 0.10)',
    warning: '#C47D1C',
    warningSoft: 'rgba(196, 125, 28, 0.10)',
    error: '#D94436',
    errorSoft: 'rgba(217, 68, 54, 0.10)',
    sceneBgHex: 0xf7f5f0,
  },
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    trackingTight: '-0.02em',
    trackingNormal: '0em',
    trackingWide: '0.06em',
    trackingWidest: '0.12em',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    pill: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(44, 40, 37, 0.04), 0 1px 2px rgba(44, 40, 37, 0.02)',
    md: '0 4px 16px -2px rgba(44, 40, 37, 0.06), 0 2px 4px -1px rgba(44, 40, 37, 0.03)',
    lg: '0 12px 32px -4px rgba(44, 40, 37, 0.08), 0 4px 8px -2px rgba(44, 40, 37, 0.04)',
  },
  transitions: {
    fast: '120ms ease',
    normal: '200ms ease',
  },
} as const;

export type Theme = typeof THEME;
