import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomAreaChart = React.memo(({ data, title, isDarkMode, xKey, yKey }) => {
    const chartData = useMemo(() => data, [data]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    p: 2,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Área: {label}
                    </Typography>
                    <Typography variant="body2">
                        Edad promedio: {Math.round(payload[0].value)} años
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
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
                            <defs>
                                <linearGradient id="colorAreaByArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <XAxis
                                dataKey={xKey}
                                tick={{
                                    fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    fontSize: 10
                                }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={yKey}
                                stroke="#00C49F"
                                fillOpacity={1}
                                fill="url(#colorAreaByArea)"
                                strokeWidth={2}
                                name="Edad promedio"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

export default CustomAreaChart;
