import React, { useState, useCallback } from 'react';
import { Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomBarChart from './CustomBarChart';
import MonthCutoffAlert from './MonthCutoffAlert';
import apiClient from '../services/api';

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
    [startDate, endDate]
  );

  const fetchCierre = useCallback(async () => {
    if (cierreReclamos.length) return;
    const plantilla = 'SAC - Cierre de problemas';
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacCierreProblemasTopReclamos, plantilla),
      safeGet(funcs.sacCierreProblemasTopPromedios, plantilla),
      safeGet(funcs.sacCierreProblemasTopPendientes, plantilla),
      safeGet(funcs.sacCierreProblemasTopCerrados, plantilla)
    ]);
    setCierreReclamos(r);
    setCierrePromedios(p);
    setCierrePendientes(pe);
    setCierreCerrados(c);
  }, [safeGet, funcs, cierreReclamos.length]);

  const fetchBoca = useCallback(async () => {
    if (bocaData.length) return;
    const data = await safeGet(funcs.sacBocaReceptoraTop, 'SAC - Boca receptora');
    setBocaData(data);
  }, [safeGet, funcs, bocaData.length]);

  const fetchFrecuencia = useCallback(async () => {
    if (frecuenciaData.length) return;
    const data = await safeGet(funcs.sacFrecuenciaTiposCierre, 'SAC - Frecuencia de tipos de cierre');
    setFrecuenciaData(data);
  }, [safeGet, funcs, frecuenciaData.length]);

  const fetchTemas = useCallback(async () => {
    if (temasRecibidos.length) return;
    const plantilla = 'SAC - Temas';
    const [r, v, pe, pr, c] = await Promise.all([
      safeGet(funcs.sacTemasTopRecibidos, plantilla),
      safeGet(funcs.sacTemasTopVisualizados, plantilla),
      safeGet(funcs.sacTemasTopPendientes, plantilla),
      safeGet(funcs.sacTemasTopProceso, plantilla),
      safeGet(funcs.sacTemasTopCerrados, plantilla)
    ]);
    setTemasRecibidos(r);
    setTemasVisualizados(v);
    setTemasPendientes(pe);
    setTemasProceso(pr);
    setTemasCerrados(c);
  }, [safeGet, funcs, temasRecibidos.length]);

  const fetchTipoContacto = useCallback(async () => {
    if (contactoRecibidos.length) return;
    const plantilla = 'SAC - Discriminación por tipo de contacto';
    const [r, c] = await Promise.all([
      safeGet(funcs.sacTipoContactoTopRecibidos, plantilla),
      safeGet(funcs.sacTipoContactoTopCerrados, plantilla)
    ]);
    setContactoRecibidos(r);
    setContactoCerrados(c);
  }, [safeGet, funcs, contactoRecibidos.length]);

  const fetchLlamadasBarrio = useCallback(async () => {
    if (llamadasBarrio.length) return;
    const data = await safeGet(funcs.sacLlamadasBarrioTop, 'SAC - Evaluación de llamadas por barrio');
    setLlamadasBarrio(data);
  }, [safeGet, funcs, llamadasBarrio.length]);

  const fetchAmbiente = useCallback(async () => {
    if (ambienteReclamos.length) return;
    const plantilla = 'SAC - Secretaria de ambiente y desarrollo sustentable';
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacAmbienteTopReclamos, plantilla),
      safeGet(funcs.sacAmbienteTopPromedios, plantilla),
      safeGet(funcs.sacAmbienteTopPendientes, plantilla),
      safeGet(funcs.sacAmbienteTopCerrados, plantilla)
    ]);
    setAmbienteReclamos(r);
    setAmbientePromedios(p);
    setAmbientePendientes(pe);
    setAmbienteCerrados(c);
  }, [safeGet, funcs, ambienteReclamos.length]);

  const fetchInfraestructura = useCallback(async () => {
    if (infraReclamos.length) return;
    const plantilla = 'SAC - Secretaria de infraestructura';
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacInfraestructuraTopReclamos, plantilla),
      safeGet(funcs.sacInfraestructuraTopPromedios, plantilla),
      safeGet(funcs.sacInfraestructuraTopPendientes, plantilla),
      safeGet(funcs.sacInfraestructuraTopCerrados, plantilla)
    ]);
    setInfraReclamos(r);
    setInfraPromedios(p);
    setInfraPendientes(pe);
    setInfraCerrados(c);
  }, [safeGet, funcs, infraReclamos.length]);

  const fetchCoordinacion = useCallback(async () => {
    if (coordReclamos.length) return;
    const plantilla = 'SAC - Secretaria de coordinación de relaciones territoriales';
    const [r, p, pe, c] = await Promise.all([
      safeGet(funcs.sacCoordinacionTopReclamos, plantilla),
      safeGet(funcs.sacCoordinacionTopPromedios, plantilla),
      safeGet(funcs.sacCoordinacionTopPendientes, plantilla),
      safeGet(funcs.sacCoordinacionTopCerrados, plantilla)
    ]);
    setCoordReclamos(r);
    setCoordPromedios(p);
    setCoordPendientes(pe);
    setCoordCerrados(c);
  }, [safeGet, funcs, coordReclamos.length]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          SAC
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {sacViaData.length > 0 && (
          <CustomBarChart
            data={sacViaData}
            xKey="via"
            barKey="total"
            title="Análisis de vía de captación"
            isDarkMode={isDarkMode}
            height={400}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchCierre()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Cierre de problemas</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {cierreReclamos.length > 0 && (
                  <CustomBarChart data={cierreReclamos} xKey="problem" barKey="count" title="Top reclamos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {cierrePromedios.length > 0 && (
                  <CustomBarChart data={cierrePromedios} xKey="problem" barKey="avgClosure" title="Top promedios" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {cierrePendientes.length > 0 && (
                  <CustomBarChart data={cierrePendientes} xKey="problem" barKey="pendientes" title="Top pendientes" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {cierreCerrados.length > 0 && (
                  <CustomBarChart data={cierreCerrados} xKey="problem" barKey="cerrados" title="Top cerrados" isDarkMode={isDarkMode} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchBoca()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Boca receptora</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            {bocaData.length > 0 && (
              <CustomBarChart data={bocaData} xKey="boca" barKey="cantidad" title="Top bocas" isDarkMode={isDarkMode} />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchFrecuencia()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Frecuencia de tipos de cierre</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            {frecuenciaData.length > 0 && (
              <CustomBarChart data={frecuenciaData} xKey="tipo" barKey="cantidad" title="Tipos de cierre" isDarkMode={isDarkMode} />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchTemas()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Análisis por temas</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {temasRecibidos.length > 0 && (
                  <CustomBarChart data={temasRecibidos} xKey="area" barKey="valor" title="Top recibidos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {temasVisualizados.length > 0 && (
                  <CustomBarChart data={temasVisualizados} xKey="area" barKey="valor" title="Top visualizados" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {temasPendientes.length > 0 && (
                  <CustomBarChart data={temasPendientes} xKey="area" barKey="valor" title="Top pendientes" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {temasProceso.length > 0 && (
                  <CustomBarChart data={temasProceso} xKey="area" barKey="valor" title="Top en proceso" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12}>
                {temasCerrados.length > 0 && (
                  <CustomBarChart data={temasCerrados} xKey="area" barKey="valor" title="Top cerrados" isDarkMode={isDarkMode} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchTipoContacto()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Discriminación por tipo de contacto</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {contactoRecibidos.length > 0 && (
                  <CustomBarChart data={contactoRecibidos} xKey="tipo" barKey="recibidos" title="Top recibidos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {contactoCerrados.length > 0 && (
                  <CustomBarChart data={contactoCerrados} xKey="tipo" barKey="cerrados" title="Top cerrados" isDarkMode={isDarkMode} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchLlamadasBarrio()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Evaluación de llamadas por barrio</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            {llamadasBarrio.length > 0 && (
              <CustomBarChart data={llamadasBarrio} xKey="barrio" barKey="realizadas" title="Top llamadas" isDarkMode={isDarkMode} />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchAmbiente()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Secretaría de Ambiente y Desarrollo Sustentable</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {ambienteReclamos.length > 0 && (
                  <CustomBarChart data={ambienteReclamos} xKey="problem" barKey="count" title="Top reclamos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {ambientePromedios.length > 0 && (
                  <CustomBarChart data={ambientePromedios} xKey="problem" barKey="avgClosure" title="Top promedios" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {ambientePendientes.length > 0 && (
                  <CustomBarChart data={ambientePendientes} xKey="problem" barKey="pendientes" title="Top pendientes" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {ambienteCerrados.length > 0 && (
                  <CustomBarChart data={ambienteCerrados} xKey="problem" barKey="cerrados" title="Top cerrados" isDarkMode={isDarkMode} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchInfraestructura()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Secretaría de Infraestructura</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {infraReclamos.length > 0 && (
                  <CustomBarChart data={infraReclamos} xKey="problem" barKey="count" title="Top reclamos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {infraPromedios.length > 0 && (
                  <CustomBarChart data={infraPromedios} xKey="problem" barKey="avgClosure" title="Top promedios" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {infraPendientes.length > 0 && (
                  <CustomBarChart data={infraPendientes} xKey="problem" barKey="pendientes" title="Top pendientes" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {infraCerrados.length > 0 && (
                  <CustomBarChart data={infraCerrados} xKey="problem" barKey="cerrados" title="Top cerrados" isDarkMode={isDarkMode} />
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion onChange={(_, exp) => exp && fetchCoordinacion()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Secretaría de Coordinación de Relaciones Territoriales</AccordionSummary>
          <AccordionDetails>
            <MonthCutoffAlert systemName="SAC" startDate={startDate} endDate={endDate} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {coordReclamos.length > 0 && (
                  <CustomBarChart data={coordReclamos} xKey="problem" barKey="count" title="Top reclamos" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {coordPromedios.length > 0 && (
                  <CustomBarChart data={coordPromedios} xKey="problem" barKey="avgClosure" title="Top promedios" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {coordPendientes.length > 0 && (
                  <CustomBarChart data={coordPendientes} xKey="problem" barKey="pendientes" title="Top pendientes" isDarkMode={isDarkMode} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {coordCerrados.length > 0 && (
                  <CustomBarChart data={coordCerrados} xKey="problem" barKey="cerrados" title="Top cerrados" isDarkMode={isDarkMode} />
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
