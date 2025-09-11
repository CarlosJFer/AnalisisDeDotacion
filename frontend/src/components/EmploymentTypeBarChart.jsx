import React, { useMemo, useState } from "react";
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
import { DashboardCard, PaginationControls, formatMiles, formatPct, UnifiedTooltip, rechartsCommon, ValueLabel, theme } from "../ui";
import icons from "../ui/icons.js";

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

  const [page, setPage] = useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );

  const MIN_RIGHT = 140;
  const MAX_RIGHT = 240;
  const dynamicRight = React.useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map((d) =>
      formatPct((Number(d.cantidad) || 0) / (total || 1)),
    );
    const maxChars = Math.max(...labels.map((t) => t.length));
    const approxWidth = maxChars * 7 + 20;
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, total]);

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
      <Box sx={{ height: Math.max(320, pageData.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            layout="vertical"
            margin={{ top: 16, right: dynamicRight, bottom: 16, left: 240 }}
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

export default EmploymentTypeBarChart;
