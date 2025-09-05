import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Tooltip as MuiTooltip } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const nf = new Intl.NumberFormat('es-AR');
const formatMiles = (n) => nf.format(n);
const formatPct = (p, digits = 1) => `${(p * 100).toFixed(digits).replace('.', ',')}%`;


const truncate = (text, max = 30) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

const RIGHT_PAD = 8;
const INSIDE_PAD = 6;
const MARGIN_RIGHT = 72;

const CustomHorizontalBarChart = ({ data, title, isDarkMode, nameKey, valueKey, height }) => {
  const chartData = useMemo(() => data, [data]);
  const chartHeight = height || Math.max(420, chartData.length * 30);
  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + (item[valueKey] || 0), 0),
    [chartData, valueKey]
  );

  const renderYAxisTick = (props) => {
    const { x, y, payload } = props;
    const value = payload.value || '';
    const truncated = truncate(value);
    return (
      <g transform={`translate(${x},${y})`}>
        <MuiTooltip title={value} placement="right">
          <text
            x={0}
            y={0}
            dy={4}
            textAnchor="end"
            fill={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
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

    const labelText = `${formatMiles(value)} (${formatPct(total ? value / total : 0)})`;
    const approxTextW = labelText.length * 7;

    const barEndX = x + width;
    const chartRightLimit = chartW - MARGIN_RIGHT;
    const willOverflow = barEndX + RIGHT_PAD + approxTextW > chartRightLimit;

    if (willOverflow && width < 24) return null;

    const textX = willOverflow ? barEndX - INSIDE_PAD : barEndX + RIGHT_PAD;
    const textAnchor = willOverflow ? 'end' : 'start';
    const fill = willOverflow ? '#0f172a' : '#cbd5e1';

    return (
      <text x={textX} y={y} dy={4} fontSize={12} textAnchor={textAnchor} fill={fill}>
        {labelText}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label, total }) => {
    if (!active || !payload || !payload.length) return null;
    const v = payload[0]?.value || 0;
    return (
      <div
        style={{
          background: '#0b1220',
          border: '1px solid #334155',
          color: '#e2e8f0',
          borderRadius: 10,
          padding: '10px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
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
        height: '100%',
        background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDarkMode
            ? '0 12px 40px rgba(0, 0, 0, 0.4)'
            : '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 600,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 16, right: MARGIN_RIGHT, bottom: 16, left: 240 }}
              barCategoryGap={8}
            >
              <CartesianGrid horizontal strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, (dataMax) => Math.ceil(dataMax * 1.12)]}
                tickFormatter={formatMiles}
                allowDecimals={false}
                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                axisLine={{
                  stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                }}
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
                content={<CustomTooltip total={total} />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey={valueKey} maxBarSize={22} fill="#00C49F">
                <LabelList content={<ValueLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomHorizontalBarChart;

