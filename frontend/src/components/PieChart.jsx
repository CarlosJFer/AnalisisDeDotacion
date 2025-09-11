import React from "react";
import { Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "./ui/DashboardCard.jsx";
import { rechartsCommon, UnifiedTooltip, theme, icons } from "../ui";

const CustomPieChart = ({ data, dataKey, nameKey, title, isDarkMode }) => {
  const { tooltipProps, colors } = rechartsCommon(isDarkMode);
  const palette = [
    theme.palette.primary,
    theme.palette.primaryLight,
    theme.palette.primaryHover,
  ];

  return (
    <DashboardCard
      title={title}
      icon={<icons.porcentaje />}
      isDarkMode={isDarkMode}
    >
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={palette[index % palette.length] || theme.palette.primary}
                />
              ))}
            </Pie>
            <Tooltip
              {...tooltipProps}
              content={({ active, payload, label }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  dark={isDarkMode}
                >
                  {payload?.map((item, idx) => (
                    <div key={idx} style={{ color: item.color }}>
                      {`${item.name}: ${item.value}`}
                    </div>
                  ))}
                </UnifiedTooltip>
              )}
            />
            <Legend
              wrapperStyle={{ color: colors.tooltipText, fontSize: "12px" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};

export default CustomPieChart;
