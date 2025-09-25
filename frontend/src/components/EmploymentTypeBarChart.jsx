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
import { DashboardCard, PaginationControls, formatMiles, formatPct, UnifiedTooltip, rechartsCommon, ValueLabel, getSeriesColor, getEmphasisColor } from "../ui";
import icons from "../ui/icons.js";
const MERGED_REGISTRATION_LABEL = "Sin tipo de registraci�n";
const sanitizeRegistration = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const resolveRegistrationLabel = (rawType) => {
  const trimmed = (rawType ?? "").toString().trim();
  const normalized = sanitizeRegistration(trimmed);
  if (!normalized) return MERGED_REGISTRATION_LABEL;

  if (
    normalized.includes("sreg") ||
    normalized.includes("srg") ||
    normalized.includes("otros") ||
    normalized.includes("otro") ||
    normalized.includes("sintipo") ||
    normalized.includes("sinregistro")
  ) {
    return MERGED_REGISTRATION_LABEL;
  }

  return trimmed || MERGED_REGISTRATION_LABEL;
};

const EmploymentTypeBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const accumulator = new Map();

    rows.forEach((entry) => {
      const label = resolveRegistrationLabel(entry?.type);
      const amount = Number(entry?.count || 0) || 0;
      accumulator.set(label, (accumulator.get(label) || 0) + amount);
    });

    return Array.from(accumulator.entries())
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .filter(({ cantidad }) => cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [data]);
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
  const primary = useMemo(() => getSeriesColor("employment-type", isDarkMode), [isDarkMode]);
  const hover = useMemo(() => getEmphasisColor(primary, isDarkMode, 0.18), [primary, isDarkMode]);

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
                position="right"
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
