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
import DashboardCard from "./ui/DashboardCard.jsx";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
} from "../ui/chart-utils";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";

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
    const { theme } = useTheme();
    const chartData = useMemo(() => data || [], [data]);
    const total = useMemo(
      () => chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0),
      [chartData, dataKey],
    );
    const { tooltipProps } = rechartsCommon(isDarkMode);
    const Icon = icons[metric] || icons.resumen;
    const COLOR = theme.palette.primary.main;
    const COLORS = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.light,
      theme.palette.warning.light,
      theme.palette.error.light,
      theme.palette.info.light,
    ];

    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      value,
    }) => {
      if (percent < 0.05) return null;

      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill={theme.palette.text.primary}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize="12"
          fontWeight="600"
        >
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      );
    };

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
        style={{ height }}
      >
        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={60}
                fill={COLOR}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                {...tooltipProps}
                content={({ active, payload }) => (
                  <UnifiedTooltip active={active} payload={payload} dark={isDarkMode}>
                    {payload?.length && (
                      <>
                        <div>{payload[0].payload[nameKey]}</div>
                        <div>Cantidad: {formatMiles(payload[0].payload[dataKey])}</div>
                        <div>
                          Porcentaje: {formatPct(
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
