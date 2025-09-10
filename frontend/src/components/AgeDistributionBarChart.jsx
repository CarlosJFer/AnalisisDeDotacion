import React, { useMemo } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import DashboardCard from './ui/DashboardCard.jsx';
import { formatMiles, ValueLabel, axisProps, gridProps, defaultTooltip } from '../ui/chart-utils';
import { useTheme } from '../context/ThemeContext.jsx';

const AgeDistributionBarChart = ({ data, isDarkMode }) => {
  const { theme } = useTheme();
  const COLOR = theme.palette.primary.main;
  const chartData = useMemo(
    () => (data || []).map(d => ({ range: d.range, cantidad: Number(d.count || 0) })),
    [data]
  );
  const total = useMemo(() => chartData.reduce((s, d) => s + (d.cantidad || 0), 0), [chartData]);

  return (
    <DashboardCard
      title="Distribución por Rangos de Edad - Planta y Contratos"
      icon="timeline"
      isDarkMode={isDarkMode}
      headerRight={<Chip label="Rangos de edad" size="small" variant="outlined" />}
    >
      <Typography
        variant="body2"
        align="center"
        sx={{ mb: 2, color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
      >
        {chartData.length} rangos • {formatMiles(total)} agentes
      </Typography>
      <Box sx={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 160, bottom: 16, left: 40 }}>
            <CartesianGrid {...gridProps(isDarkMode)} />
            <XAxis dataKey="range" {...axisProps(isDarkMode)} />
            <YAxis {...axisProps(isDarkMode)} />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={defaultTooltip(isDarkMode, total, (l) => `Rango: ${l}`)}
            />
            <Bar dataKey="cantidad" fill={COLOR} maxBarSize={28}>
              <LabelList dataKey="cantidad" content={(p) => <ValueLabel {...p} total={total} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};

export default AgeDistributionBarChart;

