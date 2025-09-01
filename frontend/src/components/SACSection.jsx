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

  const safeGet = useCallback(async (endpoint, plantilla) => {
    if (!endpoint) return [];
    try {
      const res = await apiClient.get(endpoint, { params: { plantilla } });
      return res.data;
    } catch {
      return [];
    }
  }, []);

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
            {frecuenciaData.length > 0 && (
              <CustomBarChart data={frecuenciaData} xKey="tipo" barKey="cantidad" title="Tipos de cierre" isDarkMode={isDarkMode} />
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default SacSection;
