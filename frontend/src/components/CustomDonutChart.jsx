import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { DashboardCard, icons } from "../ui";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
} from "../ui/chart-utils";
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
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];

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
                outerRadius={100}
                innerRadius={60}
                fill={COLOR}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
                <LabelList
                  dataKey={dataKey}
                  content={(p) => (
                    <ValueLabel {...p} total={total} dark={isDarkMode} />
                  )}
                />
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
