import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Fab,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { useTheme } from "../context/ThemeContext.jsx";
import apiClient from "../services/api";
import icons from "../ui/icons.js";
import { DashboardCard } from "../ui";
import KPIStat from "../components/ui/KPIStat.jsx";
import CustomBarChart from "../components/CustomBarChart";
import CustomDonutChart from "../components/CustomDonutChart";
import CustomAreaChart from "../components/CustomAreaChart";
import AgeRangeByAreaChart from "../components/AgeRangeByAreaChart";
import AverageAgeByFunctionChart from "../components/AverageAgeByFunctionChart";
import DependencyFilter from "../components/DependencyFilter.jsx";
import { useLocation } from "react-router-dom";

const DashboardNeikeBeca = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    secretaria: "",
    subsecretaria: "",
    direccionGeneral: "",
    direccion: "",
    departamento: "",
    division: "",
    funcion: "",
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

  // Hooks para limpiar dashboard
  const [cleaning, setCleaning] = useState(false);
  const [cleanMsg, setCleanMsg] = useState("");

  const handleLimpiarDashboard = async () => {
    setCleaning(true);
    setCleanMsg("");
    try {
      await apiClient.post("/admin/limpiar-dashboard");
      setCleanMsg("Dashboard limpiado correctamente.");
      fetchAllData(filters, false);
    } catch (err) {
      setCleanMsg("Error al limpiar el dashboard.");
    } finally {
      setCleaning(false);
    }
  };

  // Función para filtrar datos que no sean "-" o vacÃ­os
  const filterValidData = (data, nameKey) => {
    return data.filter((item) => {
      const value = item[nameKey];
      // Verificar que el valor existe y es un string antes de usar trim()
      if (!value || typeof value !== "string") {
        return false;
      }
      const trimmedValue = value.trim();
      return (
        trimmedValue !== "" &&
        trimmedValue !== "-" &&
        trimmedValue !== "Sin especificar"
      );
    });
  };

  const fieldMap = {
    secretaria: "Secretaria",
    subsecretaria: "Subsecretaria",
    direccionGeneral: "Direccion general",
    direccion: "Direccion",
    departamento: "Departamento",
    division: "Division",
    funcion: "Funcion",
  };
  const filterFields = [
    "Secretaria",
    "Subsecretaria",
    "Direccion general",
    "Direccion",
    "Departamento",
    "Division",
    "Funcion",
  ];

  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
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
    setError("");

    try {
      const funcRes = await apiClient.get("/functions");
      const funcs = funcRes.data.reduce((acc, f) => {
        acc[f.name] = f.endpoint;
        return acc;
      }, {});

      // Obtiene datos de forma segura: si falta el endpoint o la peticiÃ³n falla,
      // devuelve el valor por defecto. En caso contrario, retorna solo el campo
      // `data` de la respuesta.
      const safeGet = async (
        endpoint,
        defaultData,
        plantilla,
        extraParams = {},
      ) => {
        if (!endpoint) return defaultData;
        const params = Object.fromEntries(
          Object.entries(appliedFilters).filter(([k, v]) => {
            if (!v) return false;
            const fieldName = fieldMap[k];
            return hasField(fieldName);
          }),
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
      const TEMPLATE_NEIKES_BECAS = "Rama completa - Neikes y Beca";
      const TEMPLATE_DATOS_NEIKES = "Datos concurso - Neikes y Beca";
      const TEMPLATE_CONTROL_NEIKES =
        "Control de certificaciones - Neikes y Becas";
      const [
        totalData,
        ageDistData,
        ageFunctionData,
        ageAreaData,
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
      ] = await Promise.all([
        // Datos correspondientes a la plantilla "Rama completa - Neikes y Beca"
        safeGet(funcs.totalAgents, { total: 0 }, TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.ageDistribution, null, TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.ageByFunction, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.ageBySecretaria, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByFunction, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByEmploymentType, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDependency, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsBySecretaria, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsBySubsecretaria, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDireccionGeneral, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDireccion, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDepartamento, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDivision, [], TEMPLATE_NEIKES_BECAS),
        // Datos para Antigüedad y estudios
        safeGet(funcs.agentsBySeniority, [], TEMPLATE_DATOS_NEIKES),
        safeGet(
          funcs.agentsBySecondaryStudies,
          { conTitulo: 0, otros: 0 },
          TEMPLATE_DATOS_NEIKES,
        ),
        safeGet(
          funcs.agentsByTertiaryStudies,
          { conTitulo: 0, otros: 0 },
          TEMPLATE_DATOS_NEIKES,
        ),
        safeGet(
          funcs.agentsByUniversityStudies,
          { conTitulo: 0, otros: 0 },
          TEMPLATE_DATOS_NEIKES,
        ),
        safeGet(
          funcs.agentsByTopSecretariasUniversity,
          [],
          TEMPLATE_DATOS_NEIKES,
        ),
        safeGet(
          funcs.agentsByTopSecretariasTertiary,
          [],
          TEMPLATE_DATOS_NEIKES,
        ),
        // Datos para control de certificaciones
        safeGet(
          funcs.certificationsRegistrationType,
          [],
          TEMPLATE_CONTROL_NEIKES,
        ),
        safeGet(funcs.certificationsEntryTime, [], TEMPLATE_CONTROL_NEIKES),
        safeGet(funcs.certificationsExitTime, [], TEMPLATE_CONTROL_NEIKES),
        safeGet(funcs.certificationsTopUnits, [], TEMPLATE_CONTROL_NEIKES),
      ]);

      setTotalAgents(totalData.total);
      setAgeDistribution(ageDistData);
      setAgeByFunction(ageFunctionData);
      setAgeByArea(ageAreaData);
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
      const fieldSet = new Set();
      if (secretariaData?.length) fieldSet.add("Secretaria");
      if (subsecretariaData?.length) fieldSet.add("Subsecretaria");
      if (direccionGeneralData?.length) fieldSet.add("Direccion general");
      if (direccionData?.length) fieldSet.add("Direccion");
      if (departamentoData?.length) fieldSet.add("Departamento");
      if (divisionData?.length) fieldSet.add("Division");
      if (functionData?.length) fieldSet.add("Funcion");
      setAvailableFields(fieldSet);
      const has = filterFields.some((f) => hasField(f, fieldSet));
      if (fromFilter) {
        setShowNoFiltersAlert(!has);
      }
      setNoData(totalData.total === 0);
    } catch (err) {
      setError(
        "Error al cargar los datos del dashboard. Por favor, contacta al administrador.",
      );
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
      }),
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
    1: "secretaria",
    2: "subsecretaria",
    3: "direccionGeneral",
    4: "direccion",
    5: "departamento",
    6: "division",
    7: "funcion",
    secretaria: "secretaria",
    subsecretaria: "subsecretaria",
    direcciongeneral: "direccionGeneral",
    direccion: "direccion",
    departamento: "departamento",
    division: "division",
    funcion: "funcion",
  };
  const handleOrgNav = (nivel, valor) => {
    const key =
      typeof nivel === "number" && nivel >= 2
        ? levelMap[nivel - 1]
        : levelMap[
            typeof nivel === "string"
              ? nivel
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/\s+/g, "")
              : nivel
          ];
    if (!key) return;
    const baseFilters = {
      secretaria: "",
      subsecretaria: "",
      direccionGeneral: "",
      direccion: "",
      departamento: "",
      division: "",
      funcion: "",
    };
    baseFilters[key] = valor;
    handleApplyFilters(baseFilters);
  };

  useEffect(() => {
    if (location.state && location.state.nombre && location.state.nivel) {
      handleOrgNav(location.state.nivel, location.state.nombre);
    } else {
      fetchAllData(filters, false);
    }
  }, [location.state]);

  const getTabButtonStyles = (value) => ({
    color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 3,
    textTransform: "none",
    fontSize: "0.9rem",
    background: isDarkMode
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)",
    border: isDarkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    ...(tabValue === value && {
      background: "linear-gradient(135deg, #2196f3, #1976d2)",
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? "0 6px 20px rgba(33, 150, 243, 0.3)"
        : "0 6px 20px rgba(33, 150, 243, 0.2)",
    }),
    "&:hover": {
      background:
        tabValue === value
          ? "linear-gradient(135deg, #1976d2, #1565c0)"
          : isDarkMode
            ? "rgba(33, 150, 243, 0.2)"
            : "rgba(33, 150, 243, 0.15)",
      color: tabValue === value ? "white" : isDarkMode ? "#64b5f6" : "#1976d2",
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? "0 6px 20px rgba(33, 150, 243, 0.3)"
        : "0 6px 20px rgba(33, 150, 243, 0.2)",
    },
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
          mb: 1,
        }}
      >
        Dashboard - Neikes y Becas
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
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
          Esta sección no tiene datos de Secretaría/Subsecretaría/Dirección...
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
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "center",
          pt: 2,
        }}
      >
        <Button
          onClick={() => setTabValue(0)}
          startIcon={<icons.resumen />}
          sx={getTabButtonStyles(0)}
        >
          Resumen General
        </Button>
        <Button
          onClick={() => setTabValue(1)}
          startIcon={<icons.analitica />}
          sx={getTabButtonStyles(1)}
        >
          Análisis de Edad
        </Button>
        <Button
          onClick={() => setTabValue(2)}
          startIcon={<icons.empresa />}
          sx={getTabButtonStyles(2)}
        >
          Distribución Organizacional
        </Button>
        <Button
          onClick={() => setTabValue(3)}
          startIcon={<icons.antiguedad />}
          sx={getTabButtonStyles(3)}
        >
          Antigüedad y Estudios
        </Button>
        <Button
          onClick={() => setTabValue(4)}
          startIcon={<icons.contratos />}
          sx={getTabButtonStyles(4)}
        >
          Control de certificaciones - Neikes y Becas
        </Button>
      </Box>

      {/* Tab 0: Resumen General */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* EstadÃ­sticas principales */}
          <Grid item xs={12} md={3}>
            <DashboardCard isDarkMode={isDarkMode}>
              <KPIStat
                metric="personas"
                label="Total de agentes municipales"
                value={totalAgents.toLocaleString()}
                delta={null}
                isDarkMode={isDarkMode}
              />
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <DashboardCard isDarkMode={isDarkMode}>
              <KPIStat
                metric="organigrama"
                label="Funciones registradas"
                value={
                  agentsByFunction.filter(
                    (f) =>
                      f.function &&
                      f.function.trim() !== "" &&
                      f.function.trim() !== "-",
                  ).length
                }
                delta={null}
                isDarkMode={isDarkMode}
              />
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <DashboardCard isDarkMode={isDarkMode}>
              <KPIStat
                metric="contratos"
                label="Tipos de situación de revista"
                value={agentsByEmploymentType.length}
                delta={null}
                isDarkMode={isDarkMode}
              />
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <DashboardCard isDarkMode={isDarkMode}>
              <KPIStat
                metric="empresa"
                label="Cantidad de Secretarías"
                value={agentsBySecretaria.length}
                delta={null}
                isDarkMode={isDarkMode}
              />
            </DashboardCard>
          </Grid>

          {/* gráficos principales - AMBOS USANDO EL MISMO COMPONENTE */}
          <Grid item xs={12} lg={8}>
            <CustomDonutChart
              data={agentsByFunction
                .filter(
                  (f) =>
                    f.function &&
                    f.function.trim() !== "" &&
                    f.function.trim() !== "-",
                )
                .slice(0, 10)}
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

          {/* GrÃ¡fico de rangos de edad principal */}
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
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
              >
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>
                  Cargando Análisis de edad...
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Distribución por Rangos de Edad según el área */}
          <Grid item xs={12}>
            {ageByArea.length ? (
              <AgeRangeByAreaChart rows={ageByArea} isDarkMode={isDarkMode} />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
              >
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
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
              >
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
              data={filterValidData(
                agentsBySubsecretaria,
                "subsecretaria",
              ).slice(0, 10)}
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
              data={filterValidData(
                agentsByDireccionGeneral,
                "direccionGeneral",
              ).slice(0, 10)}
              xKey="direccionGeneral"
              barKey="count"
              title="Agentes por Dirección General (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <CustomBarChart
              data={filterValidData(agentsByDireccion, "direccion").slice(
                0,
                10,
              )}
              xKey="direccion"
              barKey="count"
              title="Agentes por Dirección (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <CustomDonutChart
              data={filterValidData(agentsByDepartamento, "departamento").slice(
                0,
                8,
              )}
              title="Agentes por Departamento (Top 8) - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="departamento"
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <CustomDonutChart
              data={filterValidData(agentsByDivision, "division").slice(0, 8)}
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
              title="Cantidad de agentes según Antigüedad municipal"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomDonutChart
              data={[
                {
                  category: "Con título secundario",
                  count: secondaryData?.conTitulo || 0,
                },
                { category: "Otros", count: secondaryData?.otros || 0 },
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
                {
                  category: "Con título terciario",
                  count: tertiaryData?.conTitulo || 0,
                },
                { category: "Otros", count: tertiaryData?.otros || 0 },
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
                {
                  category: "Con título universitario",
                  count: universityData?.conTitulo || 0,
                },
                { category: "Otros", count: universityData?.otros || 0 },
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
              Control de certificaciones - Neikes y Becas
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

      {user?.role === "admin" && (
        <>
          <Tooltip title={cleaning ? "Limpiando..." : "Limpiar Dashboard"}>
            <Fab
              onClick={handleLimpiarDashboard}
              disabled={cleaning}
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                color: "white",
                background: "linear-gradient(135deg, #f44336, #d32f2f)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d32f2f, #b71c1c)",
                },
              }}
            >
              {cleaning ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                <icons.eliminar />
              )}
            </Fab>
          </Tooltip>
          {cleanMsg && (
            <Alert
              severity={cleanMsg.includes("Error") ? "error" : "success"}
              sx={{ position: "fixed", bottom: 90, right: 24, zIndex: 1300 }}
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
