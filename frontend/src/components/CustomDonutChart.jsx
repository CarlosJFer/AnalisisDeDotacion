import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';

// Función para determinar el color, icono y chip basado en el título
const getChartConfig = (title, theme) => {
    if (title.includes('Edad') || title.includes('edad')) {
        return {
            color: theme.palette.success.main,
            icon: AnalyticsIcon,
            chipLabel: 'Análisis de Edad'
        };
    } else if (title.includes('estudios') || title.includes('título') || title.includes('Secretarías')) {
        return {
            color: theme.palette.secondary.main,
            icon: SchoolIcon,
            chipLabel: 'Antigüedad y Estudios'
        };
    } else if (title.includes('horario') || title.includes('entrada') || title.includes('salida')) {
        return {
            color: theme.palette.warning.main,
            icon: AssignmentTurnedInIcon,
            chipLabel: 'Control de Certificaciones'
        };
    } else if (title.includes('expedientes') || title.includes('trámite')) {
        return {
            color: theme.palette.error.main,
            icon: FolderOpenIcon,
            chipLabel: 'Expedientes'
        };
    } else {
        return {
            color: theme.palette.primary.main,
            icon: AnalyticsIcon,
            chipLabel: 'Análisis General'
        };
    }
};

const CustomDonutChart = React.memo(({ data, title, isDarkMode, dataKey, nameKey, height = 400 }) => {
    const { theme } = useTheme();
    const chartData = useMemo(() => data, [data]);
    const config = useMemo(() => getChartConfig(title, theme), [title, theme]);
    const IconComponent = config.icon;
    const COLORS = [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.secondary.main,
        theme.palette.info.main,
        theme.palette.success.light,
        theme.palette.warning.light,
        theme.palette.error.light,
        theme.palette.info.light,
    ];

    const total = useMemo(() => {
        return chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
    }, [chartData, dataKey]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = total > 0 ? ((data[dataKey] / total) * 100).toFixed(1) : 0;
            return (
                <Box sx={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    p: 2,
                    color: theme.palette.text.primary,
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {data[nameKey]}
                    </Typography>
                    <Typography variant="body2">
                        Cantidad de agentes: {data[dataKey]}
                    </Typography>
                    <Typography variant="body2">
                        Porcentaje: {percentage}%
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
        if (percent < 0.05) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={theme.palette.text.primary}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12"
                fontWeight="600"
            >
                {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    return (
        <Card sx={{
            height: height,
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
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                innerRadius={60}
                                fill={theme.palette.primary.main}
                                dataKey={dataKey}
                                nameKey={nameKey}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '12px',
                                    paddingTop: '10px'
                                }}
                                iconSize={8}
                                formatter={(value) => value}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomDonutChart;
