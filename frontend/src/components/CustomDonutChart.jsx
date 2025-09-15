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
  theme,
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
} from "../ui";

// Etiqueta personalizada: muestra el porcentaje dentro de cada sector
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
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
    const COLOR = theme.palette.primary;
    const colorKeys = useMemo(
      () =>
        Object.keys(theme.palette).filter(
          (k) =>
            !k.startsWith("background") &&
            !k.startsWith("text") &&
            !k.includes("hover"),
        ),
      [],
    );

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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                label={renderCustomizedLabel}
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill={COLOR}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      theme.palette[
                        colorKeys[index % colorKeys.length] || "primary"
                      ]
                    }
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
