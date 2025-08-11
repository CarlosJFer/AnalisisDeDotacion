import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Sector
} from 'recharts';

const CustomDonutChart = React.memo(({ data, title, isDarkMode, dataKey = 'count', nameKey = 'name' }) => {
    const COLORS = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', 
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((item, index) => ({
            ...item,
            color: COLORS[index % COLORS.length]
        }));
    }, [data]);

    const [activeIndex, setActiveIndex] = useState(null);

    const total = useMemo(() => {
        return chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
    }, [chartData, dataKey]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = total > 0 ? ((data[dataKey] / total) * 100).toFixed(1) : 0;
            return (
                <Box sx={{
                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {data[nameKey]}
                    </Typography>
                    <Typography variant="body2">
                        Cantidad: {data[dataKey]}
                    </Typography>
                    <Typography variant="body2">
                        Porcentaje: {percentage}%
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // No mostrar etiquetas para segmentos muy pequeños
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill={isDarkMode ? 'white' : 'black'} 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="12"
                fontWeight="600"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderLegend = ({ payload }) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
            {payload.map((entry, index) => {
                const value = entry.payload[dataKey];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return (
                    <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                background: `url(#gradient-${index})`,
                                mr: 1,
                                borderRadius: '50%'
                            }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {`${entry.payload[nameKey]} (${percentage}%)`}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );

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
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mb: 2 
                }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        }}
                    >
                        {total.toLocaleString()}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            ml: 1,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        }}
                    >
                        Total
                    </Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {chartData.map((entry, index) => (
                                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                innerRadius={60}
                                dataKey={dataKey}
                                isAnimationActive
                                animationDuration={800}
                                activeIndex={activeIndex}
                                activeShape={(props) => (
                                    <Sector {...props} outerRadius={props.outerRadius + 6} />
                                )}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomDonutChart;
