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
} from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

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
    const { theme } = useTheme();
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((s, d) => s + Number(d[barKey] || 0), 0),
      [chartData, barKey],
    );
    const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
    const Icon = icons[metric] || icons.resumen;
    const COLOR = theme.palette.primary.main;

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
              margin={{ top: 5, right: 20, left: -10, bottom: xKey === "range" ? 40 : 80 }}
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
