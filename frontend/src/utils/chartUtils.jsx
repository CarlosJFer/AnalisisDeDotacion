import React from 'react';

export const nf = new Intl.NumberFormat('es-AR');
export const formatMiles = (n) => nf.format(n);
export const formatPct = (p, d = 1) => `${(p * 100).toFixed(d).replace('.', ',')}%`;
export const isDark = () => document.documentElement.classList.contains('dark');
export const RIGHT_PAD = 8;

export const ValueLabel = (p) => {
  const { x = 0, y = 0, width = 0, value = 0, viewBox, total } = p;
  const chartW = viewBox?.width ?? 0;
  const text = `${formatMiles(value)} (${formatPct(value / (total || 1))})`;
  const approx = text.length * 7;
  const textX = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const fill = isDark() ? '#fff' : '#0f172a';
  return (
    <text x={textX} y={y} dy={4} fontSize={12} textAnchor="start" fill={fill}>
      {text}
    </text>
  );
};

export const AvgAgeLabel = (p) => {
  const { x = 0, y = 0, width = 0, viewBox, avg = 0 } = p;
  if (!avg) return null;
  const chartW = viewBox?.width ?? 0;
  const text = `Edad promedio: ${Math.round(avg)} años`;
  const approx = text.length * 7;
  const textX = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const fill = isDark() ? '#fff' : '#0f172a';
  return (
    <text x={textX} y={y} dy={4} fontSize={12} textAnchor="start" fill={fill}>
      {text}
    </text>
  );
};

export const UnifiedTooltip = ({ active, payload, label, children }) => {
  if (!active || !payload?.length) return null;
  const bg = isDark() ? '#0b1220' : '#ffffff';
  const fg = isDark() ? '#e2e8f0' : '#0f172a';
  const bd = isDark() ? '#334155' : '#cbd5e1';
  return (
    <div
      style={{
        background: bg,
        color: fg,
        border: `1px solid ${bd}`,
        borderRadius: 10,
        padding: '10px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
        minWidth: 240,
      }}
    >
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
      {children}
    </div>
  );
};
