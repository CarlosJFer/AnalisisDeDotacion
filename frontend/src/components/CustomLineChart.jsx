import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  LineChart,
  Line,
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
} from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const CustomLineChart = React.memo(
  ({
    data,
    xKey,
    yKey,
    title,
    isDarkMode,
    height = 300,
    metric = "resumen",
    chipLabel,
  }) => {
    const { theme } = useTheme();
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((sum, item) => sum + Number(item[yKey] || 0), 0),
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
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 24, left: 8, bottom: 80 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey={xKey}
                {...axisProps}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis {...axisProps} allowDecimals={false} />
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
                        <div>Cantidad: {formatMiles(payload[0].value || 0)}</div>
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
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={COLOR}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: COLOR }}
                activeDot={{ r: 7 }}
              >
                <LabelList
                  dataKey={yKey}
                  position="top"
                  formatter={(value) => formatMiles(value)}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </DashboardCard>
    );
  },
);

export default CustomLineChart;
