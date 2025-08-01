import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomScatterChart = React.memo(({ data, title, isDarkMode, xKey = 'age', yKey = 'function' }) => {
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
            color: `hsl(${index * 360 / Object.keys(groupedData).length}, 70%, 50%)`
        }));
    }, [data, xKey, yKey]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{
                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
                                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="Edad"
                                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="Función"
                                domain={[0, 1]}
                                tick={false}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                }}
                            />
                            {chartData.map((series, index) => (
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
        </Card>
    );
});

export default CustomScatterChart;