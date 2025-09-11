import React from "react";
import { Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { DashboardCard, rechartsCommon, UnifiedTooltip, theme, formatMiles, formatPct } from "../ui";
import icons from "../ui/icons.js";

const CustomPieChart = ({ data, dataKey, nameKey, title, isDarkMode }) => {
  const { tooltipProps, colors } = rechartsCommon(isDarkMode);
  const total = React.useMemo(
    () => (data || []).reduce((sum, item) => sum + (item[dataKey] || 0), 0),
    [data, dataKey],
  );
  const palette = [
    theme.palette.primary,
    theme.palette.primaryLight,
    theme.palette.primaryHover,
  ];
  const renderLabel = ({ value }) =>
    formatPct((value || 0) / (total || 1));

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
              >
                <LabelList content={renderLabel} />
                {(data || []).map((entry, index) => (
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
                        {`${item.name}: ${formatMiles(item.value)} (${formatPct(
                          (item.value || 0) / (total || 1),
                        )})`}
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
