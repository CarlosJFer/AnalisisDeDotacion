const palette = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  backgroundLight: '#ffffff',
  backgroundDark: '#1e293b',
  textLight: '#0f172a',
  textDark: '#f8fafc',
  hoverLight: '#f1f5f9',
  hoverDark: '#475569',
};

const radii = {
  sm: 4,
  md: 8,
  lg: 12,
};

const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
};

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const theme = {
  palette,
  radii,
  shadows,
  typography,
  spacing,
};

export const modeVars = (isDarkMode) => ({
  '--bg-color': isDarkMode ? palette.backgroundDark : palette.backgroundLight,
  '--text-color': isDarkMode ? palette.textDark : palette.textLight,
  '--hover-color': isDarkMode ? palette.hoverDark : palette.hoverLight,
});

export { theme };
export default theme;

