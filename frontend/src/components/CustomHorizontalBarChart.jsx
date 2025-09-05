import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Tooltip as MuiTooltip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';

const formatNumber = (value) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

const truncate = (text, max = 30) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

const CustomHorizontalBarChart = ({ data, title, isDarkMode, nameKey, valueKey, height }) => {
  const chartData = useMemo(() => data, [data]);
  const chartHeight = height || Math.max(420, chartData.length * 30);

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

  return (
    <Card sx={{
      height: '100%',
      background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 12px 40px rgba(0, 0, 0, 0.15)',
      }
    }}>
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
              margin={{ top: 16, right: 24, bottom: 16, left: 240 }}
              barCategoryGap={8}
            >
              <CartesianGrid horizontal strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={formatNumber}
                allowDecimals={false}
                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
              />
              <YAxis
                type="category"
                dataKey={nameKey}
                width={240}
                tickLine={false}
                tick={renderYAxisTick}
              />
              <RechartsTooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey={valueKey} maxBarSize={22} fill="#00C49F">
                <LabelList dataKey={valueKey} position="right" formatter={formatNumber} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomHorizontalBarChart;

