import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useTheme as useAppTheme } from "../context/ThemeContext";
import DashboardCard from "./ui/DashboardCard.jsx";
import icons from "../ui/icons.js";
import { rechartsCommon, UnifiedTooltip, modeVars } from "../ui";

const HistogramWidget = ({ data, xKey, barKey, color }) => {
  const { isDarkMode, theme } = useAppTheme();
  const vars = modeVars(isDarkMode);
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
  const barColor = color || theme.palette.primary.main;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <DashboardCard
        title="Histograma"
        icon={<icons.analitica />}
        isDarkMode={isDarkMode}
      >
        <Box
          sx={{
            ...vars,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No hay datos de histograma disponibles
          </Typography>
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Histograma"
      icon={<icons.analitica />}
      isDarkMode={isDarkMode}
    >
      <Box sx={{ ...vars, width: "100%", height: "100%", minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...gridProps} strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              {...axisProps}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              {...axisProps}
              label={{
                value: "Frecuencia",
                angle: -90,
                position: "insideLeft",
                fill: axisProps.tick.fill,
              }}
            />
            <Tooltip
              {...tooltipProps}
              content={({ active, payload, label }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  dark={isDarkMode}
                >
                  {payload?.length && (
                    <div style={{ color: barColor }}>
                      Frecuencia: {payload[0].value}
                    </div>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey={barKey} fill={barColor} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};

export default HistogramWidget;
