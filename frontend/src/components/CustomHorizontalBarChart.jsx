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
} from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const truncate = (text, max = 30) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
};

const MARGIN_RIGHT = 96;

const CustomHorizontalBarChart = ({
  data,
  title,
  isDarkMode,
  nameKey,
  valueKey,
  height,
  pageSize,
  metric = "resumen",
  chipLabel = "Resumen General",
}) => {
  const { theme } = useTheme();
  const COLOR = theme.palette.primary.main;
  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
  const chartData = useMemo(
    () =>
      data
        .map((item) => ({
          ...item,
          [nameKey]: (item[nameKey] ?? "").toString().trim() || "Sin categoría",
          [valueKey]: Number.isFinite(item[valueKey]) ? item[valueKey] : 0,
        }))
        .sort((a, b) => b[valueKey] - a[valueKey]),
    [data, nameKey, valueKey],
  );
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
      <Box sx={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={plotData}
            layout="vertical"
            margin={{ top: 16, right: MARGIN_RIGHT, bottom: 16, left: 240 }}
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
              dataKey={nameKey}
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
