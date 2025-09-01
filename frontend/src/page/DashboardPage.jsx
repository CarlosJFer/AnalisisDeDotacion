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
import PhoneIcon from '@mui/icons-material/Phone';
import StatCard from '../components/StatCard';
import CustomBarChart from '../components/CustomBarChart';
import CustomDonutChart from '../components/CustomDonutChart';
import CustomAreaChart from '../components/CustomAreaChart';
import DependencyFilter from '../components/DependencyFilter.jsx';
import MonthCutoffAlert from '../components/MonthCutoffAlert';
import SacSection from '../components/SACSection';
import { useLocation } from 'react-router-dom';
import { getCurrentMonthRange } from '../utils/dateUtils';

const DashboardPage = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const location = useLocation();
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
    const [funcs, setFuncs] = useState({});
    const [sacViaData, setSacViaData] = useState([]);
    const { startDate, endDate } = getPreviousMonthRange();

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
            const funcMap = funcRes.data.reduce((acc, f) => { acc[f.name] = f.endpoint; return acc; }, {});
            setFuncs(funcMap);

            // Obtiene datos de forma segura: si falta el endpoint o la petición falla,
            // devuelve el valor por defecto. En caso contrario, retorna solo el campo
            // `data` de la respuesta.
            const safeGet = async (endpoint, defaultData, plantilla, extraParams = {}) => {
                if (!endpoint) return defaultData;
                const params = Object.fromEntries(
                    Object.entries(appliedFilters).filter(([, v]) => v)
                );
                if (plantilla) {
                    params.plantilla = plantilla;
                }
                Object.assign(params, extraParams);
                try {
                    const res = await apiClient.get(endpoint, { params });
                    return res.data;
                } catch {
                    return defaultData;
                }
            };

            // Ajustar nombres de plantillas a los mismos usados en el backend.
            const TEMPLATE_PLANTA_CONTRATOS = 'Rama completa - Planta y Contratos';
            const TEMPLATE_DATOS_CONCURSO = 'Datos concurso - Planta y Contratos';
            const TEMPLATE_CONTROL_PLANTA = 'Control de certificaciones - Planta y Contratos';
            const TEMPLATE_EXPEDIENTES = 'Expedientes';
            const TEMPLATE_SAC_VIAS = 'SAC - Via de captacion';
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
                byTramiteData,
                sacViaCaptacionData
            ] = await Promise.all([
                // Datos generales correspondientes a la plantilla "Rama completa - Planta y Contratos"
                safeGet(funcMap.totalAgents, { total: 0 }, TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.ageDistribution, null, TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.ageByFunction, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByFunction, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByEmploymentType, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDependency, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBySecretaria, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBySubsecretaria, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDireccionGeneral, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDireccion, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDepartamento, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDivision, [], TEMPLATE_PLANTA_CONTRATOS),
                // Datos para antigüedad y estudios
                safeGet(funcMap.agentsBySeniority, [], TEMPLATE_DATOS_CONCURSO),
                safeGet(funcMap.agentsBySecondaryStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_CONCURSO),
                safeGet(funcMap.agentsByTertiaryStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_CONCURSO),
                safeGet(funcMap.agentsByUniversityStudies, { conTitulo: 0, otros: 0 }, TEMPLATE_DATOS_CONCURSO),
                safeGet(funcMap.agentsByTopSecretariasUniversity, [], TEMPLATE_DATOS_CONCURSO),
                safeGet(funcMap.agentsByTopSecretariasTertiary, [], TEMPLATE_DATOS_CONCURSO),
                // Datos para control de certificaciones
                safeGet(funcMap.certificationsRegistrationType, [], TEMPLATE_CONTROL_PLANTA),
                safeGet(funcMap.certificationsEntryTime, [], TEMPLATE_CONTROL_PLANTA),
                safeGet(funcMap.certificationsExitTime, [], TEMPLATE_CONTROL_PLANTA),
                safeGet(funcMap.certificationsTopUnits, [], TEMPLATE_CONTROL_PLANTA),
                // Expedientes
                safeGet(funcMap.expedientesTopInitiators, [], TEMPLATE_EXPEDIENTES),
                safeGet(funcMap.expedientesByTramite, [], TEMPLATE_EXPEDIENTES),
                // SAC (sin filtros de fecha)
                safeGet(funcMap.sacViaCaptacion, [], TEMPLATE_SAC_VIAS)
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
            setSacViaData(sacViaCaptacionData);

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
        if (location.state && location.state.nombre && location.state.nivel) {
            const levelMap = {
                1: 'secretaria',
                2: 'subsecretaria',
                3: 'direccionGeneral',
                4: 'direccion',
                5: 'departamento',
                6: 'division'
            };
            const field = levelMap[location.state.nivel];
            if (field) {
                const newFilters = { ...filters, [field]: location.state.nombre };
                setFilters(newFilters);
                fetchAllData(newFilters);
                return;
            }
        }
        fetchAllData(filters);
    }, [location.state]);

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
                Dashboard - Planta y Contratos
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
                    Control de certificaciones – Planta y Contratos
                </Button>
                <Button
                    onClick={() => setTabValue(5)}
                    startIcon={<FolderOpenIcon />}
                    sx={getTabButtonStyles(5)}
                >
                    Expedientes
                </Button>
                <Button
                    onClick={() => setTabValue(6)}
                    startIcon={<PhoneIcon />}
                    sx={getTabButtonStyles(6)}
                >
                    SAC
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
                            title="Distribución de Agentes por Función (Top 10) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="function"
                        />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <CustomDonutChart
                            data={agentsByEmploymentType}
                            title="Agentes por Situación de Revista - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="type"
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
                            Control de certificaciones – Planta y Contratos
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
                    <MonthCutoffAlert systemName="de expedientes" startDate={startDate} endDate={endDate} />
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                        Expedientes
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

        {/* Tab 6: SAC */}
        {tabValue === 6 && (
            <SacSection
                sacViaData={sacViaData}
                funcs={funcs}
                isDarkMode={isDarkMode}
                startDate={startDate}
                endDate={endDate}
            />
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

                    {/* Rangos de edad con área chart */}
                    <Grid item xs={12} lg={6}>
                        {ageDistribution ? (
                            <CustomAreaChart
                                data={ageDistribution.rangeData}
                                title="Distribución por Rangos de Edad según el área - Planta y Contratos"
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
                                title="Edad Promedio por Función (Top 10) - Planta y Contratos"
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
                            title="Agentes por Secretaría (Top 8) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="secretaria"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomDonutChart
                            data={agentsByDependency.slice(0, 8)}
                            title="Agentes por Dependencia (Top 8) - Planta y Contratos"
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
                            title="Agentes por Subsecretaría (Top 10) - Planta y Contratos"
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
                            title="Agentes por Dirección General (Top 10) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomBarChart
                            data={filterValidData(agentsByDireccion, 'direccion').slice(0, 10)}
                            xKey="direccion"
                            barKey="count"
                            title="Agentes por Dirección (Top 10) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart
                            data={filterValidData(agentsByDepartamento, 'departamento').slice(0, 8)}
                            title="Agentes por Departamento (Top 8) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="departamento"
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomDonutChart
                            data={filterValidData(agentsByDivision, 'division').slice(0, 8)}
                            title="Agentes por División (Top 8) - Planta y Contratos"
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
