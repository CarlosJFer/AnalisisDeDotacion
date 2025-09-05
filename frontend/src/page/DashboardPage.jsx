import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Grid, Button, Fab, Tooltip, Snackbar } from '@mui/material';
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
import CustomHorizontalBarChart from '../components/CustomHorizontalBarChart';
import AgeRangeByAreaChart from '../components/AgeRangeByAreaChart';
import AverageAgeByFunctionChart from '../components/AverageAgeByFunctionChart';
import DependencyFilter from '../components/DependencyFilter.jsx';
import MonthCutoffAlert from '../components/MonthCutoffAlert';
import SacSection from '../components/SACSection';
import { useLocation } from 'react-router-dom';
import { getPreviousMonthRange } from '../utils/dateUtils.js';
const DeleteDashboardDialog = lazy(() => import('../components/DeleteDashboardDialog'));

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
    const [availableFields, setAvailableFields] = useState(new Set());
    const [showNoFiltersAlert, setShowNoFiltersAlert] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);
    const [noData, setNoData] = useState(false);
    
    // Estados para todos los datos
    const [totalAgents, setTotalAgents] = useState(0);
    const [ageDistribution, setAgeDistribution] = useState(null);
    const [ageByFunction, setAgeByFunction] = useState([]);
    const [ageByArea, setAgeByArea] = useState([]);
    const [agentsByFunction, setAgentsByFunction] = useState([]);
    const [agentsByEmploymentType, setAgentsByEmploymentType] = useState([]);
    const [agentsByDependency, setAgentsByDependency] = useState([]);
    const [agentsBySecretaria, setAgentsBySecretaria] = useState([]);
    const [agentsBySubsecretaría, setAgentsBySubsecretaría] = useState([]);
    const [agentsBydireccionGeneral, setAgentsBydireccionGeneral] = useState([]);
    const [agentsBydireccion, setAgentsBydireccion] = useState([]);
    const [agentsByDepartamento, setAgentsByDepartamento] = useState([]);
    const [agentsBydivision, setAgentsBydivision] = useState([]);

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

    // DiÃ¡logo de borrado de dashboard
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState('');

    const handleOpenDeleteDialog = useCallback(() => setOpenDeleteDialog(true), []);
    const handleCloseDeleteDialog = useCallback(() => setOpenDeleteDialog(false), []);
    const handleDeleted = useCallback((msg) => {
        setDeleteMsg(msg);
        window.location.reload();
    }, []);

    // Función para filtrar datos que no sean "-" o vacÃ­os
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

    const fieldMap = {
        secretaria: "Secretaria",
        subsecretaria: "Subsecretaría",
        direccionGeneral: "direccion general",
        direccion: "direccion",
        departamento: "Departamento",
        division: "division",
        funcion: "funcion"
    };
    const filterFields = ["Secretaria","Subsecretaría","direccion general","direccion","Departamento","division","funcion"];

    const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const hasField = (name, fields = availableFields) => {
        if (!fields.size) return true;
        const target = normalize(name);
        for (const f of fields) {
            if (normalize(f) === target) return true;
        }
        return false;
    };

    useEffect(() => {
        setFilterApplied(false);
        setNoData(false);
    }, [tabValue]);

    const fetchAllData = async (appliedFilters = filters, fromFilter = false) => {
        setLoading(true);
        setError('');

        try {
            const funcRes = await apiClient.get('/functions');
            const funcMap = funcRes.data.reduce((acc, f) => { acc[f.name] = f.endpoint; return acc; }, {});
            setFuncs(funcMap);

            // Obtiene datos de forma segura: si falta el endpoint o la peticiÃ³n falla,
            // devuelve el valor por defecto. En caso contrario, retorna solo el campo
            // `data` de la respuesta.
            const safeGet = async (endpoint, defaultData, plantilla, extraParams = {}) => {
                if (!endpoint) return defaultData;
                const params = Object.fromEntries(
                    Object.entries(appliedFilters).filter(([k, v]) => {
                        if (!v) return false;
                        const fieldName = fieldMap[k];
                        return hasField(fieldName);
                    })
                );
                if (plantilla) {
                    params.plantilla = plantilla;
                }
                if (availableFields.size) {
                    params.availableFields = Array.from(availableFields);
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
                ageAreaData,
                functionData,
                employmentData,
                dependencyData,
                secretariaData,
                SubsecretaríaData,
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
                safeGet(funcMap.ageBySecretaria, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByFunction, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByEmploymentType, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDependency, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBySecretaria, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBySubsecretaría, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBydireccionGeneral, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBydireccion, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsByDepartamento, [], TEMPLATE_PLANTA_CONTRATOS),
                safeGet(funcMap.agentsBydivision, [], TEMPLATE_PLANTA_CONTRATOS),
                // Datos para Antigüedad y estudios
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
            setAgeByArea(ageAreaData);
            setAgentsByFunction(functionData);
            setAgentsByEmploymentType(employmentData);
            setAgentsByDependency(dependencyData);
            setAgentsBySecretaria(secretariaData);
            setAgentsBySubsecretaría(SubsecretaríaData);
            setAgentsBydireccionGeneral(direccionGeneralData);
            setAgentsBydireccion(direccionData);
            setAgentsByDepartamento(departamentoData);
            setAgentsBydivision(divisionData);
            const fieldSet = new Set();
            if (secretariaData?.length) fieldSet.add('Secretaria');
            if (SubsecretaríaData?.length) fieldSet.add('Subsecretaría');
            if (direccionGeneralData?.length) fieldSet.add('direccion general');
            if (direccionData?.length) fieldSet.add('direccion');
            if (departamentoData?.length) fieldSet.add('Departamento');
            if (divisionData?.length) fieldSet.add('division');
            if (functionData?.length) fieldSet.add('funcion');
            setAvailableFields(fieldSet);
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

            const has = filterFields.some(f => hasField(f, fieldSet));
            if (fromFilter) {
                setShowNoFiltersAlert(!has);
            }
            setNoData(totalData.total === 0);

        } catch (err) {
            setError('Error al cargar los datos del dashboard. Por favor, contacta al administrador.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sanitizeFilters = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([k, v]) => {
                if (!v) return false;
                const fieldName = fieldMap[k];
                return hasField(fieldName);
            })
        );
    };

    const handleApplyFilters = (newFilters) => {
        const clean = sanitizeFilters(newFilters);
        setFilters(clean);
        setFilterApplied(true);
        setNoData(false);
        fetchAllData(clean, true);
    };

    const levelMap = {
    1: 'secretaria',
    2: 'subsecretaria',
    3: 'direccionGeneral',
    4: 'direccion',
    5: 'departamento',
    6: 'division',
    7: 'funcion',
    secretaria: 'secretaria',
    subsecretaria: 'subsecretaria',
    direcciongeneral: 'direccionGeneral',
    direccion: 'direccion',
    departamento: 'departamento',
    division: 'division',
    funcion: 'funcion'
};

    const applyOrgNav = (nivel, valor) => {
        const key = (typeof nivel === 'number' && nivel >= 2)
            ? levelMap[nivel - 1]
            : levelMap[
                typeof nivel === 'string'
                    ? nivel
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                          .replace(/\s+/g, '')
                    : nivel
              ];
        if (!key) return;
        const baseFilters = {
            secretaria: '',
            subsecretaria: '',
            direccionGeneral: '',
            direccion: '',
            departamento: '',
            division: '',
            funcion: ''
        };
        baseFilters[key] = valor;
        handleApplyFilters(baseFilters);
    };

    useEffect(() => {
        if (location.state && location.state.nombre && location.state.nivel) {
            applyOrgNav(location.state.nivel, location.state.nombre);
        } else {
            fetchAllData(filters, false);
        }
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

            <Snackbar
                open={showNoFiltersAlert}
                onClose={() => setShowNoFiltersAlert(false)}
                autoHideDuration={6000}
            >
                <Alert severity="info" onClose={() => setShowNoFiltersAlert(false)}>
                    Esta sección no tiene datos de Secretaría/Subsecretaría/direccion...
                </Alert>
            </Snackbar>

            <Snackbar
                open={filterApplied && noData}
                onClose={() => setNoData(false)}
                autoHideDuration={6000}
            >
                <Alert severity="info" onClose={() => setNoData(false)}>
                    No se encontraron datos con los filtros aplicados.
                </Alert>
            </Snackbar>

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
                    Control de certificaciones  -  Planta y Contratos
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
                    {/* EstadÃ­sticas principales */}
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Total de agentes municipales"
                            value={totalAgents.toLocaleString()}
                            isDarkMode={isDarkMode}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Funciones registradas"
                            value={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-').length}
                            isDarkMode={isDarkMode}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Tipos de situación de revista"
                            value={agentsByEmploymentType.length}
                            isDarkMode={isDarkMode}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Cantidad de Secretarías"
                            value={agentsBySecretaria.length}
                            isDarkMode={isDarkMode}
                        />
                    </Grid>
                    
                    {/* gráficos principales */}
                    <Grid item xs={12}>
                        <CustomHorizontalBarChart
                            data={agentsByFunction.filter(f => f.function && f.function.trim() !== '' && f.function.trim() !== '-')}
                            title="Distribución de Agentes por Función - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            nameKey="function"
                            valueKey="count"
                            pageSize={10}
                            height={520}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomHorizontalBarChart
                            data={agentsByEmploymentType}
                            title="Agentes por Situación de Revista - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            nameKey="type"
                            valueKey="count"
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
                            title="Cantidad de agentes según Antigüedad municipal"
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
                            title="Top 10 Secretarías con mÃ¡s agentes con título universitario"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CustomBarChart
                            data={topTerSecretariasData}
                            xKey="secretaria"
                            barKey="count"
                            title="Top 10 Secretarías con mÃ¡s agentes con título terciario"
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
                            Control de certificaciones  -  Planta y Contratos
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
                        title="Top 10 unidades de registración con mÃ¡s agentes"
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
                            title="Top 10 áreas con mÃ¡s trámites gestionados"
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
                            title="Cantidad de expedientes según tipo de trÃ¡mite"
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
                    
                    {/* GrÃ¡fico de rangos de edad principal */}
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
                                <Typography sx={{ ml: 2 }}>Cargando Análisis de edad...</Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Distribución por Rangos de Edad según el área */}
                    <Grid item xs={12}>
                        {ageByArea.length ? (
                            <AgeRangeByAreaChart rows={ageByArea} isDarkMode={isDarkMode} />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                <CircularProgress size={30} />
                            </Box>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {ageByFunction.length > 0 ? (
                            <AverageAgeByFunctionChart
                                data={ageByFunction}
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
                            data={filterValidData(agentsBySubsecretaría, 'Subsecretaría').slice(0, 10)}
                            xKey="Subsecretaría"
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
                            data={filterValidData(agentsBydireccionGeneral, 'direccionGeneral').slice(0, 10)}
                            xKey="direccionGeneral"
                            barKey="count"
                            title="Agentes por direccion general (Top 10) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            height={400}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <CustomBarChart
                            data={filterValidData(agentsBydireccion, 'direccion').slice(0, 10)}
                            xKey="direccion"
                            barKey="count"
                            title="Agentes por direccion (Top 10) - Planta y Contratos"
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
                            data={filterValidData(agentsBydivision, 'division').slice(0, 8)}
                            title="Agentes por division (Top 8) - Planta y Contratos"
                            isDarkMode={isDarkMode}
                            dataKey="count"
                            nameKey="division"
                        />
                    </Grid>
                </Grid>
            )}

            {user?.role === 'admin' && (
                <>
                    <Tooltip title="Borrar datos">
                        <Fab
                            onClick={handleOpenDeleteDialog}
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
                            <CleaningServicesIcon />
                        </Fab>
                    </Tooltip>
                    {deleteMsg && (
                        <Alert
                            severity={deleteMsg.includes('Error') ? 'error' : 'success'}
                            sx={{ position: 'fixed', bottom: 90, right: 24, zIndex: 1300 }}
                        >
                            {deleteMsg}
                        </Alert>
                    )}
                    <Suspense fallback={null}>
                        {openDeleteDialog && (
                            <DeleteDashboardDialog
                                isOpen={openDeleteDialog}
                                onClose={handleCloseDeleteDialog}
                                onDelete={handleDeleted}
                            />
                        )}
                    </Suspense>
                </>
            )}

        </Box>
    );
};

export default DashboardPage;


















