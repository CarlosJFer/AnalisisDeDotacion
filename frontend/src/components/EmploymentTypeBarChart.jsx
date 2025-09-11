import React, { useMemo } from "react";
import { Typography, Box, Chip } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import DashboardCard from "./ui/DashboardCard.jsx";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  icons,
  theme,
} from "../ui";

const EmploymentTypeBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((d) => ({
        tipo: (d.type ?? "").toString().trim() || "Sin especificar",
        cantidad: Number(d.count || 0),
      })),
    [data],
  );
  const total = useMemo(
    () => chartData.reduce((s, d) => s + (d.cantidad || 0), 0),
    [chartData],
  );

  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
  const primary = theme.palette.primary;
  const hover = theme.palette.primaryHover;

  return (
    <DashboardCard
      title="Agentes por Situación de Revista"
      icon={<icons.contratos />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip
          label="Situación"
          size="small"
          variant="outlined"
          sx={{ borderColor: primary, color: primary }}
        />
      }
    >
      <Typography
        variant="body2"
        align="center"
        sx={{
          mb: 2,
          color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
        }}
      >
        {chartData.length} categorías • {formatMiles(total)} agentes
      </Typography>
      <Box sx={{ height: Math.max(320, chartData.length * 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 16, right: 160, bottom: 16, left: 240 }}
            barCategoryGap={10}
          >
            <CartesianGrid horizontal={false} {...gridProps} />
            <XAxis
              type="number"
              domain={[0, (max) => Math.ceil((max || 0) * 1.2)]}
              allowDecimals={false}
              tickFormatter={formatMiles}
              {...axisProps}
            />
            <YAxis
              type="category"
              dataKey="tipo"
              width={240}
              tickLine={false}
              interval={0}
              {...axisProps}
            />
            <Tooltip
              {...tooltipProps}
              wrapperStyle={{ ...tooltipProps.wrapperStyle, outline: "none" }}
              content={({ active, payload }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  dark={isDarkMode}
                  label={`Situación: ${payload?.[0]?.payload?.tipo || "Sin especificar"}`}
                >
                  {payload?.length && (
                    <>
                      <div>
                        Cantidad de agentes: {formatMiles(payload[0].payload.cantidad)}
                      </div>
                      <div>
                        Porcentaje: {" "}
                        {formatPct(
                          (payload[0].payload.cantidad || 0) / (total || 1),
                        )}
                      </div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar
              dataKey="cantidad"
              maxBarSize={22}
              fill={primary}
              activeBar={{ fill: hover }}
            >
              <LabelList
                dataKey="cantidad"
                content={(p) => (
                  <ValueLabel {...p} total={total} dark={isDarkMode} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};

export default EmploymentTypeBarChart;
