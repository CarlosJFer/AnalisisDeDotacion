import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DashboardCard,
  icons,
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  generateColorScale,
} from "../ui";

// Etiqueta personalizada: muestra el porcentaje dentro de cada sector
const RADIAN = Math.PI / 180;
const makeDonutLabel = (color) =>
  ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

const CustomDonutChart = React.memo(
  ({
    data,
    title,
    isDarkMode,
    dataKey,
    nameKey,
    height = 400,
    metric = "resumen",
    chipLabel,
  }) => {
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0),
      [chartData, dataKey],
    );
    const { tooltipProps } = rechartsCommon(isDarkMode);
    const Icon = icons[metric] || icons.resumen;
    const paletteSeed = `${metric || "donut"}-${title || nameKey || dataKey || "series"}`;
    const palette = useMemo(
      () => generateColorScale(Math.max(chartData.length || 1, 1), paletteSeed, isDarkMode),
      [chartData.length, paletteSeed, isDarkMode],
    );
    const accent = palette[0];

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
              sx={{ borderColor: accent, color: accent }}
            />
          )
        }
      >
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                label={makeDonutLabel(isDarkMode ? "#ffffff" : "#0f172a")}
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill={accent}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipProps}
                content={({ active, payload }) => (
                  <UnifiedTooltip
                    active={active}
                    payload={payload}
                    dark={isDarkMode}
                  >
                    {payload?.length && (
                      <>
                        <div>{payload[0].payload[nameKey]}</div>
                        <div>
                          Cantidad: {formatMiles(payload[0].payload[dataKey])}
                        </div>
                        <div>
                          Porcentaje:{" "}
                          {formatPct(
                            (payload[0].payload[dataKey] || 0) / (total || 1),
                          )}
                        </div>
                      </>
                    )}
                  </UnifiedTooltip>
                )}
              />
              <Legend
                wrapperStyle={{
                  color: tooltipProps.wrapperStyle.color,
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </DashboardCard>
    );
  },
);

export default CustomDonutChart;
