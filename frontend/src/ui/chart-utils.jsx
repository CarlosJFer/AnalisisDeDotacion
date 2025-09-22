import React from "react";

/**
 * Utilidades de formato y estilo para gráficos construidos con Recharts.
 *
 * La función `rechartsCommon()` provee estilos y colores estandarizados
 * para ejes, grillas y tooltips dependiendo del modo oscuro/claro. Estos
 * valores se pueden utilizar directamente en los componentes de Recharts
 * para mantener una apariencia coherente:
 *
 * ```tsx
 * const { axisProps, gridProps, tooltipProps } = rechartsCommon();
 * <XAxis {...axisProps} />
 * <CartesianGrid {...gridProps} />
 * <Tooltip {...tooltipProps} content={<UnifiedTooltip />} />
 * ```
 */

export const nf = new Intl.NumberFormat("es-AR");

/** Formatea números con separador de miles. */
export const formatMiles = (n) => nf.format(n);

/** Formatea porcentajes con `d` decimales. */
export const formatPct = (p, d = 1) =>
  `${(p * 100).toFixed(d).replace(".", ",")}%`;

export const isDark = () => document.documentElement.classList.contains("dark");

export const axisStyle = (dark) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  const tickColor = isDarkTheme ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const lineColor = isDarkTheme ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  return {
    axisLine: { stroke: lineColor },
    tick: { fill: tickColor, fontSize: 12 },
  };
};

export const gridStyle = (dark) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  return {
    stroke: isDarkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
  };
};

export const tooltipStyle = (dark) => {
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  return {
    background: isDarkTheme
      ? "rgba(45, 55, 72, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    color: isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
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
  };
};

/**
 * Propiedades comunes para Recharts y paleta de colores derivada.
 */
export const rechartsCommon = (dark) => {
  const axisProps = axisStyle(dark);
  const gridProps = gridStyle(dark);
  const tooltipProps = { wrapperStyle: tooltipStyle(dark) };
  const colors = {
    tick: axisProps.tick.fill,
    axisLine: axisProps.axisLine.stroke,
    grid: gridProps.stroke,
    tooltipBg: tooltipProps.wrapperStyle.background,
    tooltipText: tooltipProps.wrapperStyle.color,
  };
  return { axisProps, gridProps, tooltipProps, colors };
};

const RIGHT_PAD = 8;
// Compute a robust chart width for label positioning.
// Recent Recharts versions sometimes pass viewBox.width as 0/undefined in Label/LabelList.
// If width is not usable, avoid right-clipping by falling back to Infinity
// and place the label to the right of the bar using x + width + RIGHT_PAD.
const getChartWidth = (viewBox) => {
  if (!viewBox) return Infinity;
  const w = typeof viewBox.width === "number" ? viewBox.width : undefined;
  if (typeof w === "number" && w > 0) return w;
  const x = typeof viewBox.x === "number" ? viewBox.x : 0;
  const sum = x + (typeof w === "number" ? w : 0);
  if (sum > 0) return sum;
  return Infinity;
};

/** Label de porcentaje SIEMPRE afuera a la derecha */
// Props laxas para renderers de Recharts (labels/tooltips)

export const ValueLabel = (p) => {
  const { x = 0, y = 0, width = 0, value = 0, viewBox, total = 1, dark } = p;
  const chartW = getChartWidth(viewBox);
  const pct = Number(value) / Number(total || 1);
  const pctText = formatPct(pct);
  const approx = pctText.length * 7;
  // Prefer x computed by Recharts when available (LabelList position="right").
  const givenX = Number.isFinite(x) ? x : undefined;
  const barRight = Number.isFinite(x) && Number.isFinite(width) ? x + width + RIGHT_PAD : undefined;
  const vbRight = Number.isFinite(viewBox?.x) && Number.isFinite(viewBox?.width)
    ? viewBox.x + viewBox.width + RIGHT_PAD
    : undefined;
  const xBase = (givenX ?? barRight ?? vbRight ?? (Number.isFinite(x) ? x + RIGHT_PAD : 0));
  const xText = givenX !== undefined ? xBase : Math.min(xBase, chartW - approx - 4);
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  const color = isDarkTheme ? "#ffffff" : "#0f172a";
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600" textAnchor="start">
      {pctText}
    </text>
  );
};

/**
 * Etiqueta personalizada que muestra la edad promedio y la cantidad
 * correspondiente a cada barra. Se posiciona fuera de la barra,
 * alineada a la derecha, similar a {@link ValueLabel}.
 */
export const AgeCountLabel = (p) => {
  const { x = 0, y = 0, width = 0, viewBox, payload = {}, dark } = p;
  const chartW = getChartWidth(viewBox);
  const edad = Math.round(payload.avg ?? payload.promedio ?? 0);
  const cantidad = Number(payload.cantidad ?? 0);
  const text = `${edad} años · ${formatMiles(cantidad)}`;
  const approx = text.length * 7;
  const givenX = Number.isFinite(x) ? x : undefined;
  const barRight = Number.isFinite(x) && Number.isFinite(width) ? x + width + RIGHT_PAD : undefined;
  const vbRight = Number.isFinite(viewBox?.x) && Number.isFinite(viewBox?.width)
    ? viewBox.x + viewBox.width + RIGHT_PAD
    : undefined;
  const xBase = (givenX ?? barRight ?? vbRight ?? (Number.isFinite(x) ? x + RIGHT_PAD : 0));
  const xText = givenX !== undefined ? xBase : Math.min(xBase, chartW - approx - 4);
  const isDarkTheme = typeof dark === "boolean" ? dark : isDark();
  const color = isDarkTheme ? "#ffffff" : "#0f172a";
  return (
    <text x={xText} y={y + 4} fill={color} fontWeight="600" textAnchor="start">
      {text}
    </text>
  );
};

/** Tooltip unificado (oscuro/claro) */
export const UnifiedTooltip = ({ active, payload, label, children, dark, style }) => {
  if (!active || !payload?.length) return null;
  const styles = style || tooltipStyle(dark);
  return (
    <div style={styles}>
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
      {children}
    </div>
  );
};
