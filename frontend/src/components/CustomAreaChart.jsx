import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  AreaChart,
  Area,
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
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  formatPct,
} from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const CustomAreaChart = React.memo(
  ({
    data,
    title,
    isDarkMode,
    xKey,
    yKey,
    metric = "resumen",
    chipLabel,
  }) => {
    const { theme } = useTheme();
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((s, d) => s + Number(d[yKey] || 0), 0),
      [chartData, yKey],
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
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
            >
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey={xKey}
                {...axisProps}
                angle={-45}
                textAnchor="end"
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
                        <div>
                          Edad promedio: {Math.round(payload[0].value)} años
                        </div>
                        <div>
                          Porcentaje: {formatPct((payload[0].value || 0) / (total || 1))}
                        </div>
                      </>
                    )}
                  </UnifiedTooltip>
                )}
              />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={COLOR}
                fillOpacity={1}
                fill="url(#areaColor)"
                strokeWidth={2}
                name="Edad promedio"
              >
                <LabelList
                  dataKey={yKey}
                  content={(p) => (
                    <ValueLabel {...p} total={total} dark={isDarkMode} />
                  )}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </DashboardCard>
    );
  },
);

export default CustomAreaChart;
