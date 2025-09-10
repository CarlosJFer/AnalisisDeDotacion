import chartColors from './theme/chartColors.js';

export const getPalette = (isDark) => {
  const scheme = chartColors[isDark ? 'dark' : 'light'];
  return {
    primary: scheme.palette[0],
    secondary: scheme.palette[1],
    ...scheme,
  };
};

export default getPalette;