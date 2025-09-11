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
import DashboardCard from "./ui/DashboardCard.jsx";
import PaginationControls from "./ui/PaginationControls.jsx";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
} from "../ui/chart-utils";
import icons from "../ui/icons.js";
import { theme } from "../ui";

const AgentsByDireccionGeneralBarChart = ({ data, isDarkMode }) => {
  const primary = theme.palette.primary;
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);

  const chartData = useMemo(() => {
    const rows = (data || []).map((d) => ({
      direccionGeneral:
        (d.direccionGeneral ?? "").toString().trim() || "Sin especificar",
      cantidad: Number(d.count || 0),
    }));
    return rows.sort((a, b) => b.cantidad - a.cantidad);
  }, [data]);

  const [page, setPage] = useState(0);
  const PAGE = 20;
  const totalPages = Math.ceil((chartData.length || 0) / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );
  const grandTotal = useMemo(
    () => chartData.reduce((s, d) => s + (Number(d.cantidad) || 0), 0),
    [chartData],
  );

  const MIN_RIGHT = 140;
  const MAX_RIGHT = 260;
  const dynamicRight = React.useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map((d) =>
      formatPct((d.cantidad || 0) / (grandTotal || 1)),
    );
    const maxChars = Math.max(...labels.map((t) => t.length));
    const approxWidth = maxChars * 7 + 20;
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, grandTotal]);

  return (
    <DashboardCard
      title="Agentes por Dirección General - Planta y Contratos"
      icon={<icons.distribucion />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip
          label="Dirección General"
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
      <Box sx={{ height: Math.max(320, pageData.length * 40) }}>
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
              dataKey="direccionGeneral"
              width={260}
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
                  label={`Dirección General: ${
                    payload?.[0]?.payload?.direccionGeneral ||
                    "Sin especificar"
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
                dataKey="cantidad"
                content={(p) => (
                  <ValueLabel
                    {...p}
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

export default AgentsByDireccionGeneralBarChart;
