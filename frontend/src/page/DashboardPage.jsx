import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Grid, Button, Fab, Tooltip } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessIcon from '@mui/icons-material/Business';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import StatCard from '../components/StatCard';
import CustomBarChart from '../components/CustomBarChart';
import CustomDonutChart from '../components/CustomDonutChart';
import CustomAreaChart from '../components/CustomAreaChart';

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
            // Verificar que el valor existe y es un string antes de usar trim()
            if (!value || typeof value !== 'string') {
                return false;
            }
            const trimmedValue = value.trim();
            return trimmedValue !== '' && trimmedValue !== '-' && trimmedValue !== 'Sin especificar';
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

    const getTabButtonStyles = (value) => ({
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        fontWeight: 600,
        px: 3,
        py: 1.5,
        borderRadius: 3,
        textTransform: 'none',
        fontSize: '0.9rem',
        background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
        border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        ...(tabValue === value && {
            background: 'linear-gradient(135deg, #2196f3, #1976d2)',
            color: 'white',
            transform: 'translateY(-2px)',
            boxShadow: isDarkMode
                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                : '0 6px 20px rgba(33, 150, 243, 0.2)',
        }),
        '&:hover': {
            background: tabValue === value
                ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                : isDarkMode
                    ? 'rgba(33, 150, 243, 0.2)'
                    : 'rgba(33, 150, 243, 0.15)',
            color: tabValue === value
                ? 'white'
                : isDarkMode
                    ? '#64b5f6'
                    : '#1976d2',
            transform: 'translateY(-2px)',
            boxShadow: isDarkMode
                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                : '0 6px 20px rgba(33, 150, 243, 0.2)',
        },
    });

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

            {/* Navegación por botones */}
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    pt: 2,
                }}
            >
                <Button
                    onClick={() => setTabValue(0)}
                    startIcon={<DashboardIcon />}
                    sx={getTabButtonStyles(0)}
                >
                    Resumen General
                </Button>
                <Button
                    onClick={() => setTabValue(1)}
                    startIcon={<AnalyticsIcon />}
                    sx={getTabButtonStyles(1)}
                >
                    Análisis de Edad
                </Button>
                <Button
                    onClick={() => setTabValue(2)}
                    startIcon={<BusinessIcon />}
                    sx={getTabButtonStyles(2)}
                >
                    Distribución Organizacional
                </Button>
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
                    
                    {/* Gráficos principales - AMBOS USANDO EL MISMO COMPONENTE */}
                    <Grid item xs={12} lg={8}>
                        <CustomDonutChart
                            data={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                            title="Distribución de Agentes por Función (Top 10)" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
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
                            data={filterValidData(agentsBySubsecretaria, 'subsecretaria').slice(0, 10)}
                            xKey="subsecretaria"
                            barKey="count"
                            title="Agentes por Subsecretaría (Top 10)"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                            Estructura Jerárquica Detallada
                        </Typography>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomBarChart
                            data={filterValidData(agentsByDireccionGeneral, 'direccionGeneral').slice(0, 10)}
                            xKey="direccionGeneral"
                            barKey="count"
                            title="Agentes por Dirección General (Top 10)"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomBarChart
                            data={filterValidData(agentsByDireccion, 'direccion').slice(0, 10)}
                            xKey="direccion"
                            barKey="count"
                            title="Agentes por Dirección (Top 10)"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart
                            data={filterValidData(agentsByDepartamento, 'departamento').slice(0, 8)}
                            title="Agentes por Departamento (Top 8)"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart
                            data={filterValidData(agentsByDivision, 'division').slice(0, 8)}
                            title="Agentes por División (Top 8)"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="division"
                        />
                    </Grid>
                </Grid>
            )}

            {user?.role === 'admin' && (
                <>
                    <Tooltip title={cleaning ? 'Limpiando...' : 'Limpiar Dashboard'}>
                        <Fab
                            onClick={handleLimpiarDashboard}
                            disabled={cleaning}
                            sx={{
                                position: 'fixed',
                                bottom: 24,
                                right: 24,
                                color: 'white',
                                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                                },
                            }}
                        >
                            {cleaning ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                <CleaningServicesIcon />
                            )}
                        </Fab>
                    </Tooltip>
                    {cleanMsg && (
                        <Alert
                            severity={cleanMsg.includes('Error') ? 'error' : 'success'}
                            sx={{ position: 'fixed', bottom: 90, right: 24, zIndex: 1300 }}
                        >
                            {cleanMsg}
                        </Alert>
                    )}
                </>
            )}

        </Box>
    );
};

export default DashboardPage;