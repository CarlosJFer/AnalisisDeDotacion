import React, { useMemo, useState } from "react";
import { Typography, Box, Tooltip as MuiTooltip, Chip } from "@mui/material";
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
import { PaginationControls, DashboardCard } from "../ui";
import icons from "../ui/icons.js";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  getSeriesColor,
} from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const truncate = (text, max = 30) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
};

const BASE_MARGIN_RIGHT = 96;

const CustomHorizontalBarChart = ({
  data,
  title,
  isDarkMode,
  nameKey,
  xKey,
  valueKey,
  height,
  pageSize,
  metric = "resumen",
  chipLabel = "Resumen General",
}) => {
  const { theme } = useTheme();
  const categoryKey = nameKey ?? xKey ?? "category";
  const COLOR = useMemo(
    () => getSeriesColor(`${metric || "horizontal"}-${title || categoryKey || valueKey || "series"}`, isDarkMode),
    [metric, title, categoryKey, valueKey, isDarkMode],
  );
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);

  const chartData = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    return source
      .map((item) => {
        const rawLabel = (item?.[categoryKey] ?? "").toString().trim();
        const label = rawLabel || "Sin categoria";
        const numericCandidate = Number(item?.[valueKey]);
        const amount = Number.isFinite(numericCandidate) ? numericCandidate : 0;
        return {
          ...item,
          [categoryKey]: label,
          [valueKey]: amount,
        };
      })
      .sort((a, b) => b[valueKey] - a[valueKey]);
  }, [data, categoryKey, valueKey]);
  const [page, setPage] = useState(0);
  const effectivePageSize = pageSize ?? chartData.length;
  const totalPages = Math.ceil(chartData.length / effectivePageSize);
  const paginatedData = useMemo(
    () =>
      chartData.slice(page * effectivePageSize, (page + 1) * effectivePageSize),
    [chartData, page, effectivePageSize],
  );
  const showPagination = pageSize && chartData.length > pageSize;

  const plotData = paginatedData;

  const chartHeight = height || Math.max(420, plotData.length * 30);
  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + (item[valueKey] || 0), 0),
    [chartData, valueKey],
  );
  // margen derecho dinámico según el largo del porcentaje mostrado a la derecha
  const dynamicRight = useMemo(() => {
    if (!plotData?.length) return BASE_MARGIN_RIGHT;
    const maxVal = Math.max(0, ...plotData.map((d) => Number(d[valueKey] || 0)));
    const txt = formatPct((maxVal || 0) / (total || 1));
    const approx = txt.length * 7 + 14;
    return Math.max(BASE_MARGIN_RIGHT, Math.min(260, approx));
  }, [plotData, valueKey, total]);

  const renderYAxisTick = (props) => {
    const { x, y, payload } = props;
    const value = payload.value || "";
    const truncated = truncate(value);
    return (
      <g transform={`translate(${x},${y})`}>
        <MuiTooltip title={value} placement="right">
          <text
            x={0}
            y={0}
            dy={4}
            textAnchor="end"
            fill={theme.palette.text.secondary}
            fontSize={12}
          >
            {truncated}
          </text>
        </MuiTooltip>
      </g>
    );
  };

  const Icon = icons[metric] || icons.resumen;

  return (
    <DashboardCard
      title={title}
      icon={<Icon />}
      isDarkMode={isDarkMode}
      headerRight={
        <Chip
          label={chipLabel}
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
          color: theme.palette.text.secondary,
        }}
      >
        {chartData.length} categorías • {formatMiles(total)} agentes
      </Typography>
      <Box sx={{ height: chartHeight, width: '100%', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={plotData}
            layout="vertical"
            margin={{ top: 16, right: dynamicRight, bottom: 16, left: 240 }}
            barCategoryGap={10}
          >
            <CartesianGrid horizontal={false} strokeDasharray="0 0" {...gridProps} />
            <XAxis
              type="number"
              domain={[0, (dataMax) => Math.ceil((dataMax || 0) * 1.2)]}
              tickFormatter={formatMiles}
              allowDecimals={false}
              {...axisProps}
            />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width={240}
              tickLine={false}
              tick={renderYAxisTick}
              interval={0}
              {...axisProps}
            />
            <Tooltip
              {...tooltipProps}
              cursor={{ fill: theme.palette.action.hover }}
              content={({ active, payload, label }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  dark={isDarkMode}
                >
                  {payload?.length && (
                    <>
                      <div>
                        Porcentaje: {formatPct((payload[0].value || 0) / (total || 1))}
                      </div>
                      <div>Cantidad: {formatMiles(payload[0].value)}</div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey={valueKey} maxBarSize={22} fill={COLOR}>
              <LabelList
                position="right"
                content={(p) => (
                  <ValueLabel {...p} total={total} dark={isDarkMode} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {showPagination && (
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

export default CustomHorizontalBarChart;
