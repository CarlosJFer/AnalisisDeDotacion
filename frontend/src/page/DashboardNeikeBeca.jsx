import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Grid, Button, Fab, Tooltip } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessIcon from '@mui/icons-material/Business';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StatCard from '../components/StatCard';
import CustomBarChart from '../components/CustomBarChart';
import CustomDonutChart from '../components/CustomDonutChart';
import CustomAreaChart from '../components/CustomAreaChart';
import DependencyFilter from '../components/DependencyFilter.jsx';

// Returns previous month's start and end dates in 'es-AR' format
const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
    const firstDayPreviousMonth = new Date(
        lastDayPreviousMonth.getFullYear(),
        lastDayPreviousMonth.getMonth(),
        1
    );
    const format = (d) => d.toLocaleDateString('es-AR');
    return {
        start: format(firstDayPreviousMonth),
        end: format(lastDayPreviousMonth),
    };
};

const DashboardNeikeBeca = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [filters, setFilters] = useState({
        secretaria: '',
        subsecretaria: '',
        direccionGeneral: '',
        direccion: '',
        departamento: '',
        division: '',
        funcion: ''
    });
    
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

    const [seniorityData, setSeniorityData] = useState([]);
    const [secondaryData, setSecondaryData] = useState(null);
    const [tertiaryData, setTertiaryData] = useState(null);
    const [universityData, setUniversityData] = useState(null);
    const [topUniSecretariasData, setTopUniSecretariasData] = useState([]);
    const [topTerSecretariasData, setTopTerSecretariasData] = useState([]);

    const [registrationTypeData, setRegistrationTypeData] = useState([]);
    const [entryTimeData, setEntryTimeData] = useState([]);
    const [exitTimeData, setExitTimeData] = useState([]);
    const [topUnitsData, setTopUnitsData] = useState([]);
    const [expTopInitiators, setExpTopInitiators] = useState([]);
    const [expByTramite, setExpByTramite] = useState([]);
    const { start: expStart, end: expEnd } = getPreviousMonthRange();

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

    const fetchAllData = async (appliedFilters = filters) => {
        setLoading(true);
        setError('');

        try {
            const funcRes = await apiClient.get('/functions');
            const funcs = funcRes.data.reduce((acc, f) => { acc[f.name] = f.endpoint; return acc; }, {});

            // Obtiene datos de forma segura: si falta el endpoint o la petición falla,
            // devuelve el valor por defecto. En caso contrario, retorna solo el campo
            // `data` de la respuesta.
            const safeGet = async (endpoint, defaultData, plantilla) => {
                if (!endpoint) return defaultData;
                const params = Object.fromEntries(
                    Object.entries(appliedFilters).filter(([, v]) => v)
                );
                if (plantilla) {
                    params.plantilla = plantilla;
                }
                try {
                    const res = await apiClient.get(endpoint, { params });
                    return res.data;
                } catch {
                    return defaultData;
                }
            };

            // Ajustar nombres de plantillas a los mismos usados en el backend.
            const TEMPLATE_NEIKES_BECAS = 'Rama completa - Neikes y Beca';
            const TEMPLATE_DATOS_NEIKES = 'Datos concurso - Neikes y Beca';
            const TEMPLATE_CONTROL_NEIKES = 'Control de certificaciones - Neikes y Becas';
            const TEMPLATE_EXPEDIENTES = 'Expedientes';
            const [
                totalData,
                ageDistData,
                ageFunctionData,
                functionData,
                employmentData,
                dependencyData,
                secretariaData,
                subsecretariaData,
                direccionGeneralData,
                direccionData,
                departamentoData,
                divisionData,
                seniorityRes,
                secondaryRes,
                tertiaryRes,
                universityRes,
                topUniRes,
                topTerRes,
                regTypeRes,
                entryTimeRes,
                exitTimeRes,
                topUnitsRes,
                topInitiatorsData,
                byTramiteData
            ] = await Promise.all([
                // Datos correspondientes a la plantilla "Rama completa - Neikes y Beca"
                safeGet(funcs.totalAgents, { total: 0 }, TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.ageDistribution, null, TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.ageByFunction, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByFunction, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByEmploymentType, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByDependency, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsBySecretaria, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsBySubsecretaria, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByDireccionGeneral, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByDireccion, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByDepartamento, [], TEMPLATE_NEIKES_BECAS),
                safeGet(funcs.agentsByDivision, [], TEMPLATE_NEIKES_BECAS),
                // Datos para antigüedad y estudios
                safeGet(funcs.agentsBySeniority, [], TEMPLATE_DATOS_NEIKES),
                safeGet(funcs.agentsBySecondaryStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_NEIKES),
                safeGet(funcs.agentsByTertiaryStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_NEIKES),
                safeGet(funcs.agentsByUniversityStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_NEIKES),
                safeGet(funcs.agentsByTopSecretariasUniversity, [], TEMPLATE_DATOS_NEIKES),
                safeGet(funcs.agentsByTopSecretariasTertiary, [], TEMPLATE_DATOS_NEIKES),
                // Datos para control de certificaciones
                safeGet(funcs.certificationsRegistrationType, [], TEMPLATE_CONTROL_NEIKES),
                safeGet(funcs.certificationsEntryTime, [], TEMPLATE_CONTROL_NEIKES),
                safeGet(funcs.certificationsExitTime, [], TEMPLATE_CONTROL_NEIKES),
                safeGet(funcs.certificationsTopUnits, [], TEMPLATE_CONTROL_NEIKES),
                // Expedientes
                safeGet(funcs.expedientesTopInitiators, [], TEMPLATE_EXPEDIENTES),
                safeGet(funcs.expedientesByTramite, [], TEMPLATE_EXPEDIENTES)
            ]);

            setTotalAgents(totalData.total);
            setAgeDistribution(ageDistData);
            setAgeByFunction(ageFunctionData);
            setAgentsByFunction(functionData);
            setAgentsByEmploymentType(employmentData);
            setAgentsByDependency(dependencyData);
            setAgentsBySecretaria(secretariaData);
            setAgentsBySubsecretaria(subsecretariaData);
            setAgentsByDireccionGeneral(direccionGeneralData);
            setAgentsByDireccion(direccionData);
            setAgentsByDepartamento(departamentoData);
            setAgentsByDivision(divisionData);
            setSeniorityData(seniorityRes);
            setSecondaryData(secondaryRes);
            setTertiaryData(tertiaryRes);
            setUniversityData(universityRes);
            setTopUniSecretariasData(topUniRes);
            setTopTerSecretariasData(topTerRes);
            setRegistrationTypeData(regTypeRes);
            setEntryTimeData(entryTimeRes);
            setExitTimeData(exitTimeRes);
            setTopUnitsData(topUnitsRes);
            setExpTopInitiators(topInitiatorsData);
            setExpByTramite(byTramiteData);

        } catch (err) {
            setError('Error al cargar los datos del dashboard. Por favor, contacta al administrador.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        fetchAllData(newFilters);
    };

    useEffect(() => {
        fetchAllData(filters);
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
                Dashboard - Neikes y Becas
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

            <DependencyFilter filters={filters} onFilter={handleApplyFilters} />

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
                <Button
                    onClick={() => setTabValue(3)}
                    startIcon={<SchoolIcon />}
                    sx={getTabButtonStyles(3)}
                >
                    Antigüedad y Estudios
                </Button>
                <Button
                    onClick={() => setTabValue(4)}
                    startIcon={<AssignmentTurnedInIcon />}
                    sx={getTabButtonStyles(4)}
                >
                    Control de certificaciones – Neikes y Becas
                </Button>
                <Button
                    onClick={() => setTabValue(5)}
                    startIcon={<FolderOpenIcon />}
                    sx={getTabButtonStyles(5)}
                >
                    Expedientes
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
                            title="Distribución de Agentes por Función (Top 10) - Neikes y Beca"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
                        />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <CustomDonutChart
                            data={agentsByEmploymentType}
                            title="Agentes por Situación de Revista - Neikes y Beca"
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
                                title="Distribución por Rangos de Edad - Neikes y Beca"
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
                                title="Distribución por Rangos de Edad según el área - Neikes y Beca"
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
                    <Grid item xs={12} lg={6}>
                        {ageByFunction.length > 0 ? (
                            <CustomBarChart
                                data={ageByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').slice(0, 10)}
                                xKey="function"
                                barKey="avgAge"
                                title="Edad Promedio por Función (Top 10) - Neikes y Beca"
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
                            title="Agentes por Secretaría (Top 8) - Neikes y Beca"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart
                            data={agentsByDependency.slice(0, 8)}
                            title="Agentes por Dependencia (Top 8) - Neikes y Beca"
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
                            title="Agentes por Subsecretaría (Top 10) - Neikes y Beca"
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
                            title="Agentes por Dirección General (Top 10) - Neikes y Beca"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomBarChart
                            data={filterValidData(agentsByDireccion, 'direccion').slice(0, 10)}
                            xKey="direccion"
                            barKey="count"
                            title="Agentes por Dirección (Top 10) - Neikes y Beca"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart
                            data={filterValidData(agentsByDepartamento, 'departamento').slice(0, 8)}
                            title="Agentes por Departamento (Top 8) - Neikes y Beca"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                    <CustomDonutChart
                        data={filterValidData(agentsByDivision, 'division').slice(0, 8)}
                        title="Agentes por División (Top 8) - Neikes y Beca"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="division"
                    />
                </Grid>
            </Grid>
        )}

        {/* Tab 3: Antigüedad y Estudios */}
        {tabValue === 3 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Antigüedad y Estudios
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomBarChart
                        data={seniorityData}
                        xKey="range"
                        barKey="count"
                        title="Cantidad de agentes según antigüedad municipal"
                        isDarkMode={isDarkMode}
                        height={400}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomDonutChart
                        data={[
                            { category: 'Con título secundario', count: secondaryData?.conTitulo || 0 },
                            { category: 'Otros', count: secondaryData?.otros || 0 }
                        ]}
                        title="Agentes según estudios secundarios"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="category"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomDonutChart
                        data={[
                            { category: 'Con título terciario', count: tertiaryData?.conTitulo || 0 },
                            { category: 'Otros', count: tertiaryData?.otros || 0 }
                        ]}
                        title="Agentes según estudios terciarios"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="category"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomDonutChart
                        data={[
                            { category: 'Con título universitario', count: universityData?.conTitulo || 0 },
                            { category: 'Otros', count: universityData?.otros || 0 }
                        ]}
                        title="Agentes según estudios universitarios"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="category"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomBarChart
                        data={topUniSecretariasData}
                        xKey="secretaria"
                        barKey="count"
                        title="Top 10 secretarías con más agentes con título universitario"
                        isDarkMode={isDarkMode}
                        height={400}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomBarChart
                        data={topTerSecretariasData}
                        xKey="secretaria"
                        barKey="count"
                        title="Top 10 secretarías con más agentes con título terciario"
                        isDarkMode={isDarkMode}
                        height={400}
                    />
                </Grid>
            </Grid>
        )}

        {/* Tab 4: Control de certificaciones */}
        {tabValue === 4 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Control de certificaciones – Neikes y Becas
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <CustomBarChart
                        data={registrationTypeData}
                        xKey="tipo"
                        barKey="count"
                        title="Cantidad de agentes según tipo de registración"
                        isDarkMode={isDarkMode}
                        height={400}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <CustomDonutChart
                        data={entryTimeData}
                        title="Agentes según horario de entrada"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="time"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <CustomDonutChart
                        data={exitTimeData}
                        title="Agentes según horario de salida"
                        isDarkMode={isDarkMode}
                        dataKey="count"
                        nameKey="time"
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomBarChart
                        data={topUnitsData}
                        xKey="unidad"
                        barKey="count"
                        title="Top 10 unidades de registración con más agentes"
                        isDarkMode={isDarkMode}
                        height={400}
                    />
                </Grid>
            </Grid>
        )}

        {/* Tab 5: Expedientes */}
        {tabValue === 5 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                        Expedientes
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                        Expedientes a mes vencido. Corte del {expStart} al {expEnd}.
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    {expTopInitiators.length > 0 ? (
                        <CustomBarChart
                            data={expTopInitiators}
                            xKey="initiator"
                            barKey="count"
                            title="Top 10 áreas con más trámites gestionados"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    ) : (
                        <Typography align="center">Sin datos</Typography>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {expByTramite.length > 0 ? (
                        <CustomBarChart
                            data={expByTramite}
                            xKey="tramite"
                            barKey="count"
                            title="Cantidad de expedientes según tipo de trámite"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    ) : (
                        <Typography align="center">Sin datos</Typography>
                    )}
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

export default DashboardNeikeBeca;

