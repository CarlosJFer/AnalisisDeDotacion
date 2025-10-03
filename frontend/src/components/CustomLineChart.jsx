import React, { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { DashboardCard } from "../ui";
import icons from "../ui/icons.js";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  generateColorScale,
} from "../ui/chart-utils.jsx";

const CustomLineChart = React.memo(
  ({
    data,
    xKey,
    yKey,
    title,
    isDarkMode,
    height = 300,
    metric = "resumen",
    chipLabel,
    series,
  }) => {
    const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);
    const Icon = icons[metric] || icons.resumen;
    const seriesKey = Array.isArray(series) && series.length
      ? series.map((item) => item?.dataKey || item?.key || "").join("|")
      : yKey || "series";

    const rawSeries = useMemo(() => {
      if (Array.isArray(series) && series.length) {
        return series;
      }
      if (yKey) {
        return [{ dataKey: yKey }];
      }
      return [];
    }, [series, yKey]);

    const paletteSeed = `${metric || "line"}-${title || ""}-${seriesKey}`;
    const palette = useMemo(
      () => generateColorScale(Math.max(rawSeries.length || 1, 1), paletteSeed, isDarkMode),
      [rawSeries.length, paletteSeed, isDarkMode],
    );
    const accentColor = palette[0];

    const lineSeries = useMemo(
      () =>
        rawSeries
          .map((item, index) => {
            const dataKey = item?.dataKey || item?.key || yKey;
            if (!dataKey) return null;
            return {
              dataKey,
              name: item?.name || item?.label || dataKey,
              color: item?.color || palette[index % palette.length],
            };
          })
          .filter(Boolean),
      [rawSeries, palette, yKey],
    );

    const isMultiSeries = lineSeries.length > 1;
    const primaryKey = lineSeries[0]?.dataKey;

    const total = useMemo(() => {
      if (!primaryKey || isMultiSeries) return 0;
      return chartData.reduce(
        (sum, item) => sum + Number(item?.[primaryKey] || 0),
        0,
      );
    }, [chartData, primaryKey, isMultiSeries]);

    return (
      <DashboardCard
        title={title}
        icon={<Icon />}
        isDarkMode={isDarkMode}
        headerRight={
          chipLabel && (
            <Chip
              label={chipLabel}
              size="small"
              variant="outlined"
              sx={{ borderColor: accentColor, color: accentColor }}
            />
          )
        }
      >
        <Box sx={{ height, width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 24, left: 8, bottom: 80 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey={xKey}
                {...axisProps}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip
                {...tooltipProps}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  if (!isMultiSeries) {
                    const value = payload[0]?.value || 0;
                    return (
                      <UnifiedTooltip
                        active={active}
                        payload={payload}
                        label={"" + label}
                        dark={isDarkMode}
                      >
                        <div>Cantidad: {formatMiles(value)}</div>
                        <div>
                          Porcentaje: {formatPct(value / (total || 1))}
                        </div>
                      </UnifiedTooltip>
                    );
                  }

                  const items = payload
                    .filter((entry) => Number.isFinite(Number(entry?.value)))
                    .map((entry) => {
                      const match = lineSeries.find(
                        (serie) => serie.dataKey === entry.dataKey,
                      );
                      const name = match?.name || entry?.name || entry.dataKey;
                      const color = match?.color || entry?.color;
                      return (
                        <div key={entry.dataKey} style={{ color: color || undefined }}>
                          {name}: {formatMiles(entry.value || 0)}
                        </div>
                      );
                    });

                  if (!items.length) return null;

                  return (
                    <UnifiedTooltip
                      active={active}
                      payload={payload}
                      label={"" + label}
                      dark={isDarkMode}
                    >
                      {items}
                    </UnifiedTooltip>
                  );
                }}
              />
              {lineSeries.map((serie, index) => (
                <Line
                  key={serie.dataKey || index}
                  type="monotone"
                  dataKey={serie.dataKey}
                  stroke={serie.color}
                  strokeWidth={isMultiSeries ? 2 : 3}
                  dot={{
                    r: isMultiSeries ? 4 : 5,
                    strokeWidth: 2,
                    stroke: isDarkMode ? "#0f172a" : "#ffffff",
                    fill: serie.color,
                  }}
                  activeDot={{ r: isMultiSeries ? 6 : 7 }}
                >
                  {!isMultiSeries && index === 0 && (
                    <LabelList
                      dataKey={serie.dataKey}
                      position="top"
                      formatter={(value) => formatMiles(value)}
                    />
                  )}
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </DashboardCard>
    );
  },
);

export default CustomLineChart;
