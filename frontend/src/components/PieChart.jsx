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
import {
  DashboardCard,
  PaginationControls,
  rechartsCommon,
  UnifiedTooltip,
  ValueLabel,
  theme,
  formatMiles,
  formatPct,
} from "../ui";
import icons from "../ui/icons.js";

const CustomPieChart = ({ data, dataKey, nameKey, title, isDarkMode }) => {
  const { tooltipProps, colors } = rechartsCommon(isDarkMode);

  const chartData = React.useMemo(
    () => (data || []).sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0)),
    [data, dataKey],
  );

  const grandTotal = React.useMemo(
    () => chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0),
    [chartData, dataKey],
  );

  const [page, setPage] = React.useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = React.useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );

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
              data={pageData}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              <LabelList
                dataKey={dataKey}
                content={(p) => (
                  <ValueLabel
                    {...p}
                    total={grandTotal}
                    dark={isDarkMode}
                  />
                )}
              />
              {pageData.map((entry, index) => (
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
                        (item.value || 0) / (grandTotal || 1),
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
      {chartData.length > PAGE && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      )}
    </DashboardCard>
  );
};

export default CustomPieChart;
