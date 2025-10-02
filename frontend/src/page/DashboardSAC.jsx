import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
} from "@mui/material";
import { useTheme } from "../context/ThemeContext.jsx";
import icons from "../ui/icons.js";
import apiClient from "../services/api";
import CustomBarChart from "../components/CustomBarChart";
import MonthCutoffAlert from "../components/MonthCutoffAlert";
import { getPreviousMonthRange } from "../utils/dateUtils.js";

const DashboardSAC = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const { startDate, endDate } = getPreviousMonthRange();

  // Funciones disponibles (map name -> endpoint)
  const [funcs, setFuncs] = useState({});

  // Estados de datos (replicando SACSection para mantener colores/etiquetas)
  const [sacViaData, setSacViaData] = useState([]);
  const [cierreReclamos, setCierreReclamos] = useState([]);
  const [cierrePromedios, setCierrePromedios] = useState([]);
  const [cierrePendientes, setCierrePendientes] = useState([]);
  const [cierreCerrados, setCierreCerrados] = useState([]);
  const [bocaData, setBocaData] = useState([]);
  const [frecuenciaData, setFrecuenciaData] = useState([]);
  const [temasRecibidos, setTemasRecibidos] = useState([]);
  const [temasVisualizados, setTemasVisualizados] = useState([]);
  const [temasPendientes, setTemasPendientes] = useState([]);
  const [temasProceso, setTemasProceso] = useState([]);
  const [temasCerrados, setTemasCerrados] = useState([]);
  const [contactoRecibidos, setContactoRecibidos] = useState([]);
  const [contactoCerrados, setContactoCerrados] = useState([]);
  const [llamadasBarrio, setLlamadasBarrio] = useState([]);
  const [ambienteReclamos, setAmbienteReclamos] = useState([]);
  const [ambientePromedios, setAmbientePromedios] = useState([]);
  const [ambientePendientes, setAmbientePendientes] = useState([]);
  const [ambienteCerrados, setAmbienteCerrados] = useState([]);
  const [infraReclamos, setInfraReclamos] = useState([]);
  const [infraPromedios, setInfraPromedios] = useState([]);
  const [infraPendientes, setInfraPendientes] = useState([]);
  const [infraCerrados, setInfraCerrados] = useState([]);
  const [coordReclamos, setCoordReclamos] = useState([]);
  const [coordPromedios, setCoordPromedios] = useState([]);
  const [coordPendientes, setCoordPendientes] = useState([]);
  const [coordCerrados, setCoordCerrados] = useState([]);

  const safeGet = useCallback(
    async (endpoint, plantilla, extraParams = {}) => {
      if (!endpoint) return [];
      try {
        const params = { plantilla };
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        Object.assign(params, extraParams);
        const res = await apiClient.get(endpoint, { params });
        return res.data;
      } catch {
        return [];
      }
    },
    [startDate, endDate],
  );

  // Cargas perezosas por pestaña
  const fetchVia = useCallback(async () => {
    if (sacViaData.length) return;
    const data = await safeGet(funcs.sacViaCaptacion, "SAC - Via de captacion");
    setSacViaData(data);
  }, [safeGet, funcs, sacViaData.length]);

  const fetchCierre = useCallback(async () => {
    if (cierreReclamos.length) return;
    const plantilla = "SAC - Cierre de problemas";
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacCierreProblemasTopReclamos, plantilla),
      safeGet(funcs.sacCierreProblemasTopPromedios, plantilla),
      safeGet(funcs.sacCierreProblemasTopPendientes, plantilla),
      safeGet(funcs.sacCierreProblemasTopCerrados, plantilla),
    ]);
    setCierreReclamos(r);
    setCierrePromedios(p);
    setCierrePendientes(pe);
    setCierreCerrados(c);
  }, [safeGet, funcs, cierreReclamos.length]);

  const fetchBoca = useCallback(async () => {
    if (bocaData.length) return;
    const data = await safeGet(funcs.sacBocaReceptoraTop, "SAC - Boca receptora");
    setBocaData(data);
  }, [safeGet, funcs, bocaData.length]);

  const fetchFrecuencia = useCallback(async () => {
    if (frecuenciaData.length) return;
    const data = await safeGet(
      funcs.sacFrecuenciaTiposCierre,
      "SAC - Frecuencia de tipos de cierre",
    );
    setFrecuenciaData(data);
  }, [safeGet, funcs, frecuenciaData.length]);

  const fetchTemas = useCallback(async () => {
    if (temasRecibidos.length) return;
    const plantilla = "SAC - Temas";
    const [r, v, pe, pr, c] = await Promise.all([
      safeGet(funcs.sacTemasTopRecibidos, plantilla),
      safeGet(funcs.sacTemasTopVisualizados, plantilla),
      safeGet(funcs.sacTemasTopPendientes, plantilla),
      safeGet(funcs.sacTemasTopProceso, plantilla),
      safeGet(funcs.sacTemasTopCerrados, plantilla),
    ]);
    setTemasRecibidos(r);
    setTemasVisualizados(v);
    setTemasPendientes(pe);
    setTemasProceso(pr);
    setTemasCerrados(c);
  }, [safeGet, funcs, temasRecibidos.length]);

  const fetchTipoContacto = useCallback(async () => {
    if (contactoRecibidos.length) return;
    const plantilla = "SAC - Discriminacion por tipo de contacto";
    const [r, c] = await Promise.all([
      safeGet(funcs.sacTipoContactoTopRecibidos, plantilla),
      safeGet(funcs.sacTipoContactoTopCerrados, plantilla),
    ]);
    setContactoRecibidos(r);
    setContactoCerrados(c);
  }, [safeGet, funcs, contactoRecibidos.length]);

  const fetchLlamadasBarrio = useCallback(async () => {
    if (llamadasBarrio.length) return;
    const data = await safeGet(
      funcs.sacLlamadasBarrioTop,
      "SAC - Evaluacion de llamadas por barrio",
    );
    setLlamadasBarrio(data);
  }, [safeGet, funcs, llamadasBarrio.length]);

  const fetchAmbiente = useCallback(async () => {
    if (ambienteReclamos.length) return;
    const plantilla = "SAC - Secretaria de ambiente y desarrollo sustentable";
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacAmbienteTopReclamos, plantilla),
      safeGet(funcs.sacAmbienteTopPromedios, plantilla),
      safeGet(funcs.sacAmbienteTopPendientes, plantilla),
      safeGet(funcs.sacAmbienteTopCerrados, plantilla),
    ]);
    setAmbienteReclamos(r);
    setAmbientePromedios(p);
    setAmbientePendientes(pe);
    setAmbienteCerrados(c);
  }, [safeGet, funcs, ambienteReclamos.length]);

  const fetchInfraestructura = useCallback(async () => {
    if (infraReclamos.length) return;
    const plantilla = "SAC - Secretaria de infraestructura";
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacInfraestructuraTopReclamos, plantilla),
      safeGet(funcs.sacInfraestructuraTopPromedios, plantilla),
      safeGet(funcs.sacInfraestructuraTopPendientes, plantilla),
      safeGet(funcs.sacInfraestructuraTopCerrados, plantilla),
    ]);
    setInfraReclamos(r);
    setInfraPromedios(p);
    setInfraPendientes(pe);
    setInfraCerrados(c);
  }, [safeGet, funcs, infraReclamos.length]);

  const fetchCoordinacion = useCallback(async () => {
    if (coordReclamos.length) return;
    const plantilla =
      "SAC - Secretaria de coordinacion de relaciones territoriales";
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacCoordTerritorialTopReclamos, plantilla),
      safeGet(funcs.sacCoordTerritorialTopPromedio, plantilla),
      safeGet(funcs.sacCoordTerritorialTopPendientes, plantilla),
      safeGet(funcs.sacCoordTerritorialTopCerrados, plantilla),
    ]);
    setCoordReclamos(r);
    setCoordPromedios(p);
    setCoordPendientes(pe);
    setCoordCerrados(c);
  }, [safeGet, funcs, coordReclamos.length]);

  // Cargar mapa de funciones y primer tab
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const funcRes = await apiClient.get("/functions");
        const map = funcRes.data.reduce((acc, f) => {
          acc[f.name] = f.endpoint;
          return acc;
        }, {});
        setFuncs(map);
      } catch (e) {
        setError(
          "Error al cargar las funciones disponibles para SAC. Contacta al administrador.",
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Disparar carga del tab activo
  useEffect(() => {
    if (!funcs || Object.keys(funcs).length === 0) return;
    switch (tabValue) {
      case 0:
        fetchVia();
        break;
      case 1:
        fetchCierre();
        break;
      case 2:
        fetchBoca();
        break;
      case 3:
        fetchFrecuencia();
        break;
      case 4:
        fetchTemas();
        break;
      case 5:
        fetchTipoContacto();
        break;
      case 6:
        fetchLlamadasBarrio();
        break;
      case 7:
        fetchAmbiente();
        break;
      case 8:
        fetchInfraestructura();
        break;
      case 9:
        fetchCoordinacion();
        break;
      default:
        break;
    }
  }, [tabValue, funcs, fetchVia, fetchCierre, fetchBoca, fetchFrecuencia, fetchTemas, fetchTipoContacto, fetchLlamadasBarrio, fetchAmbiente, fetchInfraestructura, fetchCoordinacion]);

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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
        Dashboard - SAC
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
          mb: 2,
        }}
      >
        Analisis del Sistema de Atencion al Ciudadano con graficos especializados
      </Typography>

      <Alert severity="info" sx={{ my: 2 }}>
        Este módulo permite analizar los reclamos y gestiones del SAC. Selecciona una sección.
      </Alert>

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
        <Button onClick={() => setTabValue(0)} startIcon={<icons.analitica />} sx={getTabButtonStyles(0)}>
          Vía de captación
        </Button>
        <Button onClick={() => setTabValue(1)} startIcon={<icons.archivo />} sx={getTabButtonStyles(1)}>
          Cierre de problemas
        </Button>
        <Button onClick={() => setTabValue(2)} startIcon={<icons.empresa />} sx={getTabButtonStyles(2)}>
          Boca receptora
        </Button>
        <Button onClick={() => setTabValue(3)} startIcon={<icons.resumen />} sx={getTabButtonStyles(3)}>
          Frecuencia tipos de cierre
        </Button>
        <Button onClick={() => setTabValue(4)} startIcon={<icons.analitica />} sx={getTabButtonStyles(4)}>
          Temas
        </Button>
        <Button onClick={() => setTabValue(5)} startIcon={<icons.campana />} sx={getTabButtonStyles(5)}>
          Tipo de contacto
        </Button>
        <Button onClick={() => setTabValue(6)} startIcon={<icons.archivo />} sx={getTabButtonStyles(6)}>
          Llamadas por barrio
        </Button>
        <Button onClick={() => setTabValue(7)} startIcon={<icons.analitica />} sx={getTabButtonStyles(7)}>
          Sec. Ambiente
        </Button>
        <Button onClick={() => setTabValue(8)} startIcon={<icons.analitica />} sx={getTabButtonStyles(8)}>
          Sec. Infraestructura
        </Button>
        <Button onClick={() => setTabValue(9)} startIcon={<icons.analitica />} sx={getTabButtonStyles(9)}>
          Sec. Coordinación Territorial
        </Button>
      </Box>

      {/* Tab 0: Vía de captación */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12}>
            {sacViaData.length > 0 ? (
              <CustomBarChart
                data={sacViaData}
                xKey="via"
                barKey="total"
                title="Vía de captación"
                isDarkMode={isDarkMode}
                height={400}
              />
            ) : (
              <Typography align="center">Sin datos</Typography>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Cierre de problemas */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {cierreReclamos.length > 0 && (
              <CustomBarChart
                data={cierreReclamos}
                xKey="problem"
                barKey="count"
                title="Cantidad de reclamos"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {cierrePromedios.length > 0 && (
              <CustomBarChart
                data={cierrePromedios}
                xKey="problem"
                barKey="avgClosure"
                title="Promedios días de cierre"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {cierrePendientes.length > 0 && (
              <CustomBarChart
                data={cierrePendientes}
                xKey="problem"
                barKey="pendientes"
                title="Cantidad de reclamos pendientes"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {cierreCerrados.length > 0 && (
              <CustomBarChart
                data={cierreCerrados}
                xKey="problem"
                barKey="cerrados"
                title="Cantidad de reclamos cerrados"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Boca receptora */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12}>
            {bocaData.length > 0 ? (
              <CustomBarChart
                data={bocaData}
                xKey="boca"
                barKey="cantidad"
                title="Top 5 bocas con mayor cantidad"
                isDarkMode={isDarkMode}
              />
            ) : (
              <Typography align="center">Sin datos</Typography>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Frecuencia tipos de cierre */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12}>
            {frecuenciaData.length > 0 ? (
              <CustomBarChart
                data={frecuenciaData}
                xKey="tipo"
                barKey="cantidad"
                title="Frecuencia de tipos de cierre"
                isDarkMode={isDarkMode}
              />
            ) : (
              <Typography align="center">Sin datos</Typography>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Temas */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {temasRecibidos.length > 0 && (
              <CustomBarChart
                data={temasRecibidos}
                xKey="area"
                barKey="valor"
                title="Top 5 temas recibidos por áreas"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {temasVisualizados.length > 0 && (
              <CustomBarChart
                data={temasVisualizados}
                xKey="area"
                barKey="valor"
                title="Top 5 visualizados sobre áreas"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {temasPendientes.length > 0 && (
              <CustomBarChart
                data={temasPendientes}
                xKey="area"
                barKey="valor"
                title="Top 5 temas pendientes sobre áreas"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {temasProceso.length > 0 && (
              <CustomBarChart
                data={temasProceso}
                xKey="area"
                barKey="valor"
                title="Top 5 temas en proceso sobre áreas"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {temasCerrados.length > 0 && (
              <CustomBarChart
                data={temasCerrados}
                xKey="area"
                barKey="valor"
                title="Top 5 temas cerrados sobre áreas"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Tipo de contacto */}
      {tabValue === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {contactoRecibidos.length > 0 && (
              <CustomBarChart
                data={contactoRecibidos}
                xKey="tipo"
                barKey="recibidos"
                title="Contactos recibidos"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {contactoCerrados.length > 0 && (
              <CustomBarChart
                data={contactoCerrados}
                xKey="tipo"
                barKey="cerrados"
                title="Contactos cerrados"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Llamadas por barrio */}
      {tabValue === 6 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12}>
            {llamadasBarrio.length > 0 ? (
              <CustomBarChart
                data={llamadasBarrio}
                xKey="barrio"
                barKey="realizadas"
                title="Top 5 barrios por llamadas realizadas"
                isDarkMode={isDarkMode}
              />
            ) : (
              <Typography align="center">Sin datos</Typography>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 7: Secretaría de Ambiente y Desarrollo Sustentable */}
      {tabValue === 7 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {ambienteReclamos.length > 0 && (
              <CustomBarChart
                data={ambienteReclamos}
                xKey="problem"
                barKey="count"
                title="Cantidad de reclamos"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {ambientePromedios.length > 0 && (
              <CustomBarChart
                data={ambientePromedios}
                xKey="problem"
                barKey="avgClosure"
                title="Promedios días de cierre"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {ambientePendientes.length > 0 && (
              <CustomBarChart
                data={ambientePendientes}
                xKey="problem"
                barKey="pendientes"
                title="Cantidad de reclamos pendientes"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {ambienteCerrados.length > 0 && (
              <CustomBarChart
                data={ambienteCerrados}
                xKey="problem"
                barKey="cerrados"
                title="Cantidad de reclamos cerrados"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 8: Secretaría de Infraestructura */}
      {tabValue === 8 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {infraReclamos.length > 0 && (
              <CustomBarChart
                data={infraReclamos}
                xKey="problem"
                barKey="count"
                title="Cantidad de reclamos"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {infraPromedios.length > 0 && (
              <CustomBarChart
                data={infraPromedios}
                xKey="problem"
                barKey="avgClosure"
                title="Promedios días de cierre"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {infraPendientes.length > 0 && (
              <CustomBarChart
                data={infraPendientes}
                xKey="problem"
                barKey="pendientes"
                title="Cantidad de reclamos pendientes"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {infraCerrados.length > 0 && (
              <CustomBarChart
                data={infraCerrados}
                xKey="problem"
                barKey="cerrados"
                title="Cantidad de reclamos cerrados"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 9: Secretaría de Coordinación de Relaciones Territoriales */}
      {tabValue === 9 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {coordReclamos.length > 0 && (
              <CustomBarChart
                data={coordReclamos}
                xKey="problem"
                barKey="count"
                title="Cantidad de reclamos"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {coordPromedios.length > 0 && (
              <CustomBarChart
                data={coordPromedios}
                xKey="problem"
                barKey="avgClosure"
                title="Promedios días de cierre"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {coordPendientes.length > 0 && (
              <CustomBarChart
                data={coordPendientes}
                xKey="problem"
                barKey="pendientes"
                title="Cantidad de reclamos pendientes"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {coordCerrados.length > 0 && (
              <CustomBarChart
                data={coordCerrados}
                xKey="problem"
                barKey="cerrados"
                title="Cantidad de reclamos cerrados"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardSAC;
