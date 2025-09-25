import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { DashboardCard } from "../ui";
import icons from "../ui/icons.js";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  getSeriesColor,
} from "../ui/chart-utils.jsx";

const CustomBarChart = React.memo(
  ({
    data,
    xKey,
    barKey,
    title,
    isDarkMode,
    height = 300,
    metric = "resumen",
    chipLabel,
  }) => {
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((s, d) => s + Number(d[barKey] || 0), 0),
      [chartData, barKey],
    );
    const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
    const Icon = icons[metric] || icons.resumen;
    const COLOR = useMemo(
      () => getSeriesColor(`${metric || "bar"}-${title || barKey || "value"}`, isDarkMode),
      [metric, title, barKey, isDarkMode],
    );

    // Margen derecho dinámico para dejar espacio a la etiqueta (porcentaje) a la derecha de las barras
    const maxVal = Math.max(0, ...chartData.map((d) => Number(d[barKey] || 0)));
    const maxPctText = formatPct((maxVal || 0) / (total || 1));
    const approxRight = maxPctText.length * 7 + 16; // 7px por char + pequeño padding
    const MARGIN_RIGHT = Math.max(80, Math.min(260, approxRight));

    return (
      <DashboardCard
        title={title}
        icon={<Icon />}
        isDarkMode={isDarkMode}
        headerRight={
          chipLabel && (
            <Chip
              label={chipLabel}
              size="small"
              variant="outlined"
              sx={{ borderColor: COLOR, color: COLOR }}
            />
          )
        }
      >
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: MARGIN_RIGHT, left: -10, bottom: xKey === "range" ? 40 : 80 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey={xKey}
                {...axisProps}
                angle={xKey === "range" ? 0 : -45}
                textAnchor={xKey === "range" ? "middle" : "end"}
                height={80}
                interval={0}
              />
              <YAxis {...axisProps} />
              <Tooltip
                {...tooltipProps}
                content={({ active, payload, label }) => (
                  <UnifiedTooltip
                    active={active}
                    payload={payload}
                    label={`${label}`}
                    dark={isDarkMode}
                  >
                    {payload?.length && (
                      <>
                        {barKey === "avgAge" ? (
                          <div>
                            Edad promedio: {Math.round(payload[0].value)} años
                          </div>
                        ) : (
                          <div>Cantidad: {formatMiles(payload[0].value)}</div>
                        )}
                        <div>
                          Porcentaje: {formatPct(
                            (payload[0].value || 0) / (total || 1),
                          )}
                        </div>
                      </>
                    )}
                  </UnifiedTooltip>
                )}
              />
              <Bar dataKey={barKey} fill={COLOR} radius={[4, 4, 0, 0]}>
                <LabelList
                  position="right"
                  dataKey={barKey}
                  content={(p) => (
                    <ValueLabel {...p} total={total} dark={isDarkMode} />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </DashboardCard>
    );
  },
);

export default CustomBarChart;
