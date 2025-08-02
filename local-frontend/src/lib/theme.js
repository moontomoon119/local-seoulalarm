// src/lib/theme.js

const theme = {
  colors: {
    primary: '#4FC3F7',
    primaryLight: '#0A1929',
    primaryDark: '#90CAF9',
    accent: '#29B6F6',
    background: '#121212',
    cardBg: '#1E1E1E',
    border: '#333333',
    textPrimary: '#E0E0E0',
    textSecondary: '#9E9E9E',
    error: '#D32F2F',
    success: '#388E3C'
  },
  fonts: {
    main: '"Noto Sans KR", sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
  },
  transitions: {
    fast: 'all 0.2s ease',
    normal: 'all 0.3s ease',
  }
};

export default theme; 