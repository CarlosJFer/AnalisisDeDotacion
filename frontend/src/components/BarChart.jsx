import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import chartColors from '../theme/chartColors';

const CustomBarChart = ({ data, xKey, barKey, title }) => {
  const { isDarkMode } = useAppTheme();
  const colors = chartColors[isDarkMode ? 'dark' : 'light'];

  return (
    <Card sx={{ width: '100%', height: 300, my: 3 }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey={xKey}
                tick={{ fill: colors.text }}
                axisLine={{ stroke: colors.axis }}
              />
              <YAxis
                tick={{ fill: colors.text }}
                axisLine={{ stroke: colors.axis }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  border: colors.tooltipBorder,
                }}
                itemStyle={{ color: colors.tooltipText }}
                labelStyle={{ color: colors.tooltipText }}
              />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Bar dataKey={barKey} fill={colors.palette[0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomBarChart;
