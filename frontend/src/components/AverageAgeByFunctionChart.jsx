import React, { useMemo, useState, useCallback } from "react";
import { Typography, Box, Chip } from "@mui/material";
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
import {
  formatMiles,
  formatPct,
  rechartsCommon,
  UnifiedTooltip,
  AvgAgeLabel,
} from "../ui/chart-utils";
import { DashboardCard, PaginationControls, icons, theme } from "../ui";

const AverageAgeByFunctionChart = ({ data, isDarkMode }) => {
  const COLOR = theme.palette.primary;
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
  const chartData = useMemo(
    () =>
      data
        .map((d) => ({
          funcion: (d.function ?? "").toString().trim() || "Sin función",
          cantidad: Number(d.count || 0),
          promedio: Number(d.avgAge || 0),
          avg: Number(d.avgAge || 0),
        }))
        .sort((a, b) => b.cantidad - a.cantidad),
    [data],
  );

  const [page, setPage] = useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );
  const grandTotal = useMemo(
    () => chartData.reduce((sum, d) => sum + d.cantidad, 0),
    [chartData],
  );

  // Ticks del eje X controlados para evitar marcas no deseadas (ej. 63)
  const maxAvgPage = useMemo(
    () =>
      pageData?.length
        ? Math.max(
            ...pageData.map((d) => Number(d.avg ?? d.promedio ?? 0) || 0),
          )
        : 0,
    [pageData],
  );
  const xTicks = useMemo(() => {
    const step = maxAvgPage > 80 ? 20 : 10; // pasos "redondos" para edades
    const end = Math.ceil((maxAvgPage || 0) / step) * step;
    const arr = [];
    // Incluir el valor 'end' para dibujar la última línea y etiqueta
    for (let v = 0; v <= end; v += step) arr.push(v);
    return arr;
  }, [maxAvgPage]);

  // Margen derecho dinámico en base al largo de las etiquetas fuera de la barra
  const MIN_RIGHT = 160;
  const MAX_RIGHT = 260;
  const dynamicRight = useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const maxAvg = Math.max(
      ...pageData.map((d) => Math.round(Number(d.avg ?? d.promedio ?? 0))),
    );
    const label = `Edad promedio: ${maxAvg} años`;
    const approxWidth = label.length * 7 + 20;
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData]);

  const handlePrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const handleNext = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  return (
    <DashboardCard
      title="Edad Promedio por Función - Planta y Contratos"
      icon={<icons.edad />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip
          label="Análisis de Edad"
          size="small"
          variant="outlined"
          sx={{ borderColor: COLOR, color: COLOR }}
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
        {chartData.length} categorías • {formatMiles(grandTotal)} agentes
      </Typography>
      <Box sx={{ height: Math.max(420, pageData.length * 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            layout="vertical"
            margin={{ top: 16, right: dynamicRight, bottom: 16, left: 260 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              {...gridProps}
              horizontal={false}
              strokeDasharray="0 0"
            />
            <XAxis
              {...axisProps}
              type="number"
              domain={[0, (max) => Math.ceil(max * 1.2)]}
              allowDecimals={false}
              ticks={xTicks}
              tickFormatter={formatMiles}
            />
            <YAxis
              {...axisProps}
              type="category"
              dataKey="funcion"
              width={240}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              {...tooltipProps}
              content={({ active, payload }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  label={`Función: ${payload?.[0]?.payload?.funcion || "Sin función"}`}
                  dark={isDarkMode}
                >
                  {payload?.length && (
                    <>
                      <div>
                        Edad promedio: {Math.round(payload[0].payload.avg)} años
                      </div>
                      <div>
                        Cantidad de agentes:{" "}
                        {formatMiles(payload[0].payload.cantidad)}
                      </div>
                      <div>
                        Porcentaje:{" "}
                        {formatPct(
                          payload[0].payload.cantidad / (grandTotal || 1),
                        )}
                      </div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey="avg" maxBarSize={22} fill={COLOR}>
              <LabelList
                dataKey="avg"
                content={(p) => <AvgAgeLabel {...p} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {chartData.length > PAGE && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </DashboardCard>
  );
};

export default AverageAgeByFunctionChart;
