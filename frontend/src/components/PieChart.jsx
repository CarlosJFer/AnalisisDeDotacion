import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import chartColors from '../theme/chartColors';

const CustomPieChart = ({ data, dataKey, nameKey, title }) => {
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
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.palette[index % colors.palette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  border: colors.tooltipBorder,
                }}
                itemStyle={{ color: colors.tooltipText }}
                labelStyle={{ color: colors.tooltipText }}
              />
              <Legend wrapperStyle={{ color: colors.text }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomPieChart;
