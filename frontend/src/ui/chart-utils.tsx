import React from "react";

export const nf = new Intl.NumberFormat("es-AR");
export const formatMiles = (n: number) => nf.format(n);
export const formatPct = (p: number, d = 1) =>
  `${(p * 100).toFixed(d).replace(".", ",")}%`;

export const isDark = () =>
  document.documentElement.classList.contains("dark");

const RIGHT_PAD = 8;

/** Label “valor (porcentaje)” SIEMPRE afuera a la derecha */
export const ValueLabel: React.FC<{ total: number }> = (p) => {
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
export const AvgAgeLabel: React.FC = (p) => {
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
export const UnifiedTooltip: React.FC<{active?:boolean; payload?:any[]; label?:string; children?:React.ReactNode}> =
({ active, payload, label, children }) => {
  if (!active || !payload?.length) return null;
  const bg = isDark()? "#0b1220" : "#ffffff";
  const fg = isDark()? "#e2e8f0" : "#0f172a";
  const bd = isDark()? "#334155" : "#cbd5e1";
  return (
    <div style={{
      background:bg, color:fg, border:`1px solid ${bd}`,
      borderRadius:10, padding:"10px 12px",
      boxShadow:"0 4px 16px rgba(0,0,0,.25)", minWidth:240
    }}>
      {label && <div style={{ fontWeight:600, marginBottom:6 }}>{label}</div>}
      {children}
    </div>
  );
};
