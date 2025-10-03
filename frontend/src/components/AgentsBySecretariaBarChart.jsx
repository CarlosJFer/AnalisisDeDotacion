import React, { useMemo, useState } from "react";
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
import { DashboardCard, PaginationControls } from "../ui";
import icons from "../ui/icons.js";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  getSeriesColor,
} from "../ui/chart-utils.jsx";

const AgentsBySecretariaBarChart = ({ data, isDarkMode }) => {
  const primary = useMemo(() => getSeriesColor("agents-by-secretaria", isDarkMode), [isDarkMode]);
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);

  // Normalizar y ordenar datos por cantidad desc
  const chartData = useMemo(() => {
    const rows = (data || []).map((d) => ({
      secretaria: (d.secretaria ?? "").toString().trim() || "Sin especificar",
      cantidad: Number(d.count || 0),
    }));
    return rows.sort((a, b) => b.cantidad - a.cantidad);
  }, [data]);

  // Paginación de 5 en 5
  const [page, setPage] = useState(0);
  const PAGE = 5;
  const totalPages = Math.ceil((chartData.length || 0) / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );
  const grandTotal = useMemo(
    () => chartData.reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0),
    [chartData],
  );

  // Margen derecho dinámico según el largo de las etiquetas fuera de la barra
  const MIN_RIGHT = 140;
  const MAX_RIGHT = 240;
  const dynamicRight = React.useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map((d) =>
      formatPct((Number(d.cantidad) || 0) / (grandTotal || 1)),
    );
    const maxChars = Math.max(...labels.map((t) => t.length));
    const approxWidth = maxChars * 7 + 20; // 7px por carácter + padding
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, grandTotal]);

  return (
    <DashboardCard
      title="Agentes por Secretaría - Planta y Contratos"
      icon={<icons.distribucion />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip
          label="Secretaría"
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
        {chartData.length} categorías • {formatMiles(grandTotal)} agentes
      </Typography>
      <Box sx={{ height: Math.max(320, pageData.length * 40), width: '100%', minWidth: 0 }}>
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
              domain={[0, (max) => Math.ceil((max || 0) * 1.2)]}
              allowDecimals={false}
              tickFormatter={formatMiles}
            />
            <YAxis
              {...axisProps}
              type="category"
              dataKey="secretaria"
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
                  dark={isDarkMode}
                  label={`Secretaría: ${
                    payload?.[0]?.payload?.secretaria || "Sin especificar"
                  }`}
                >
                  {payload?.length && (
                    <>
                      <div>
                        Cantidad de agentes: {" "}
                        {formatMiles(payload[0].payload.cantidad)}
                      </div>
                      <div>
                        Porcentaje: {" "}
                        {formatPct(
                          (payload[0].payload.cantidad || 0) /
                            (grandTotal || 1),
                        )}
                      </div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey="cantidad" maxBarSize={22} fill={primary}>
              <LabelList
                position="right"
                dataKey="cantidad"
                content={(props) => (
                  <ValueLabel
                    {...props}
                    total={grandTotal}
                    dark={isDarkMode}
                  />
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

export default AgentsBySecretariaBarChart;
