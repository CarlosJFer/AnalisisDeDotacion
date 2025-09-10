import React from "react";

/**
 * Utilidades de formato y estilo para los componentes de gráficos.
 *
 * `axisStyle(dark)`, `gridStyle(dark)` y `tooltipStyle(dark)` retornan
 * objetos con los colores y tipografías estándar según el modo oscuro o
 * claro.  Se pueden usar en los componentes de Recharts para mantener
 * una apariencia consistente:
 *
 *   <XAxis {...axisStyle()} />
 *   <CartesianGrid {...gridStyle()} />
 *   <Tooltip wrapperStyle={tooltipStyle()} content={<UnifiedTooltip />} />
 */

export const nf = new Intl.NumberFormat("es-AR");
export const formatMiles = (n: number) => nf.format(n);
export const formatPct = (p: number, d = 1) =>
  `${(p * 100).toFixed(d).replace(".", ",")}%`;

export const isDark = () =>
  document.documentElement.classList.contains("dark");

export const axisStyle = (dark?: boolean) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  const tickColor = isDarkTheme
    ? "rgba(255,255,255,0.7)"
    : "rgba(0,0,0,0.7)";
  const lineColor = isDarkTheme
    ? "rgba(255,255,255,0.3)"
    : "rgba(0,0,0,0.3)";
  return {
    axisLine: { stroke: lineColor },
    tick: { fill: tickColor, fontSize: 12 },
  };
};

export const gridStyle = (dark?: boolean) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  return {
    stroke: isDarkTheme
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.1)",
  };
};

export const tooltipStyle = (dark?: boolean) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  return {
    background: isDarkTheme
      ? "rgba(45, 55, 72, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    color: isDarkTheme
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(0, 0, 0, 0.8)",
    border: isDarkTheme
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    padding: "10px 12px",
    boxShadow: isDarkTheme
      ? "0 12px 40px rgba(0,0,0,0.4)"
      : "0 12px 40px rgba(0,0,0,0.15)",
    minWidth: 220,
    fontSize: 14,
  } as React.CSSProperties;
};

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
  dark?: boolean;
};

export const ValueLabel: React.FC<RechartsLabelProps> = (p) => {
  const { x = 0, y = 0, width = 0, value = 0, viewBox, total = 1, dark } = p;
  const chartW = viewBox?.width ?? 0;
  const text = `${formatMiles(Number(value))} (${formatPct(Number(value) / Number(total || 1))})`;
  const approx = text.length * 7;
  const xText = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const isDarkTheme = typeof dark === 'boolean' ? dark : isDark();
  const color = isDarkTheme ? '#ffffff' : '#0f172a';
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600">
      {text}
    </text>
  );
};

/** Label “Edad promedio: X años” afuera a la derecha (lee avg del payload) */
export const AvgAgeLabel: React.FC<RechartsLabelProps> = (p) => {
  const { x = 0, y = 0, width = 0, viewBox, payload, dark } = p;
  const avg = Math.round(Number(payload?.avg ?? payload?.promedio ?? 0));
  if (!avg) return null;
  const chartW = viewBox?.width ?? 0;
  const text = `Edad promedio: ${avg} años`;
  const approx = text.length * 7;
  const xText = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const isDarkTheme = typeof dark === 'boolean' ? dark : isDark();
  const color = isDarkTheme ? '#ffffff' : '#0f172a';
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600">
      {text}
    </text>
  );
};

/** Tooltip unificado (oscuro/claro) */
export const UnifiedTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  children?: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ active, payload, label, children, dark, style }) => {
  if (!active || !payload?.length) return null;
  const styles = style || tooltipStyle(dark);
  return (
    <div style={styles}>
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
      {children}
    </div>
  );
};

export const axisStyle = (dark: boolean) => ({
  tick: { fill: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: 12 },
  axisLine: { stroke: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }
});

export const gridStyle = (dark: boolean) => ({
  strokeDasharray: '0 0',
  stroke: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
});
