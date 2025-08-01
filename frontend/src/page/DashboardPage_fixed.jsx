import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Grid, Tabs, Tab, Button } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import CustomDonutChart from '../components/DonutChart.jsx';
import CustomAreaChart from '../components/AreaChart.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../services/api';

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

const CustomBarChart = React.memo(({ data, xKey, barKey, title, isDarkMode }) => {
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
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                }}
                            />
                            <Legend 
                                wrapperStyle={{
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                }}
                            />
                            <Bar dataKey={barKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
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
                        color="error"
                        onClick={handleLimpiarDashboard}
                        disabled={cleaning}
                    >
                        {cleaning ? 'Limpiando...' : 'Limpiar Dashboard'}
                    </Button>
                </Box>
            )}
            {cleanMsg && (
                <Alert severity={cleanMsg.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>{cleanMsg}</Alert>
            )}

            {/* Tabs para organizar el contenido */}
            <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                sx={{ 
                    mb: 4,
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#2196f3',
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        minHeight: 48,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-selected': {
                            color: '#2196f3',
                            fontWeight: 600
                        }
                    }
                }}
            >
                <Tab label="Resumen General" />
                <Tab label="Análisis de Edad" />
                <Tab label="Distribución Organizacional" />
                <Tab label="Estructura Jerárquica" />
            </Tabs>

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
                            title="Funciones Diferentes" 
                            value={agentsByFunction.length} 
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

                    {/* Gráficos principales */}
                    <Grid item xs={12} lg={8}>
                        <CustomBarChart 
                            data={agentsByFunction} 
                            xKey="function" 
                            barKey="count" 
                            title="Distribución de Agentes por Función" 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <CustomDonutChart 
                            data={agentsByEmploymentType} 
                            title="Agentes por Situación de Revista" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="type"
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
                            <CustomAreaChart 
                                data={ageDistribution.rangeData} 
                                title="Distribución por Rangos de Edad (Área)" 
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
                                data={ageByFunction.slice(0, 10)} 
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
                        <CustomDonutChart 
                            data={agentsBySecretaria.slice(0, 8)} 
                            title="Agentes por Secretaría (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart 
                            data={agentsByDependency.slice(0, 8)} 
                            title="Agentes por Dependencia (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="dependency"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={agentsBySubsecretaria.slice(0, 12)} 
                            xKey="subsecretaria" 
                            barKey="count" 
                            title="Agentes por Subsecretaría (Top 12)" 
                            isDarkMode={isDarkMode} 
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

                    <Grid item xs={12} lg={6}>
                        <CustomBarChart 
                            data={agentsByDireccionGeneral.slice(0, 10)} 
                            xKey="direccionGeneral" 
                            barKey="count" 
                            title="Agentes por Dirección General (Top 10)" 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomBarChart 
                            data={agentsByDireccion.slice(0, 10)} 
                            xKey="direccion" 
                            barKey="count" 
                            title="Agentes por Dirección (Top 10)" 
                            isDarkMode={isDarkMode} 
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByDepartamento.slice(0, 8)} 
                            title="Agentes por Departamento (Top 8)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByDivision.slice(0, 8)} 
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