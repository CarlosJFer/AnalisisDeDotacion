import React from "react";

export const nf = new Intl.NumberFormat("es-AR");
export const formatMiles = (n: number) => nf.format(n);
export const formatPct = (p: number, d = 1) =>
  `${(p * 100).toFixed(d).replace(".", ",")}%`;

export const isDark = () =>
  document.documentElement.classList.contains("dark");

const RIGHT_PAD = 8;

/** Label “valor (porcentaje)” SIEMPRE afuera a la derecha */
// Props laxas para renderers de Recharts (labels/tooltips)
type RechartsLabelProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
  viewBox?: { width?: number; height?: number; x?: number; y?: number };
  payload?: any;
  total?: number;
};

export const ValueLabel: React.FC<RechartsLabelProps> = (p) => {
  const { x = 0, y = 0, width = 0, value = 0, viewBox, total = 1 } = p;
  const chartW = viewBox?.width ?? 0;
  const text = `${formatMiles(Number(value))} (${formatPct(Number(value) / Number(total || 1))})`;
  const approx = text.length * 7;
  const xText = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const dark = isDark();
  const color = dark ? '#ffffff' : '#0f172a';
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600">
      {text}
    </text>
  );
};

/** Label “Edad promedio: X años” afuera a la derecha (lee avg del payload) */
export const AvgAgeLabel: React.FC<RechartsLabelProps> = (p) => {
  const { x = 0, y = 0, width = 0, viewBox, payload } = p;
  const avg = Math.round(Number(payload?.avg ?? payload?.promedio ?? 0));
  if (!avg) return null;
  const chartW = viewBox?.width ?? 0;
  const text = `Edad promedio: ${avg} años`;
  const approx = text.length * 7;
  const xText = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const dark = isDark();
  const color = dark ? '#ffffff' : '#0f172a';
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600">
      {text}
    </text>
  );
};

/** Tooltip unificado (oscuro/claro) */
export const UnifiedTooltip: React.FC<{active?:boolean; payload?:any[]; label?:string; children?:React.ReactNode; dark?: boolean}> =
({ active, payload, label, children, dark }) => {
  if (!active || !payload?.length) return null;
  const isDarkTheme = typeof dark === 'boolean' ? dark : isDark();
  const bg = isDarkTheme ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const fg = isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
  const bd = isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)';
  const shadow = isDarkTheme ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)';
  return (
    <div
      style={{
        background: bg,
        border: bd,
        color: fg,
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: shadow,
        minWidth: 220,
      }}
    >
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
      {children}
    </div>
  );
};

/** Props básicos para ejes X/Y según tema */
export const axisProps = (dark: boolean) => ({
  tick: { fill: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' },
  axisLine: { stroke: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' },
});

/** Props base para rejilla cartesiana */
export const gridProps = (dark: boolean) => ({
  horizontal: false,
  strokeDasharray: '0 0',
  stroke: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
});

/** Tooltip estándar con cantidad y porcentaje */
export const defaultTooltip = (
  dark: boolean,
  total: number,
  labelFormatter: (label: any) => string
) =>
  ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: any }) => (
    <UnifiedTooltip
      active={active}
      payload={payload}
      dark={dark}
      label={labelFormatter(label)}
    >
      {payload?.length && (
        <>
          <div>Cantidad de agentes: {formatMiles(payload[0].value)}</div>
          <div>Porcentaje: {formatPct(total ? payload[0].value / total : 0)}</div>
        </>
      )}
    </UnifiedTooltip>
  );
