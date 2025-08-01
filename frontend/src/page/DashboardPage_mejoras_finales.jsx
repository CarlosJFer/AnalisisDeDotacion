import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Grid, Tabs, Tab, Button } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import apiClient from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

const StatCard = React.memo(({ title, value, color = 'primary.main', isDarkMode }) => (
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
                color="text.secondary" 
                gutterBottom
                sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                }}
            >
                {title}
            </Typography>
            <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                    fontWeight: 700,
                    fontSize: '2rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}
            >
                {value}
            </Typography>
        </CardContent>
    </Card>
));

const CustomBarChart = React.memo(({ data, xKey, barKey, title, isDarkMode, height = 300 }) => {
    const chartData = useMemo(() => data, [data]);
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
                <Box sx={{ height: height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 80 }}>
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
                                labelFormatter={(label) => `${xKey === 'function' ? 'Función' : xKey === 'range' ? 'Rango de edad' : 'Categoría'}: ${label}`}
                                formatter={(value, name) => [
                                    barKey === 'avgAge' ? `${Math.round(value)} años` : value, 
                                    barKey === 'avgAge' ? 'Edad promedio' : 'Cantidad de agentes'
                                ]}
                            />
                            <Bar dataKey={barKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

// Componente de gráfico de barras HORIZONTALES para direcciones
const CustomHorizontalBarChart = React.memo(({ data, xKey, barKey, title, isDarkMode, height = 400 }) => {
    const chartData = useMemo(() => data, [data]);
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
                <Box sx={{ height: height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={chartData} 
                            layout="horizontal"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <XAxis 
                                type="number"
                                tick={{ 
                                    fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    fontSize: 12
                                }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                            />
                            <YAxis 
                                type="category"
                                dataKey={xKey}
                                tick={{ 
                                    fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    fontSize: 10
                                }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                                width={90}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                }}
                                labelFormatter={(label) => `${xKey === 'direccionGeneral' ? 'Dirección General' : 'Dirección'}: ${label}`}
                                formatter={(value, name) => [value, 'Cantidad de agentes']}
                            />
                            <Bar dataKey={barKey} fill="#8884d8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

// Colores para los gráficos de torta
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

// Componente de gráfico de anillo personalizado UNIFICADO CON LEGEND
const CustomDonutChartUnified = React.memo(({ data, title, isDarkMode, dataKey, nameKey, height = 400 }) => {
    const chartData = useMemo(() => data, [data]);
    
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
    
    return (
        <Card sx={{ 
            height: height, // Altura personalizable
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
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                fill="#8884d8"
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
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                    fontSize: '12px',
                                    paddingTop: '10px'
                                }}
                                iconSize={8}
                                formatter={(value) => value} // Mostrar el nombre real, no "count"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

// Componente de gráfico de área personalizado
const CustomAreaChartLocal = React.memo(({ data, title, isDarkMode, xKey, yKey }) => {
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
                        Rango de edad: {label}
                    </Typography>
                    <Typography variant="body2">
                        Cantidad de agentes: {payload[0].value}
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
                            <Area 
                                type="monotone" 
                                dataKey={yKey} 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorArea)" 
                                strokeWidth={2}
                                name="Cantidad de agentes"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
});

const DashboardPage = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    
    // Estados para todos los datos
    const [totalAgents, setTotalAgents] = useState(0);
    const [ageDistribution, setAgeDistribution] = useState(null);
    const [ageByFunction, setAgeByFunction] = useState([]);
    const [agentsByFunction, setAgentsByFunction] = useState([]);
    const [agentsByEmploymentType, setAgentsByEmploymentType] = useState([]);
    const [agentsByDependency, setAgentsByDependency] = useState([]);
    const [agentsBySecretaria, setAgentsBySecretaria] = useState([]);
    const [agentsBySubsecretaria, setAgentsBySubsecretaria] = useState([]);
    const [agentsByDireccionGeneral, setAgentsByDireccionGeneral] = useState([]);
    const [agentsByDireccion, setAgentsByDireccion] = useState([]);
    const [agentsByDepartamento, setAgentsByDepartamento] = useState([]);
    const [agentsByDivision, setAgentsByDivision] = useState([]);

    // Hooks para limpiar dashboard
    const [cleaning, setCleaning] = useState(false);
    const [cleanMsg, setCleanMsg] = useState('');

    const handleLimpiarDashboard = async () => {
        setCleaning(true);
        setCleanMsg('');
        try {
            await apiClient.post('/admin/limpiar-dashboard');
            setCleanMsg('Dashboard limpiado correctamente.');
            window.location.reload();
        } catch (err) {
            setCleanMsg('Error al limpiar el dashboard.');
        } finally {
            setCleaning(false);
        }
    };

    // Función para filtrar datos que no sean "-" o vacíos
    const filterValidData = (data, nameKey) => {
        return data.filter(item => {
            const value = item[nameKey];
            return value && value.trim() !== '' && value.trim() !== '-' && value.trim() !== 'Sin especificar';
        });
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError('');
            
            try {
                const [
                    totalResponse,
                    ageDistResponse,
                    ageFunctionResponse,
                    functionResponse,
                    employmentResponse,
                    dependencyResponse,
                    secretariaResponse,
                    subsecretariaResponse,
                    direccionGeneralResponse,
                    direccionResponse,
                    departamentoResponse,
                    divisionResponse
                ] = await Promise.all([
                    apiClient.get('/analytics/agents/total'),
                    apiClient.get('/analytics/agents/age-distribution'),
                    apiClient.get('/analytics/agents/age-by-function'),
                    apiClient.get('/analytics/agents/by-function'),
                    apiClient.get('/analytics/agents/by-employment-type'),
                    apiClient.get('/analytics/agents/by-dependency'),
                    apiClient.get('/analytics/agents/by-secretaria'),
                    apiClient.get('/analytics/agents/by-subsecretaria'),
                    apiClient.get('/analytics/agents/by-direccion-general'),
                    apiClient.get('/analytics/agents/by-direccion'),
                    apiClient.get('/analytics/agents/by-departamento'),
                    apiClient.get('/analytics/agents/by-division')
                ]);

                setTotalAgents(totalResponse.data.total);
                setAgeDistribution(ageDistResponse.data);
                setAgeByFunction(ageFunctionResponse.data);
                setAgentsByFunction(functionResponse.data);
                setAgentsByEmploymentType(employmentResponse.data);
                setAgentsByDependency(dependencyResponse.data);
                setAgentsBySecretaria(secretariaResponse.data);
                setAgentsBySubsecretaria(subsecretariaResponse.data);
                setAgentsByDireccionGeneral(direccionGeneralResponse.data);
                setAgentsByDireccion(direccionResponse.data);
                setAgentsByDepartamento(departamentoResponse.data);
                setAgentsByDivision(divisionResponse.data);

            } catch (err) {
                setError('Error al cargar los datos del dashboard. Por favor, contacta al administrador.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: 3, 
            background: isDarkMode
                ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
            minHeight: '100vh',
        }}>
            <Typography 
                variant="h3" 
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    mb: 1,
                }}
            >
                Dashboard de Análisis Municipal
            </Typography>
            <Typography 
                variant="h6" 
                sx={{
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    mb: 2,
                }}
            >
                Análisis detallado de la dotación municipal con gráficos especializados
            </Typography>

            {user?.role === 'admin' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<CleaningServicesIcon />}
                        onClick={handleLimpiarDashboard}
                        disabled={cleaning}
                        sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                            border: 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.3)',
                            },
                            '&:disabled': {
                                background: 'rgba(244, 67, 54, 0.5)',
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {cleaning ? 'Limpiando...' : 'Limpiar Dashboard'}
                    </Button>
                </Box>
            )}
            {cleanMsg && (
                <Alert severity={cleanMsg.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>{cleanMsg}</Alert>
            )}

            {/* Tabs con estilo igual al navbar */}
            <Box sx={{ 
                mb: 4,
                overflow: 'visible',
                pb: 4,
                pt: 2,
                position: 'relative'
            }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    sx={{ 
                        overflow: 'visible !important',
                        '& .MuiTabs-scroller': {
                            overflow: 'visible !important',
                            marginBottom: '20px !important',
                        },
                        '& .MuiTabs-flexContainer': {
                            overflow: 'visible !important',
                            gap: 1,
                            flexWrap: 'wrap',
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTab-root': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            background: isDarkMode 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(255, 255, 255, 0.7)',
                            border: isDarkMode
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&:hover': {
                                background: isDarkMode 
                                    ? 'rgba(33, 150, 243, 0.2)' 
                                    : 'rgba(33, 150, 243, 0.15)',
                                color: isDarkMode ? '#64b5f6' : '#1976d2',
                                transform: 'translateY(-2px)',
                                boxShadow: isDarkMode
                                    ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                    : '0 6px 20px rgba(33, 150, 243, 0.2)',
                            },
                            '&.Mui-selected': {
                                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                                color: 'white',
                                fontWeight: 600,
                                transform: 'translateY(-2px)',
                                boxShadow: isDarkMode
                                    ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                    : '0 6px 20px rgba(33, 150, 243, 0.2)',
                            }
                        }
                    }}
                >
                    <Tab icon={<DashboardIcon />} iconPosition="start" label="Resumen General" />
                    <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Análisis de Edad" />
                    <Tab icon={<BusinessIcon />} iconPosition="start" label="Distribución Organizacional" />
                    <Tab icon={<AccountTreeIcon />} iconPosition="start" label="Estructura Jerárquica" />
                </Tabs>
            </Box>

            {/* Tab 0: Resumen General */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {/* Estadísticas principales */}
                    <Grid item xs={12} md={3}>
                        <StatCard 
                            title="Total de Agentes Municipales" 
                            value={totalAgents.toLocaleString()} 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard 
                            title="Funciones Únicas Registradas" 
                            value={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').length} 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard 
                            title="Tipos de Situación de Revista" 
                            value={agentsByEmploymentType.length} 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard 
                            title="Secretarías" 
                            value={agentsBySecretaria.length} 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>

                    {/* Gráficos principales - AMBOS CON MISMA ALTURA */}
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChartUnified 
                            data={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                            title="Distribución de Agentes por Función (Top 10)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
                            height={500} // Altura fija para ambos
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChartUnified 
                            data={agentsByEmploymentType} 
                            title="Agentes por Situación de Revista" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="type"
                            height={500} // Misma altura
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tab 1: Análisis de Edad */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Análisis de Edad de los Agentes Municipales
                        </Typography>
                        {ageDistribution?.note && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {ageDistribution.note}
                            </Alert>
                        )}
                    </Grid>
                    
                    {/* Gráfico de rangos de edad principal */}
                    <Grid item xs={12}>
                        {ageDistribution ? (
                            <CustomBarChart 
                                data={ageDistribution.rangeData} 
                                xKey="range" 
                                barKey="count" 
                                title="Distribución por Rangos de Edad" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                <CircularProgress size={40} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis de edad...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Rangos de edad con área chart */}
                    <Grid item xs={12} lg={6}>
                        {ageDistribution ? (
                            <CustomAreaChartLocal 
                                data={ageDistribution.rangeData} 
                                title="Distribución por Rangos de Edad (Visualización de Área)" 
                                isDarkMode={isDarkMode}
                                xKey="range"
                                yKey="count"
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                            </Box>
                        )}
                    </Grid>

                    {/* Edad promedio por función */}
                    <Grid item xs={12} lg={6}>
                        {ageByFunction.length > 0 ? (
                            <CustomBarChart 
                                data={ageByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                                xKey="function" 
                                barKey="avgAge" 
                                title="Edad Promedio por Función (Top 10)" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* Tab 2: Distribución Organizacional */}
            {tabValue === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Distribución Organizacional
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomDonutChartUnified 
                            data={agentsBySecretaria.slice(0, 8)} 
                            title="Agentes por Secretaría (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChartUnified 
                            data={agentsByDependency.slice(0, 8)} 
                            title="Agentes por Dependencia (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="dependency"
                        />
                    </Grid>

                    {/* Gráfico de subsecretarías MÁS GRANDE */}
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={filterValidData(agentsBySubsecretaria, 'subsecretaria').slice(0, 10)} 
                            xKey="subsecretaria" 
                            barKey="count" 
                            title="Agentes por Subsecretaría (Top 10)" 
                            isDarkMode={isDarkMode}
                            height={500} // Aumentado de 400 a 500
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tab 3: Estructura Jerárquica */}
            {tabValue === 3 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Estructura Jerárquica Detallada
                        </Typography>
                    </Grid>

                    {/* GRÁFICOS HORIZONTALES para direcciones */}
                    <Grid item xs={12} lg={6}>
                        <CustomHorizontalBarChart 
                            data={filterValidData(agentsByDireccionGeneral, 'direccionGeneral').slice(0, 10)} 
                            xKey="direccionGeneral" 
                            barKey="count" 
                            title="Agentes por Dirección General (Top 10)" 
                            isDarkMode={isDarkMode}
                            height={500}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomHorizontalBarChart 
                            data={filterValidData(agentsByDireccion, 'direccion').slice(0, 10)} 
                            xKey="direccion" 
                            barKey="count" 
                            title="Agentes por Dirección (Top 10)" 
                            isDarkMode={isDarkMode}
                            height={500}
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomDonutChartUnified 
                            data={filterValidData(agentsByDepartamento, 'departamento').slice(0, 8)} 
                            title="Agentes por Departamento (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChartUnified 
                            data={filterValidData(agentsByDivision, 'division').slice(0, 8)} 
                            title="Agentes por División (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="division"
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default DashboardPage;