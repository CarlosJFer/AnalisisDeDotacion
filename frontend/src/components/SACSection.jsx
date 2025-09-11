import React, { useState, useCallback } from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Alert,
} from "@mui/material";
import icons from "../ui/icons.js";
import CustomBarChart from "./CustomBarChart";
import MonthCutoffAlert from "./MonthCutoffAlert";
import apiClient from "../services/api";

const SacSection = ({ sacViaData, funcs, isDarkMode, startDate, endDate }) => {
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
    async (endpoint, plantilla) => {
      if (!endpoint) return [];
      try {
        const params = { plantilla };
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        const res = await apiClient.get(endpoint, { params });
        return res.data;
      } catch {
        return [];
      }
    },
    [startDate, endDate],
  );

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
    const data = await safeGet(
      funcs.sacBocaReceptoraTop,
      "SAC - Boca receptora",
    );
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" align="center" fontWeight={700} mt={4}>
          SAC
        </Typography>
        <Alert severity="info" sx={{ my: 2 }}>
          Este módulo permite analizar los reclamos y gestiones del Sistema de
          Atención al Ciudadano. Selecciona un panel para ver sus gráficos.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Análisis de vía de captación
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            {sacViaData.length > 0 && (
              <CustomBarChart
                data={sacViaData}
                xKey="via"
                barKey="total"
                title="Vía de captación"
                isDarkMode={isDarkMode}
                height={400}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchCierre()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Análisis de cierre por problemas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchBoca()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Análisis por boca receptora
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            {bocaData.length > 0 && (
              <CustomBarChart
                data={bocaData}
                xKey="boca"
                barKey="cantidad"
                title="Top 5 bocas con mayor cantidad"
                isDarkMode={isDarkMode}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchFrecuencia()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Análisis de frecuencia de tipo de cierre
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            {frecuenciaData.length > 0 && (
              <CustomBarChart
                data={frecuenciaData}
                xKey="tipo"
                barKey="cantidad"
                title="Frecuencia de tipos de cierre"
                isDarkMode={isDarkMode}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchTemas()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Análisis por temas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchTipoContacto()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Discriminación por tipo de contacto
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchLlamadasBarrio()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Evaluación de llamadas por barrio
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            {llamadasBarrio.length > 0 && (
              <CustomBarChart
                data={llamadasBarrio}
                xKey="barrio"
                barKey="realizadas"
                title="Top 5 barrios por llamadas realizadas"
                isDarkMode={isDarkMode}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchAmbiente()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Secretaría de Ambiente y Desarrollo Sustentable
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchInfraestructura()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Secretaría de Infraestructura
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchCoordinacion()}>
          <AccordionSummary
            expandIcon={<icons.expandir />}
            sx={{ bgcolor: isDarkMode ? "grey.800" : "grey.200" }}
          >
            <Typography variant="h6" fontWeight={600}>
              Secretaría de Coordinación de Relaciones Territoriales
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert
              systemName="SAC"
              startDate={startDate}
              endDate={endDate}
            />
            <Grid container spacing={3}>
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
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default SacSection;
