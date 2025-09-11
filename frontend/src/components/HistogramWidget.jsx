import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Box, Typography } from "@mui/material";
import {
  DashboardCard,
  icons,
  UnifiedTooltip,
  modeVars,
  PaginationControls,
  rechartsCommon,
  ValueLabel,
  theme,
} from "../ui";

const HistogramWidget = ({ data, xKey, barKey, color, isDarkMode }) => {
  const vars = modeVars(isDarkMode);
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
  const chartData = useMemo(() => data || [], [data]);
  const [page, setPage] = useState(0);
  const PAGE = 20;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );
  const grandTotal = useMemo(
    () => chartData.reduce((s, d) => s + (Number(d[barKey]) || 0), 0),
    [chartData, barKey],
  );
  const barColor = color || theme.palette.primary;

  if (!chartData.length) {
    return (
      <DashboardCard
        title="Histograma"
        icon={<icons.contratos />}
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
      icon={<icons.contratos />}
      isDarkMode={isDarkMode}
    >
      <Box sx={{ ...vars, width: "100%", height: "100%", minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...gridProps} />
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
            <Bar dataKey={barKey} fill={barColor} radius={[2, 2, 0, 0]}>
              <LabelList
                dataKey={barKey}
                content={(p) => (
                  <ValueLabel {...p} total={grandTotal} dark={isDarkMode} />
                )}
              />
            </Bar>
          </BarChart>
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

export default HistogramWidget;
