import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip as MuiTooltip,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import PaginationControls from "./ui/PaginationControls.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const nf = new Intl.NumberFormat("es-AR");
const formatMiles = (n) => nf.format(n);
const formatPct = (p, digits = 1) =>
  `${(p * 100).toFixed(digits).replace(".", ",")}%`;

const truncate = (text, max = 30) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
};

const RIGHT_PAD = 8;
const MARGIN_RIGHT = 96;

const formatShort = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + "k";
  return formatMiles(n);
};

const CustomHorizontalBarChart = ({
  data,
  title,
  isDarkMode,
  nameKey,
  valueKey,
  height,
  pageSize,
}) => {
  const { theme } = useTheme();
  const COLOR = theme.palette.primary.main;
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

  const ValueLabel = (props) => {
    const { x = 0, y = 0, width = 0, value = 0, viewBox } = props;
    const chartW = viewBox?.width ?? 0;
    const text = formatPct(total ? value / total : 0);
    const barEndX = x + width;
    const textX = Math.min(barEndX + RIGHT_PAD, chartW - text.length * 7 - 4);
    const fill = theme.palette.text.primary;

    return (
      <text
        x={textX}
        y={y}
        dy={4}
        fontSize={12}
        textAnchor="start"
        fill={fill}
        pointerEvents="none"
      >
        {text}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const v = payload[0]?.value || 0;
    const bg = theme.palette.background.paper;
    const fg = theme.palette.text.primary;
    const bd = theme.palette.divider;
    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${bd}`,
          color: fg,
          borderRadius: 10,
          padding: "10px 12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <div>
          Porcentaje: <strong>{formatPct(total ? v / total : 0)}</strong>
        </div>
        <div>
          Cantidad: <strong>{formatMiles(v)}</strong>
        </div>
      </div>
    );
  };

  return (
    <Card
      sx={{
        height: "100%",
        background: isDarkMode
          ? "rgba(45, 55, 72, 0.8)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        borderLeft: `6px solid ${COLOR}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDarkMode
            ? "0 12px 40px rgba(0, 0, 0, 0.4)"
            : "0 12px 40px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            mb: 2,
          }}
        >
          <DashboardIcon aria-hidden="true" sx={{ color: COLOR }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
          <Chip
            label="Resumen General"
            size="small"
            variant="outlined"
            sx={{ borderColor: COLOR, color: COLOR }}
          />
        </Box>
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
              <CartesianGrid
                horizontal={false}
                strokeDasharray="0 0"
                stroke={theme.palette.divider}
              />
              <XAxis
                type="number"
                domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
                tickFormatter={formatMiles}
                allowDecimals={false}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis
                type="category"
                dataKey={nameKey}
                width={240}
                tickLine={false}
                tick={renderYAxisTick}
                interval={0}
              />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey={valueKey} maxBarSize={22} fill={COLOR}>
                <LabelList content={<ValueLabel />} />
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
      </CardContent>
    </Card>
  );
};

export default CustomHorizontalBarChart;
