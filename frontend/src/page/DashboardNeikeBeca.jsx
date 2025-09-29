import React, { useState, useEffect, useRef } from "react";
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
import AgeDistributionBarChart from "../components/AgeDistributionBarChart";
import CustomDonutChart from "../components/CustomDonutChart";
import CustomHorizontalBarChart from "../components/CustomHorizontalBarChart.jsx";
import CustomLineChart from "../components/CustomLineChart";
import EntryTimeByUnitChart from "../components/EntryTimeByUnitChart.jsx";
import ExitTimeByUnitChart from "../components/ExitTimeByUnitChart.jsx";
import CustomAreaChart from "../components/CustomAreaChart";
import AgeRangeByAreaChart from "../components/AgeRangeByAreaChart";
import AverageAgeByFunctionChart from "../components/AverageAgeByFunctionChart";
import AgentsByFunctionBarChart from "../components/AgentsByFunctionBarChart.jsx";
import AgentsBySecretariaBarChart from "../components/AgentsBySecretariaBarChart.jsx";
import AgentsByDependencyBarChart from "../components/AgentsByDependencyBarChart.jsx";
import AgentsBySubsecretariaBarChart from "../components/AgentsBySubsecretariaBarChart.jsx";
import AgentsByDireccionGeneralBarChart from "../components/AgentsByDireccionGeneralBarChart.jsx";
import AgentsByDireccionBarChart from "../components/AgentsByDireccionBarChart.jsx";
import AgentsByDepartamentoBarChart from "../components/AgentsByDepartamentoBarChart.jsx";
import AgentsByDivisionBarChart from "../components/AgentsByDivisionBarChart.jsx";
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
  const availableFieldsRef = useRef(new Set());
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
  const [entryTimeByUnitData, setEntryTimeByUnitData] = useState([]);
  const [exitTimeByUnitData, setExitTimeByUnitData] = useState([]);
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

  // Funciï¿½n para filtrar datos que no sean "-" o vacÃ­os
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
    availableFieldsRef.current = availableFields;
  }, [availableFields]);

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
        const currentAvailableFields = availableFieldsRef.current;
        if (currentAvailableFields.size) {
          params.availableFields = Array.from(currentAvailableFields);
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
      const TEMPLATE_NEIKES_BECAS_ALT = "Rama completa - Neikes y Becas";
      const TEMPLATE_DATOS_NEIKES = "Datos concurso - Neikes y Beca";
      const TEMPLATE_DATOS_NEIKES_ALT = "Datos concurso - Neikes y Becas";
      const TEMPLATE_CONTROL_NEIKES =
        "Control de certificaciones - Neikes y Becas";
      const hasUsefulData = (data) => {
        if (Array.isArray(data)) return data.length > 0;
        if (data && typeof data === "object") {
          if ("conTitulo" in data && "otros" in data) {
            return (Number(data.conTitulo) || 0) + (Number(data.otros) || 0) > 0;
          }
        }
        return !!data;
      };
      const fetchWithTemplates = async (endpoint, def, templates, extraParams = {}) => {
        for (const tpl of templates) {
          const res = await safeGet(endpoint, def, tpl, extraParams);
          if (hasUsefulData(res)) return res;
        }
        return def;
      };
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
        entryTimeByUnitRes,
        exitTimeByUnitRes,
        topUnitsRes,
      ] = await Promise.all([
        // Datos correspondientes a la plantilla "Rama completa - Neikes y Beca"
        fetchWithTemplates(funcs.totalAgents, { total: 0 }, [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.ageDistribution, null, [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.ageByFunction, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.ageBySecretaria, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByFunction, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByEmploymentType, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByDependency, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsBySecretaria, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsBySubsecretaria, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByDireccionGeneral ?? funcs.agentsBydireccionGeneral, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByDireccion ?? funcs.agentsBydireccion, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByDepartamento, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        fetchWithTemplates(funcs.agentsByDivision, [], [TEMPLATE_NEIKES_BECAS, TEMPLATE_NEIKES_BECAS_ALT]),
        // Datos para Antigï¿½edad y estudios
        fetchWithTemplates(funcs.agentsBySeniority, [], [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT]),
        fetchWithTemplates(
          funcs.agentsBySecondaryStudies,
          { conTitulo: 0, otros: 0 },
          [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT],
        ),
        fetchWithTemplates(
          funcs.agentsByTertiaryStudies,
          { conTitulo: 0, otros: 0 },
          [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT],
        ),
        fetchWithTemplates(
          funcs.agentsByUniversityStudies,
          { conTitulo: 0, otros: 0 },
          [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT],
        ),
        fetchWithTemplates(
          funcs.agentsByTopSecretariasUniversity,
          [],
          [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT],
        ),
        fetchWithTemplates(
          funcs.agentsByTopSecretariasTertiary,
          [],
          [TEMPLATE_DATOS_NEIKES, TEMPLATE_DATOS_NEIKES_ALT],
        ),
        // Datos para control de certificaciones
        fetchWithTemplates(
          funcs.certificationsRegistrationType,
          [],
          [TEMPLATE_CONTROL_NEIKES],
        ),
        fetchWithTemplates(
          funcs.certificationsEntryTime,
          [],
          [TEMPLATE_CONTROL_NEIKES],
        ),
        fetchWithTemplates(
          funcs.certificationsEntryTimeByUnit ??
            funcs.certificationsEntryTimebyUnit,
          [],
          [TEMPLATE_CONTROL_NEIKES],
        ),
        fetchWithTemplates(
          funcs.certificationsExitTimeByUnit ?? funcs.certificationsExitTimebyUnit,
          [],
          [TEMPLATE_CONTROL_NEIKES],
        ),
        fetchWithTemplates(
          funcs.certificationsTopUnits,
          [],
          [TEMPLATE_CONTROL_NEIKES],
        ),
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
            {
        const mergedLabel = "Sin tipo de registracion";
        const normalize = (v) => (v ?? "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        const aggregated = Array.isArray(regTypeRes)
          ? (() => {
              const acc = new Map();
              for (const it of regTypeRes) {
                const raw = (it?.tipo ?? it?.type ?? "").toString().trim();
                const n = normalize(raw);
                const label = !n || n.includes("sreg") || n.includes("srg") || n.includes("otros") || n.includes("otro") || n.includes("sintipo") || n.includes("sinregistro")
                  ? mergedLabel
                  : raw;
                const count = Number(it?.count ?? it?.cantidad ?? it?.value ?? 0) || 0;
                acc.set(label, (acc.get(label) || 0) + count);
              }
              return Array.from(acc.entries())
                .map(([tipo, count]) => ({ tipo, count }))
                .filter((d) => d.count > 0)
                .sort((a, b) => b.count - a.count);
            })()
          : [];
        setRegistrationTypeData(aggregated);
      }
      setEntryTimeData(entryTimeRes);
      setEntryTimeByUnitData(entryTimeByUnitRes);
      setExitTimeByUnitData(exitTimeByUnitRes);
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
        Analisis detallado de la dotacion municipal con graficos especializados
      </Typography>

      <DependencyFilter filters={filters} onFilter={handleApplyFilters} />

      <Snackbar
        open={showNoFiltersAlert}
        onClose={() => setShowNoFiltersAlert(false)}
        autoHideDuration={6000}
      >
        <Alert severity="info" onClose={() => setShowNoFiltersAlert(false)}>
          Esta secciï¿½n no tiene datos de Secretarï¿½a/Subsecretarï¿½a/Direcciï¿½n...
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

      {/* Navegaciï¿½n por botones */}
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
          Analisis de Edad
        </Button>
        <Button
          onClick={() => setTabValue(2)}
          startIcon={<icons.empresa />}
          sx={getTabButtonStyles(2)}
        >
          Distribucion Organizacional
        </Button>
        <Button
          onClick={() => setTabValue(3)}
          startIcon={<icons.antiguedad />}
          sx={getTabButtonStyles(3)}
        >
          Antiguedad y Estudios
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
                label="Tipos de situacion de revista"
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
                label="Cantidad de Secretarias"
                value={agentsBySecretaria.length}
                delta={null}
                isDarkMode={isDarkMode}
              />
            </DashboardCard>
          </Grid>

          {/* grï¿½ficos principales - AMBOS USANDO EL MISMO COMPONENTE */}
          <Grid item xs={12} lg={8} sx={{ display: "none" }}>
            <CustomDonutChart
              data={agentsByFunction
                .filter(
                  (f) =>
                    f.function &&
                    f.function.trim() !== "" &&
                    f.function.trim() !== "-",
                )
                .slice(0, 10)}
              title="Distribuciï¿½n de Agentes por Funciï¿½n (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="function"
            />
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: "none" }}>
            <CustomDonutChart
              data={agentsByEmploymentType}
              title="Agentes por Situaciï¿½n de Revista - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="type"
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsByFunctionBarChart
              data={agentsByFunction.filter(
                (f) =>
                  f.function &&
                  f.function.trim() !== "" &&
                  f.function.trim() !== "-",
              )}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomHorizontalBarChart
              data={agentsByEmploymentType}
              title="Agentes por Situacion de Revista - Neikes y Becas"
              isDarkMode={isDarkMode}
              nameKey="type"
              valueKey="count"
              pageSize={10}
            />
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Anï¿½lisis de Edad */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Analisis de Edad de los Agentes Municipales
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
              <AgeDistributionBarChart
                data={ageDistribution.rangeData}
                isDarkMode={isDarkMode}
                title="Distribucion por Rangos de Edad - Neikes y Beca"
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
                  Cargando Anï¿½lisis de edad...
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Distribuciï¿½n por Rangos de Edad segï¿½n el ï¿½rea */}
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

      {/* Tab 2: Distribuciï¿½n Organizacional */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Distribucion Organizacional
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: "none" }}>
            <CustomDonutChart
              data={agentsBySecretaria.slice(0, 8)}
              title="Agentes por Secretarï¿½a (Top 8) - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="secretaria"
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsBySecretariaBarChart
              data={agentsBySecretaria}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "none" }}>
            <CustomDonutChart
              data={agentsByDependency.slice(0, 8)}
              title="Agentes por Dependencia (Top 8) - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="dependency"
            />
          </Grid>

          <Grid item xs={12}>
            <AgentsByDependencyBarChart
              data={agentsByDependency}
              isDarkMode={isDarkMode}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: "none" }}>
            <CustomHorizontalBarChart
              data={filterValidData(
                agentsBySubsecretaria,
                "subsecretaria",
              ).slice(0, 10)}
              xKey="subsecretaria"
              valueKey="count"
              pageSize={10}
              title="Agentes por Subsecretarï¿½a (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>


          <Grid item xs={12} lg={6} sx={{ display: "none" }}>
            <CustomHorizontalBarChart
              data={filterValidData(
                agentsByDireccionGeneral,
                "direccionGeneral",
              ).slice(0, 10)}
              xKey="direccionGeneral"
              valueKey="count"
              pageSize={10}
              title="Agentes por Direcciï¿½n General (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12} lg={6} sx={{ display: "none" }}>
            <CustomHorizontalBarChart
              data={filterValidData(agentsByDireccion, "direccion").slice(
                0,
                10,
              )}
              xKey="direccion"
              valueKey="count"
              pageSize={10}
              title="Agentes por Direcciï¿½n (Top 10) - Neikes y Beca"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>

          <Grid item xs={12} lg={6} sx={{ display: "none" }}>
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
          <Grid item xs={12} lg={6} sx={{ display: "none" }}>
            <CustomDonutChart
              data={filterValidData(agentsByDivision, "division").slice(0, 8)}
              title="Agentes por Divisiï¿½n (Top 8) - Neikes y Beca"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="division"
            />
          </Grid>
          {/* Nuevos grÃ¡ficos alineados con Planta y Contratos */}
          <Grid item xs={12}>
            <AgentsBySubsecretariaBarChart
              data={filterValidData(
                agentsBySubsecretaria,
                "subsecretaria",
              )}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsByDireccionGeneralBarChart
              data={filterValidData(
                agentsByDireccionGeneral,
                "direccionGeneral",
              )}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsByDireccionBarChart
              data={filterValidData(agentsByDireccion, "direccion")}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsByDepartamentoBarChart
              data={filterValidData(agentsByDepartamento, "departamento")}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <AgentsByDivisionBarChart
              data={filterValidData(agentsByDivision, "division")}
              isDarkMode={isDarkMode}
            />
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Antigï¿½edad y Estudios */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Antiguedad y Estudios
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <CustomBarChart
              data={seniorityData}
              xKey="range"
              barKey="count"

              title="Cantidad de agentes segun Antiguedad municipal"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDonutChart
              data={[
                {
                  category: "Con titulo secundario",
                  count: secondaryData?.conTitulo || 0,
                },
                { category: "Otros", count: secondaryData?.otros || 0 },
              ]}
              title="Agentes segun estudios secundarios"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomDonutChart
              data={[
                {
                  category: "Con titulo terciario",
                  count: tertiaryData?.conTitulo || 0,
                },
                { category: "Otros", count: tertiaryData?.otros || 0 },
              ]}
              title="Agentes segun estudios terciarios"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomDonutChart
              data={[
                {
                  category: "Con titulo universitario",
                  count: universityData?.conTitulo || 0,
                },
                { category: "Otros", count: universityData?.otros || 0 },
              ]}
              title="Agentes segun estudios universitarios"
              isDarkMode={isDarkMode}
              dataKey="count"
              nameKey="category"
            />
          </Grid>
          <Grid item xs={12}>
            <CustomHorizontalBarChart
              data={topUniSecretariasData}
              nameKey="secretaria"
              valueKey="count"
              pageSize={5}
              title="Secretarias con agentes con titulo universitario"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomHorizontalBarChart
              data={topTerSecretariasData}
              nameKey="secretaria"
              valueKey="count"
              pageSize={5}
              title="Secretarias con agentes con titulo terciario"
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
          <Grid item xs={12}>
            <CustomHorizontalBarChart
              data={registrationTypeData}
              xKey="tipo"
              valueKey="count"
              pageSize={10}
              title="Cantidad de agentes segun tipo de registracion"
              isDarkMode={isDarkMode}
              height={400}
            />
          </Grid>
          <Grid item xs={12}>
            <EntryTimeByUnitChart
              data={entryTimeByUnitData}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <ExitTimeByUnitChart
              data={exitTimeByUnitData}
              isDarkMode={isDarkMode}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomHorizontalBarChart
              data={topUnitsData}
              xKey="unidad"
              valueKey="count"
              pageSize={5}
              title="Unidades de registracion con mas agentes"
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












