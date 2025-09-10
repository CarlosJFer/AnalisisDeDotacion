import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Función para determinar el color, icono y chip basado en el título
const getChartConfig = (title) => {
    if (title.includes('Edad') || title.includes('edad')) {
        return {
            color: '#00C49F',
            icon: AnalyticsIcon,
            chipLabel: 'Análisis de Edad'
        };
    } else if (title.includes('Antigüedad') || title.includes('estudios') || title.includes('Secretarías')) {
        return {
            color: '#8b5cf6',
            icon: SchoolIcon,
            chipLabel: 'Antigüedad y Estudios'
        };
    } else if (title.includes('certificaciones') || title.includes('registración') || title.includes('horario')) {
        return {
            color: '#f59e0b',
            icon: AssignmentTurnedInIcon,
            chipLabel: 'Control de Certificaciones'
        };
    } else if (title.includes('expedientes') || title.includes('trámite')) {
        return {
            color: '#ef4444',
            icon: FolderOpenIcon,
            chipLabel: 'Expedientes'
        };
    } else {
        return {
            color: '#00C49F',
            icon: AnalyticsIcon,
            chipLabel: 'Análisis General'
        };
    }
};

const CustomBarChart = React.memo(({ data, xKey, barKey, title, isDarkMode, height = 300 }) => {
    const chartData = useMemo(() => data, [data]);
    const config = getChartConfig(title);
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
                    <IconComponent sx={{ color: config.color }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <XAxis
                                dataKey={xKey}
                                tick={{
                                    fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    fontSize: xKey === 'range' ? 14 : 10
                                }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                                angle={xKey === 'range' ? 0 : -45}
                                textAnchor={xKey === 'range' ? 'middle' : 'end'}
                                height={80}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                }}
                                labelFormatter={(label) => `${xKey === 'function' ? 'Función' : xKey === 'range' ? 'Rango de edad' : xKey === 'area' ? 'Área' : 'Categoría'}: ${label}`}
                                formatter={(value, name) => [
                                    barKey === 'avgAge' ? `${Math.round(value)} años` : value,
                                    barKey === 'avgAge' ? 'Edad promedio' : 'Cantidad de agentes'
                                ]}
                            />
                            <Bar dataKey={barKey} fill={config.color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomBarChart;
