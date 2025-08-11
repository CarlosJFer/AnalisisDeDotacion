import React, { useMemo } from 'react';
import { CardContent, Typography, Box } from '@mui/material';
import GlassCard from './GlassCard.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomAreaChart = React.memo(({ data, title, isDarkMode, xKey = 'range', yKey = 'count' }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data;
    }, [data]);

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
        <GlassCard isDarkMode={isDarkMode}>
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
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <XAxis 
                                dataKey={xKey}
                                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <YAxis 
                                tick={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey={yKey} 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorArea)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </GlassCard>
    );
});

export default CustomAreaChart;