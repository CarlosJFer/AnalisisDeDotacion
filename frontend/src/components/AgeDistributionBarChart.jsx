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
import { DashboardCard, PaginationControls, theme } from "../ui";
import icons from "../ui/icons.js";
import {
  formatMiles,
  formatPct,
  rechartsCommon,
  UnifiedTooltip,
  ValueLabel,
} from "../ui/chart-utils";

const AGE_BUCKETS = [
  "18-25",
  "26-35",
  "36-45",
  "46-55",
  "56-65",
  "65+",
  "No tiene datos",
];

const AgeDistributionBarChart = ({
  data,
  isDarkMode,
  title = "Distribución por Rangos de Edad - Planta y Contratos",
}) => {
  const COLOR = theme.palette.primary;
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);

  const chartData = useMemo(() => {
    const total = (data || []).reduce((s, d) => s + Number(d.count || 0), 0);
    const arr = (data || []).map((d) => {
      const cantidad = Number(d.count || 0);
      return {
        rango: d.range,
        cantidad,
        porcentaje: total ? cantidad / total : 0,
      };
    });
    const order = (r) => {
      const idx = AGE_BUCKETS.indexOf(r);
      return idx === -1 ? AGE_BUCKETS.length : idx;
    };
    return arr.sort((a, b) => order(a.rango) - order(b.rango));
  }, [data]);

  const total = useMemo(
    () => chartData.reduce((s, d) => s + d.cantidad, 0),
    [chartData],
  );

  const [page, setPage] = useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page],
  );

  return (
    <DashboardCard
      title={title}
      icon={<icons.edad />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip label="Rangos de edad" size="small" variant="outlined" />
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
        {chartData.length} rangos • {formatMiles(total)} agentes
      </Typography>
      <Box sx={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            margin={{ top: 16, right: 160, bottom: 16, left: 40 }}
          >
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="rango" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              {...tooltipProps}
              content={({ active, payload, label }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  label={`Rango: ${label}`}
                  dark={isDarkMode}
                >
                  {payload?.length && (
                    <>
                      <div>
                        Cantidad de agentes:{" "}
                        {formatMiles(payload[0].payload.cantidad)}
                      </div>
                      <div>
                        Porcentaje: {formatPct(payload[0].payload.porcentaje)}
                      </div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey="cantidad" fill={COLOR} maxBarSize={28}>
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

export default AgeDistributionBarChart;
