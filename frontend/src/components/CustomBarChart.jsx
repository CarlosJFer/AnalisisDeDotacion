import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';

// Función para determinar el color, icono y chip basado en el título
const getChartConfig = (title, theme) => {
  if (title.includes('Edad') || title.includes('edad')) {
    return {
      color: theme.palette.success.main,
      icon: AnalyticsIcon,
      chipLabel: 'Análisis de Edad',
    };
  } else if (
    title.includes('Antigüedad') ||
    title.includes('estudios') ||
    title.includes('Secretarías')
  ) {
    return {
      color: theme.palette.secondary.main,
      icon: SchoolIcon,
      chipLabel: 'Antigüedad y Estudios',
    };
  } else if (
    title.includes('certificaciones') ||
    title.includes('registración') ||
    title.includes('horario')
  ) {
    return {
      color: theme.palette.warning.main,
      icon: AssignmentTurnedInIcon,
      chipLabel: 'Control de Certificaciones',
    };
  } else if (title.includes('expedientes') || title.includes('trámite')) {
    return {
      color: theme.palette.error.main,
      icon: FolderOpenIcon,
      chipLabel: 'Expedientes',
    };
  } else {
    return {
      color: theme.palette.primary.main,
      icon: AnalyticsIcon,
      chipLabel: 'Análisis General',
    };
  }
};

const CustomBarChart = React.memo(({ data, xKey, barKey, title, isDarkMode, height = 300 }) => {
    const { theme } = useTheme();
    const chartData = useMemo(() => data, [data]);
    const config = useMemo(() => getChartConfig(title, theme), [title, theme]);
    const IconComponent = config.icon;
    
    return (
        <Card sx={{
            height: '100%',
            background: isDarkMode
                ? 'rgba(45, 55, 72, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.08)',
            borderLeft: `6px solid ${config.color}`,
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.15)',
            }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, mb: 2 }}>
                      <IconComponent aria-hidden="true" sx={{ color: config.color }} />
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
                        label={config.chipLabel} 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderColor: config.color, color: config.color }} 
                    />
                </Box>
                <Box sx={{ height: height }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: xKey === 'range' ? 40 : 80 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis
                                  dataKey={xKey}
                                  tick={{ fill: theme.palette.text.secondary, fontSize: xKey === 'range' ? 14 : 10 }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  angle={xKey === 'range' ? 0 : -45}
                                  textAnchor={xKey === 'range' ? 'middle' : 'end'}
                                  height={80}
                                  interval={0}
                              />
                              <YAxis
                                  tick={{ fill: theme.palette.text.secondary }}
                                  axisLine={{ stroke: theme.palette.divider }}
                              />
                              <Tooltip
                                  contentStyle={{
                                      backgroundColor: theme.palette.background.paper,
                                      border: `1px solid ${theme.palette.divider}`,
                                      borderRadius: '8px',
                                      color: theme.palette.text.primary,
                                  }}
                                  labelFormatter={(label) => `${xKey === 'function' ? 'Función' : xKey === 'range' ? 'Rango de edad' : xKey === 'area' ? 'Área' : 'Categoría'}: ${label}`}
                                  formatter={(value) => [
                                      barKey === 'avgAge' ? `${Math.round(value)} años` : value,
                                      barKey === 'avgAge' ? 'Edad promedio' : 'Cantidad de agentes',
                                  ]}
                              />
                              <Bar dataKey={barKey} fill={config.color} radius={[4, 4, 0, 0]}>
                                  <LabelList dataKey={barKey} position="top" fill={theme.palette.text.primary} />
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomBarChart;
