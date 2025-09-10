import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { getPalette } from '../theme.js';

const HistogramWidget = ({ data, xKey, barKey, color }) => {
  const { isDarkMode } = useAppTheme();
  const colors = getPalette(isDarkMode);
  const barColor = color || colors.palette[0];
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="body2" color="text.secondary">
          No hay datos de histograma disponibles
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: colors.tooltipBg,
            border: colors.tooltipBorder,
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            color: colors.tooltipText,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color={barColor}>
            Frecuencia: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: colors.text }}
            angle={-45}
            textAnchor="end"
            height={80}
            axisLine={{ stroke: colors.axis }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: colors.text }}
            label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', fill: colors.text }}
            axisLine={{ stroke: colors.axis }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={barKey}
            fill={barColor}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HistogramWidget;