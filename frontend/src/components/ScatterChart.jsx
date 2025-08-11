import React, { useMemo } from 'react';
import { CardContent, Typography, Box } from '@mui/material';
import GlassCard from './GlassCard.jsx';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import chartColors from '../theme/chartColors';

const CustomScatterChart = React.memo(({ data, title, xKey = 'age', yKey = 'function' }) => {
    const { isDarkMode } = useAppTheme();
    const colors = chartColors[isDarkMode ? 'dark' : 'light'];
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        
        // Agrupar datos por función para crear series
        const groupedData = {};
        data.forEach(item => {
            const func = item[yKey] || 'Sin especificar';
            if (!groupedData[func]) {
                groupedData[func] = [];
            }
            groupedData[func].push({
                x: item[xKey],
                y: Math.random() * 0.8 + 0.1, // Dispersión vertical aleatoria para visualización
                originalY: func,
                ...item
            });
        });
        
        return Object.entries(groupedData).map(([func, points], index) => ({
            name: func,
            data: points,
            color: colors.palette[index % colors.palette.length]
        }));
    }, [data, xKey, yKey, colors.palette]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{
                    backgroundColor: colors.tooltipBg,
                    border: colors.tooltipBorder,
                    borderRadius: '8px',
                    p: 2,
                    color: colors.tooltipText,
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Edad: {data.x} años
                    </Typography>
                    <Typography variant="body2">
                        Función: {data.originalY}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <GlassCard isDarkMode={isDarkMode}>
        <Card sx={{
            height: '100%',
            background: isDarkMode
                ? 'rgba(45, 55, 72, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.08)',
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
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    align="center"
                    sx={{
                        fontWeight: 600,
                        color: colors.text,
                        mb: 2,
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={colors.grid}
                            />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Edad"
                                tick={{ fill: colors.text }}
                                axisLine={{ stroke: colors.axis }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Función"
                                domain={[0, 1]}
                                tick={false}
                                axisLine={{ stroke: colors.axis }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: colors.text }} />
                            {chartData.map((series) => (
                                <Scatter
                                    key={series.name}
                                    name={series.name}
                                    data={series.data}
                                    fill={series.color}
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </GlassCard>
    );
});

export default CustomScatterChart;