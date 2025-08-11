import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import chartColors from '../theme/chartColors';

const CustomAreaChart = React.memo(({ data, title, xKey = 'range', yKey = 'count' }) => {
    const { isDarkMode } = useAppTheme();
    const colors = chartColors[isDarkMode ? 'dark' : 'light'];
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data;
    }, [data]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: colors.tooltipBg,
                    border: colors.tooltipBorder,
                    borderRadius: '8px',
                    p: 2,
                    color: colors.tooltipText,
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </Typography>
                    ))}
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
                        color: colors.text,
                        mb: 2,
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors.palette[0]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={colors.palette[0]} stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={colors.grid}
                            />
                            <XAxis
                                dataKey={xKey}
                                tick={{ fill: colors.text }}
                                axisLine={{ stroke: colors.axis }}
                            />
                            <YAxis
                                tick={{ fill: colors.text }}
                                axisLine={{ stroke: colors.axis }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: colors.text }} />
                            <Area
                                type="monotone"
                                dataKey={yKey}
                                stroke={colors.palette[0]}
                                fillOpacity={1}
                                fill="url(#colorArea)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomAreaChart;