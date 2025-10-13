import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, Typography, Grid, TextField, Stack, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTheme } from "../../../context/ThemeContext.jsx";
import icons from "../../../ui/icons.js";
import ExpedientesQuickNav from "./ExpedientesQuickNav.jsx";

const titleCase = (str) => {
  try {
    return String(str || "").toLowerCase().replace(/\b([a-záéíóúñü])([a-záéíóúñü]*)/g, (_, f, r) => f.toUpperCase() + r);
  } catch { return String(str || ""); }
};

const ExpedientesFormPage = () => {
  const { isDarkMode } = useTheme();
  const TIPO_OPTIONS = useMemo(() => ["Sanción", "Cesantía", "Auditoría", "Otro"], []);
  const ESTADO_EXP_OPTIONS = useMemo(() => ["En proceso", "Finalizado", "Iniciado", "No iniciado"], []);

  const [expedientesCargados, setExpedientesCargados] = useState([]);
  useEffect(() => { try { const saved = localStorage.getItem("expedientes_cargados"); if (saved) setExpedientesCargados(JSON.parse(saved)); } catch(_){} }, []);
  useEffect(() => { try { localStorage.setItem("expedientes_cargados", JSON.stringify(expedientesCargados)); } catch(_){} }, [expedientesCargados]);

  const [form, setForm] = useState({ tipo: '', expNro: '', estadoAgente: '', fechaInicio: '', iniciadoPor: '', tramite: '', dondeEsta: '', agente: '', dni: '', inasist: '', estadoExp: '', resolucion: '', observaciones: '' });
  const [errors, setErrors] = useState({});

  const addCargado = (row) => setExpedientesCargados((prev) => [...prev, row]);

  const onSubmit = (e) => {
    e?.preventDefault?.();
    const errs = { tipo: !form.tipo, expNro: !form.expNro, estadoExp: !form.estadoExp };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const clean = { ...form, agente: titleCase(form.agente), iniciadoPor: titleCase(form.iniciadoPor), dondeEsta: titleCase(form.dondeEsta) };
    addCargado(clean);
    setForm({ tipo: '', expNro: '', estadoAgente: '', fechaInicio: '', iniciadoPor: '', tramite: '', dondeEsta: '', agente: '', dni: '', inasist: '', estadoExp: '', resolucion: '', observaciones: '' });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, color: 'white', background: isDarkMode ? 'linear-gradient(90deg, #3a2f4a 0%, #241c35 100%)' : 'linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Cargar expedientes</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Completa el formulario y agrega los expedientes a la hoja.</Typography>
      </Box>
      <ExpedientesQuickNav current="cargar" />
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box component="form" onSubmit={onSubmit} sx={{ px: 0.5 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select label="Tipo" value={form.tipo} onChange={(e) => { setForm((p) => ({ ...p, tipo: e.target.value })); setErrors((er) => ({ ...er, tipo: false })); }} error={!!errors.tipo}>
                  {TIPO_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Exp.Nro." value={form.expNro} onChange={(e) => { setForm((p) => ({ ...p, expNro: e.target.value })); setErrors((er) => ({ ...er, expNro: false })); }} error={!!errors.expNro} helperText={errors.expNro ? 'Campo obligatorio' : ''} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Estado Agente" value={form.estadoAgente} onChange={(e) => setForm((p) => ({ ...p, estadoAgente: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" type="date" label="Fecha de inicio" InputLabelProps={{ shrink: true }} value={form.fechaInicio} onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Iniciado por" value={form.iniciadoPor} onChange={(e) => setForm((p) => ({ ...p, iniciadoPor: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Tramite" value={form.tramite} onChange={(e) => setForm((p) => ({ ...p, tramite: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Dónde está" value={form.dondeEsta} onChange={(e) => setForm((p) => ({ ...p, dondeEsta: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Agente" value={form.agente} onChange={(e) => setForm((p) => ({ ...p, agente: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="DNI" value={form.dni} onChange={(e) => setForm((p) => ({ ...p, dni: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Inasist." value={form.inasist} onChange={(e) => setForm((p) => ({ ...p, inasist: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado del Exp.</InputLabel>
                <Select label="Estado del Exp." value={form.estadoExp} onChange={(e) => { setForm((p) => ({ ...p, estadoExp: e.target.value })); setErrors((er) => ({ ...er, estadoExp: false })); }} error={!!errors.estadoExp}>
                  {ESTADO_EXP_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Resolución" value={form.resolucion} onChange={(e) => setForm((p) => ({ ...p, resolucion: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Observaciones" value={form.observaciones} multiline minRows={2} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<icons.agregar />} onClick={onSubmit}>Agregar</Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default ExpedientesFormPage;
