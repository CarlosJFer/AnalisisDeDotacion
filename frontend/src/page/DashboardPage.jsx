import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Grid, Button } from '@mui/material';
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


// Función para hacer peticiones con reintentos
const fetchWithRetry = async (url, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await apiClient.get(url);
            return response;
        } catch (error) {
            console.warn(`Intento ${i + 1} fallido para ${url}:`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Función para hacer peticiones en lotes
const fetchInBatches = async (urls, batchSize = 5) => {
    const results = [];
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchPromises = batch.map(url => fetchWithRetry(url));
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Pequeña pausa entre lotes
        if (i + batchSize < urls.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    return results;
};

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
    const [ageByArea, setAgeByArea] = useState([]);
    const [agentsByFunction, setAgentsByFunction] = useState([]);
    const [agentsByEmploymentType, setAgentsByEmploymentType] = useState([]);
    const [agentsByDependency, setAgentsByDependency] = useState([]);
    const [agentsBySecretaria, setAgentsBySecretaria] = useState([]);
    const [agentsBySubsecretaria, setAgentsBySubsecretaria] = useState([]);
    const [agentsByDireccionGeneral, setAgentsByDireccionGeneral] = useState([]);
    const [agentsByDireccion, setAgentsByDireccion] = useState([]);
    const [agentsByDepartamento, setAgentsByDepartamento] = useState([]);
    const [agentsByDivision, setAgentsByDivision] = useState([]);
    // Estados para Neikes y Beca
    const [agentsByFunctionNeikeBeca, setAgentsByFunctionNeikeBeca] = useState([]);
    const [agentsByEmploymentTypeNeikeBeca, setAgentsByEmploymentTypeNeikeBeca] = useState([]);
    // Estados para análisis de edad de Neikes y Beca
    const [ageDistributionNeikeBeca, setAgeDistributionNeikeBeca] = useState(null);
    const [ageByFunctionNeikeBeca, setAgeByFunctionNeikeBeca] = useState([]);
    const [ageByAreaNeikeBeca, setAgeByAreaNeikeBeca] = useState([]);
    // Estados adicionales para Neikes y Beca
    const [agentsBySecretariaNeikeBeca, setAgentsBySecretariaNeikeBeca] = useState([]);
    const [agentsByDependencyNeikeBeca, setAgentsByDependencyNeikeBeca] = useState([]);
    const [agentsBySubsecretariaNeikeBeca, setAgentsBySubsecretariaNeikeBeca] = useState([]);
    const [agentsByDireccionGeneralNeikeBeca, setAgentsByDireccionGeneralNeikeBeca] = useState([]);
    const [agentsByDireccionNeikeBeca, setAgentsByDireccionNeikeBeca] = useState([]);
    const [agentsByDepartamentoNeikeBeca, setAgentsByDepartamentoNeikeBeca] = useState([]);
    const [agentsByDivisionNeikeBeca, setAgentsByDivisionNeikeBeca] = useState([]);

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
                // Definir todas las URLs
                const urls = [
                    '/analytics/agents/total',
                    '/analytics/agents/age-distribution',
                    '/analytics/agents/age-by-function',
                    '/analytics/agents/age-by-secretaria',
                    '/analytics/agents/by-function',
                    '/analytics/agents/by-employment-type',
                    '/analytics/agents/by-dependency',
                    '/analytics/agents/by-secretaria',
                    '/analytics/agents/by-subsecretaria',
                    '/analytics/agents/by-direccion-general',
                    '/analytics/agents/by-direccion',
                    '/analytics/agents/by-departamento',
                    '/analytics/agents/by-division',
                    '/analytics/agents/by-function-neike-beca',
                    '/analytics/agents/by-employment-type-neike-beca',
                    '/analytics/agents/age-distribution-neike-beca',
                    '/analytics/agents/age-by-function-neike-beca',
                    '/analytics/agents/age-by-secretaria-neike-beca',
                    '/analytics/agents/by-secretaria-neike-beca',
                    '/analytics/agents/by-dependency-neike-beca',
                    '/analytics/agents/by-subsecretaria-neike-beca',
                    '/analytics/agents/by-direccion-general-neike-beca',
                    '/analytics/agents/by-direccion-neike-beca',
                    '/analytics/agents/by-departamento-neike-beca',
                    '/analytics/agents/by-division-neike-beca'
                ];

                // Hacer peticiones en lotes de 5
                const results = await fetchInBatches(urls, 5);

                // Procesar resultados
                const successfulResults = results.map((result, index) => {
                    if (result.status === 'fulfilled') {
                        return result.value.data;
                    } else {
                        console.error(`Error en petición ${index} (${urls[index]}):`, result.reason);
                        return null;
                    }
                });

                // Asignar datos con verificación de nulos
                setTotalAgents(successfulResults[0]?.total || 0);
                setAgeDistribution(successfulResults[1] || null);
                setAgeByFunction(successfulResults[2] || []);
                setAgeByArea(successfulResults[3] || []);
                setAgentsByFunction(successfulResults[4] || []);
                setAgentsByEmploymentType(successfulResults[5] || []);
                setAgentsByDependency(successfulResults[6] || []);
                setAgentsBySecretaria(successfulResults[7] || []);
                setAgentsBySubsecretaria(successfulResults[8] || []);
                setAgentsByDireccionGeneral(successfulResults[9] || []);
                setAgentsByDireccion(successfulResults[10] || []);
                setAgentsByDepartamento(successfulResults[11] || []);
                setAgentsByDivision(successfulResults[12] || []);
                setAgentsByFunctionNeikeBeca(successfulResults[13] || []);
                setAgentsByEmploymentTypeNeikeBeca(successfulResults[14] || []);
                setAgeDistributionNeikeBeca(successfulResults[15] || null);
                setAgeByFunctionNeikeBeca(successfulResults[16] || []);
                setAgeByAreaNeikeBeca(successfulResults[17] || []);
                setAgentsBySecretariaNeikeBeca(successfulResults[18] || []);
                setAgentsByDependencyNeikeBeca(successfulResults[19] || []);
                setAgentsBySubsecretariaNeikeBeca(successfulResults[20] || []);
                setAgentsByDireccionGeneralNeikeBeca(successfulResults[21] || []);
                setAgentsByDireccionNeikeBeca(successfulResults[22] || []);
                setAgentsByDepartamentoNeikeBeca(successfulResults[23] || []);
                setAgentsByDivisionNeikeBeca(successfulResults[24] || []);

                // Verificar si hay errores críticos
                const failedRequests = results.filter(result => result.status === 'rejected').length;
                if (failedRequests > 0) {
                    console.warn(`${failedRequests} peticiones fallaron, pero se cargaron los datos disponibles.`);
                }

            } catch (err) {
                setError('Error al cargar los datos del dashboard. Algunos datos pueden no estar disponibles.');
                console.error('Error general:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
                <Typography sx={{ mt: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                    Cargando datos del dashboard...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ m: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button 
                    variant="contained" 
                    onClick={() => window.location.reload()}
                    sx={{ mt: 2 }}
                >
                    Reintentar
                </Button>
            </Box>
        );
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

            {/* Botones de navegación - SOLO 3 PESTAÑAS */}
            <Box sx={{ 
                mb: 4,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'center',
                pt: 2,
            }}>
                <Button 
                    onClick={() => setTabValue(0)}
                    startIcon={<DashboardIcon />}
                    sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        background: tabValue === 0 
                            ? 'linear-gradient(135deg, #2196f3, #1976d2)'
                            : isDarkMode 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(255, 255, 255, 0.7)',
                        border: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        ...(tabValue === 0 && {
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        }),
                        '&:hover': {
                            background: tabValue === 0 
                                ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                                : isDarkMode 
                                    ? 'rgba(33, 150, 243, 0.2)' 
                                    : 'rgba(33, 150, 243, 0.15)',
                            color: tabValue === 0 ? 'white' : isDarkMode ? '#64b5f6' : '#1976d2',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Resumen General
                </Button>
                
                <Button 
                    onClick={() => setTabValue(1)}
                    startIcon={<AnalyticsIcon />}
                    sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        background: tabValue === 1 
                            ? 'linear-gradient(135deg, #2196f3, #1976d2)'
                            : isDarkMode 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(255, 255, 255, 0.7)',
                        border: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        ...(tabValue === 1 && {
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        }),
                        '&:hover': {
                            background: tabValue === 1 
                                ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                                : isDarkMode 
                                    ? 'rgba(33, 150, 243, 0.2)' 
                                    : 'rgba(33, 150, 243, 0.15)',
                            color: tabValue === 1 ? 'white' : isDarkMode ? '#64b5f6' : '#1976d2',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Análisis de Edad
                </Button>
                
                <Button 
                    onClick={() => setTabValue(2)}
                    startIcon={<BusinessIcon />}
                    sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        background: tabValue === 2 
                            ? 'linear-gradient(135deg, #2196f3, #1976d2)'
                            : isDarkMode 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(255, 255, 255, 0.7)',
                        border: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        ...(tabValue === 2 && {
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        }),
                        '&:hover': {
                            background: tabValue === 2 
                                ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                                : isDarkMode 
                                    ? 'rgba(33, 150, 243, 0.2)' 
                                    : 'rgba(33, 150, 243, 0.15)',
                            color: tabValue === 2 ? 'white' : isDarkMode ? '#64b5f6' : '#1976d2',
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode
                                ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                                : '0 6px 20px rgba(33, 150, 243, 0.2)',
                        },
                        transition: 'all 0.3s ease',
                    }}
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

                    {/* Gráficos principales - AMBOS CON MISMA ALTURA */}
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                            title="Distribución de Agentes por Función (Top 10) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
                            height={500} // Altura fija para ambos
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByEmploymentType} 
                            title="Agentes por Situación de Revista - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="type"
                            height={500} // Misma altura
                        />
                    </Grid>
                    {/* NUEVOS GRÁFICOS PARA NEIKES Y BECA */}
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByFunctionNeikeBeca.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                            title="Distribución de Agentes por Función (Top 10) - Neikes y Beca" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
                            height={500}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByEmploymentTypeNeikeBeca} 
                            title="Agentes por Situación de Revista - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="type"
                            height={500}
                        />
                    </Grid>
                </Grid>
            )}

            {/* Tab 1: Análisis de Edad COMPLETO */}
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
                    
                    {/* Gráfico de rangos de edad principal - PLANTA Y CONTRATOS */}
                    <Grid item xs={12}>
                        {ageDistribution ? (
                            <CustomBarChart 
                                data={ageDistribution.rangeData} 
                                xKey="range" 
                                barKey="count" 
                                title="Distribución por Rangos de Edad - Planta y Contratos" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                <CircularProgress size={40} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis de edad...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Gráfico de rangos de edad - NEIKES Y BECAS */}
                    <Grid item xs={12}>
                        {ageDistributionNeikeBeca ? (
                            <CustomBarChart 
                                data={ageDistributionNeikeBeca.rangeData} 
                                xKey="range" 
                                barKey="count" 
                                title="Distribución por Rangos de Edad - Neikes y Becas" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                <CircularProgress size={40} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis de edad Neikes y Becas...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Edad promedio por área (secretaría) - PLANTA Y CONTRATOS */}
                    <Grid item xs={12} lg={6}>
                        {ageByArea.length > 0 ? (
                            <CustomAreaChart 
                                data={ageByArea.filter(a => a.secretaria && a.secretaria.trim() !== '' && a.secretaria.trim() !== '-').slice(0, 10)} 
                                title="Distribución por rangos de edad según el área (Top 10) - Planta y Contratos" 
                                isDarkMode={isDarkMode}
                                xKey="secretaria"
                                yKey="avgAge"
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis por área...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Edad promedio por función - PLANTA Y CONTRATOS */}
                    <Grid item xs={12} lg={6}>
                        {ageByFunction.length > 0 ? (
                            <CustomBarChart 
                                data={ageByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                                xKey="function" 
                                barKey="avgAge" 
                                title="Edad Promedio por Función (Top 10) - Planta y Contratos" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                            </Box>
                        )}
                    </Grid>

                    {/* Edad promedio por área (secretaría) - NEIKES Y BECAS */}
                    <Grid item xs={12} lg={6}>
                        {ageByAreaNeikeBeca.length > 0 ? (
                            <CustomAreaChart 
                                data={ageByAreaNeikeBeca.filter(a => a.secretaria && a.secretaria.trim() !== '' && a.secretaria.trim() !== '-').slice(0, 10)} 
                                title="Distribución por rangos de edad según el área (Top 10) - Neikes y Becas" 
                                isDarkMode={isDarkMode}
                                xKey="secretaria"
                                yKey="avgAge"
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis por área Neikes y Becas...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Edad promedio por función - NEIKES Y BECAS */}
                    <Grid item xs={12} lg={6}>
                        {ageByFunctionNeikeBeca.length > 0 ? (
                            <CustomBarChart 
                                data={ageByFunctionNeikeBeca.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)} 
                                xKey="function" 
                                barKey="avgAge" 
                                title="Edad Promedio por Función (Top 10) - Neikes y Becas" 
                                isDarkMode={isDarkMode} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                                <Typography sx={{ ml: 2 }}>Cargando análisis por función Neikes y Becas...</Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* Tab 2: Distribución Organizacional COMPLETA (incluye estructura jerárquica) */}
            {tabValue === 2 && (
                <Grid container spacing={3}>

                    {/* SECCIÓN 1: DISTRIBUCIÓN PRINCIPAL */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Secretarias, Subsecretarias y Dependencias - Planta y Contratos
                        </Typography>
                    </Grid>

                    {/* Gráficos de anillo principales */}
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart 
                            data={agentsBySecretaria.slice(0, 8)} 
                            title="Agentes por Secretaría (Top 8) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart 
                            data={agentsByDependency.slice(0, 8)} 
                            title="Agentes por Dependencia (Top 8) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="dependency"
                            height={600}
                        />
                    </Grid>

                    {/* Gráfico de subsecretarías */}
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={filterValidData(agentsBySubsecretaria, 'subsecretaria').slice(0, 10)} 
                            xKey="subsecretaria" 
                            barKey="count" 
                            title="Agentes por Subsecretaría (Top 10) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>

                    {/* SECCIÓN 1.2: DISTRIBUCIÓN PRINCIPAL - NEIKES Y BECAS */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Secretarias, Subsecretarias y Dependencias - Neikes y Becas
                        </Typography>
                    </Grid>

                    {/* Gráficos de anillo principales - Neikes y Becas */}
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart 
                            data={agentsBySecretariaNeikeBeca ? agentsBySecretariaNeikeBeca.slice(0, 8) : []} 
                            title="Agentes por Secretaría (Top 8) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart 
                            data={agentsByDependencyNeikeBeca ? agentsByDependencyNeikeBeca.slice(0, 8) : []} 
                            title="Agentes por Dependencia (Top 8) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="dependency"
                            height={600}
                        />
                    </Grid>

                    {/* Gráfico de subsecretarías - Neikes y Becas */}
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={agentsBySubsecretariaNeikeBeca ? filterValidData(agentsBySubsecretariaNeikeBeca, 'subsecretaria').slice(0, 10) : []} 
                            xKey="subsecretaria" 
                            barKey="count" 
                            title="Agentes por Subsecretaría (Top 10) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>

                    {/* SECCIÓN 2: ESTRUCTURA JERÁRQUICA DETALLADA */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Dirección Generales y Direcciones - Planta y Contratos
                        </Typography>
                    </Grid>

                    {/* Direcciones Generales y Direcciones */}
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={filterValidData(agentsByDireccionGeneral, 'direccionGeneral').slice(0, 10)} 
                            xKey="direccionGeneral" 
                            barKey="count" 
                            title="Agentes por Dirección General (Top 10) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={filterValidData(agentsByDireccion, 'direccion').slice(0, 10)} 
                            xKey="direccion" 
                            barKey="count" 
                            title="Agentes por Dirección (Top 10) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>

                    {/* SECCIÓN 2.2: ESTRUCTURA JERÁRQUICA DETALLADA - NEIKES Y BECAS */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Dirección Generales y Direcciones - Neikes y Becas
                        </Typography>
                    </Grid>

                    {/* Direcciones Generales y Direcciones - Neikes y Becas */}
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={agentsByDireccionGeneralNeikeBeca ? filterValidData(agentsByDireccionGeneralNeikeBeca, 'direccionGeneral').slice(0, 10) : []} 
                            xKey="direccionGeneral" 
                            barKey="count" 
                            title="Agentes por Dirección General (Top 10) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomBarChart 
                            data={agentsByDireccionNeikeBeca ? filterValidData(agentsByDireccionNeikeBeca, 'direccion').slice(0, 10) : []} 
                            xKey="direccion" 
                            barKey="count" 
                            title="Agentes por Dirección (Top 10) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            height={600}
                        />
                    </Grid>

                    {/* SECCIÓN 3: NIVELES OPERATIVOS */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Departamentos y Divisiones - Planta y Contratos
                        </Typography>
                    </Grid>

                    {/* Departamentos y Divisiones */}
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={filterValidData(agentsByDepartamento, 'departamento').slice(0, 8)} 
                            title="Agentes por Departamento (Top 8) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={filterValidData(agentsByDivision, 'division').slice(0, 8)} 
                            title="Agentes por División (Top 8) - Planta y Contratos" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="division"
                            height={600}
                        />
                    </Grid>

                    {/* SECCIÓN 3.2: NIVELES OPERATIVOS - NEIKES Y BECAS */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                            📊 Distribución Principal por Departamentos y Divisiones - Neikes y Becas
                        </Typography>
                    </Grid>

                    {/* Departamentos y Divisiones - Neikes y Becas */}
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByDepartamentoNeikeBeca ? filterValidData(agentsByDepartamentoNeikeBeca, 'departamento').slice(0, 8) : []} 
                            title="Agentes por Departamento (Top 8) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                            height={600}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart 
                            data={agentsByDivisionNeikeBeca ? filterValidData(agentsByDivisionNeikeBeca, 'division').slice(0, 8) : []} 
                            title="Agentes por División (Top 8) - Neikes y Becas" 
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="division"
                            height={600}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default DashboardPage;