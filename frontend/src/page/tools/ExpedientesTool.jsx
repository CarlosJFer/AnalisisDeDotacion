import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Stack,
  Chip,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import icons from "../../ui/icons.js";

const titleCase = (str) => {
  try {
    return String(str || "")
      .toLowerCase()
      .replace(/\b([a-záéíóúñü])([a-záéíóúñü]*)/g, (_, f, r) => f.toUpperCase() + r);
  } catch {
    return String(str || "");
  }
};

const normalizeExpNumber = (val) => {
  const s = String(val || "").trim();
  if (!s) return "";
  const right = s.length > 2 ? s.slice(2) : s;
  return right.replace(/-0+(\d+)/, "-$1");
};

const findHeaderRow = (matrix, requiredKeys = []) => {
  for (let r = 0; r < Math.min(matrix.length, 20); r++) {
    const row = matrix[r] || [];
    const textRow = row.map((c) => String(c || "").toLowerCase());
    const ok = requiredKeys.every((k) => textRow.some((cell) => cell.includes(k)));
    if (ok) return r;
  }
  return -1;
};

const mapHeaders = (headerRow, aliases) => {
  const map = {};
  const hdr = (headerRow || []).map((c) => String(c || "").toLowerCase());
  Object.entries(aliases).forEach(([key, alist]) => {
    const idx = hdr.findIndex((h) => alist.some((a) => h.includes(a)));
    map[key] = idx >= 0 ? idx : -1;
  });
  return map;
};

const ExpedientesTool = () => {
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState(0);

  // Archivos
  const [fileBase, setFileBase] = useState(null);

  // Datos resultantes
  const [sinMovimiento, setSinMovimiento] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [cerrados, setCerrados] = useState([]);
  const [control, setControl] = useState({});
  // Persistir última revisión
  useEffect(() => {
    try {
      const lr = localStorage.getItem("expedientes_ultima_revision");
      if (lr) setControl((c) => ({ ...c, ultimaRevision: lr }));
    } catch (_) {}
  }, []);

  // Expedientes cargados (13 columnas) - carga manual
  const [expedientesCargados, setExpedientesCargados] = useState([]);
  const TIPO_OPTIONS = useMemo(() => ["Sanción", "Cesantía", "Auditoría", "Otro"], []);
  const ESTADO_EXP_OPTIONS = useMemo(() => ["En proceso", "Finalizado", "Iniciado", "No iniciado"], []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("expedientes_cargados");
      if (saved) setExpedientesCargados(JSON.parse(saved));
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("expedientes_cargados", JSON.stringify(expedientesCargados));
    } catch (_) {}
  }, [expedientesCargados]);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const readWorkbook = async (file) => {
    const data = await file.arrayBuffer();
    return XLSX.read(data);
  };

  const exportGridToExcel = useCallback((columns, rows, sheetName = "Datos", fileLabel = "export") => {
    try {
      const cols = Array.isArray(columns) ? columns : [];
      const rws = Array.isArray(rows) ? rows : [];
      if (!cols.length) {
        setSnack({ open: true, message: "No hay columnas para exportar", severity: "error" });
        return;
      }
      if (!rws.length) {
        setSnack({ open: true, message: "No hay datos para exportar", severity: "error" });
        return;
      }
      const headers = cols.map((c) => c.headerName || c.field || "");
      const data = rws.map((row) => cols.map((c) => row?.[c.field] ?? ""));
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      const safeSheet = String(sheetName || "Datos").slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeSheet);
      const dt = new Date();
      const fileName = `seguimiento-expedientes-${(fileLabel || sheetName).toString().toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,"0")}${String(dt.getDate()).padStart(2,"0")}_${String(dt.getHours()).padStart(2,"0")}${String(dt.getMinutes()).padStart(2,"0")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      setSnack({ open: true, message: "Excel exportado", severity: "success" });
    } catch (e) {
      console.error("Error al exportar Excel:", e);
      setSnack({ open: true, message: e?.message || "Error al exportar", severity: "error" });
    }
  }, []);

  const handleProcesar = async () => {
    if (!fileBase) {
      setSnack({ open: true, message: "Debes seleccionar Base expediente.xlsx", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const wbBase = await readWorkbook(fileBase);
      const wsBase = wbBase.Sheets[wbBase.SheetNames[0]];
      const matBase = XLSX.utils.sheet_to_json(wsBase, { header: 1, defval: "" });
      
      // Tomar los datos desde la hoja manual 'Expedientes cargados' (estado local)
      const listCarg = (expedientesCargados || []).map((r) => ({
        tipo: String(r.tipo || "").trim(),
        exp: normalizeExpNumber(r.expNro || r.exp || r.expNro),
        estado: String(r.estadoExp || r.estado || "").trim(),
        donde: String(r.dondeEsta || r.donde || "").trim(),
        nombre: titleCase(r.agente || r.nombre || ""),
        dni: String(r.dni || "").trim(),
      }));

      let baseHdrIdx = findHeaderRow(matBase, ["exp", "dep"]);
      let idxExpBase = 12; // M
      let idxDepBase = 13; // N
      if (baseHdrIdx >= 0) {
        const hdrB = matBase[baseHdrIdx];
        const mapB = mapHeaders(hdrB, { exp: ["exp", "exped"], dep: ["depend", "secretar"] });
        if (mapB.exp >= 0) idxExpBase = mapB.exp;
        if (mapB.dep >= 0) idxDepBase = mapB.dep;
      }

      const expedientesBase = new Map();
      for (let i = baseHdrIdx >= 0 ? baseHdrIdx + 1 : 1; i < matBase.length; i++) {
        const row = matBase[i] || [];
        const expRaw = row[idxExpBase];
        const dep = row[idxDepBase];
        const exp = normalizeExpNumber(expRaw);
        if (exp && dep) expedientesBase.set(String(exp).trim(), String(dep).trim());
      }

      const outSinMov = [];
      const outFaltantes = [];
      const outCerrados = [];

      let enProceso = 0, finalizados = 0, iniciados = 0;
      let cesantia = 0, sancion = 0, otro = 0, auditoria = 0;

      for (const rec of listCarg) {
        if (rec.estado.toLowerCase().includes("final")) finalizados++;
        if (rec.estado.toLowerCase().includes("proceso")) enProceso++;
        if (rec.estado.toLowerCase().includes("inici")) iniciados++;
        const t = rec.tipo.toLowerCase();
        if (t.includes("cesant")) cesantia++; else if (t.includes("sanci")) sancion++; else if (t.includes("auditor")) auditoria++; else if (t) otro++;
        if (rec.estado.toLowerCase().includes("proceso") && rec.exp) {
          if (expedientesBase.has(rec.exp)) {
            const nuevaDep = expedientesBase.get(rec.exp);
            const baseDepNorm = String(nuevaDep || "").trim().toLowerCase();
            const cargDepNorm = String(rec.donde || "").trim().toLowerCase();
            if (baseDepNorm === "div. de archivos e impresiones".toLowerCase()) {
              outCerrados.push({ dep: titleCase(nuevaDep), exp: rec.exp, nombre: rec.nombre, dni: rec.dni });
            } else if (baseDepNorm === cargDepNorm) {
              outSinMov.push({ dep: titleCase(rec.donde), exp: rec.exp, nombre: rec.nombre, dni: rec.dni, tipo: rec.tipo });
            }
          } else {
            outFaltantes.push({ dep: titleCase(rec.donde), exp: rec.exp, nombre: rec.nombre, dni: rec.dni });
          }
        }
      }

      setSinMovimiento(outSinMov);
      setFaltantes(outFaltantes);
      setCerrados(outCerrados);

      const dggam = "Direccion General De Gestion Del Agente Municipal".toLowerCase();
      const setC = new Set(listCarg.map((r) => r.exp).filter(Boolean));
      let sinCargarDGGA = 0;
      for (let i = baseHdrIdx >= 0 ? baseHdrIdx + 1 : 1; i < matBase.length; i++) {
        const row = matBase[i] || [];
        const exp = normalizeExpNumber(row[idxExpBase]);
        const depO = String(row[idxDepBase] || "").toLowerCase();
        if (depO === dggam && exp && !setC.has(exp)) sinCargarDGGA++;
      }

      const lr = new Date().toLocaleString();
      setControl({
        totalEncontrados: listCarg.length,
        totalFaltantes: outFaltantes.length,
        iniciados,
        cesantia,
        sancion,
        otros: otro,
        auditoria,
        finalizados,
        enProceso,
        faltantesEnProceso: outFaltantes.length,
        cerrados: outCerrados.length,
        ultimaRevision: lr,
        sinCargarDGGA,
        malCargados: 0,
      });
      try { localStorage.setItem("expedientes_ultima_revision", lr); } catch (_) {}

      setSnack({ open: true, message: `Procesado: Sin movimiento: ${outSinMov.length}, Faltantes: ${outFaltantes.length}, Cerrados: ${outCerrados.length}`, severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: e?.message || "Error al procesar", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setSinMovimiento([]); setFaltantes([]); setCerrados([]); setControl({});
    setSnack({ open: true, message: "Datos limpiados", severity: "success" });
  };

  const UploadField = ({ label, file, onFile, required = false }) => {
    const [dragOver, setDragOver] = useState(false);
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer?.files?.[0] || null; if (f) onFile(f); };
    const handleChange = (e) => onFile(e.target.files?.[0] || null);
    return (
      <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} sx={{ p: 1.2, borderRadius: 2, border: '2px dashed', borderColor: dragOver ? (isDarkMode ? '#9b4d9b' : '#cc2b5e') : (required && !file ? (isDarkMode ? 'rgba(255,0,0,0.4)' : 'rgba(255,0,0,0.3)') : 'divider'), background: dragOver ? (isDarkMode ? 'rgba(155,77,155,0.1)' : 'rgba(204,43,94,0.05)') : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'), transition: 'all .15s ease', }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Button component="label" variant="outlined" startIcon={<icons.excel />} sx={{ minWidth: 260 }}>
            {label}
            <input hidden type="file" accept=".xls,.xlsx" onChange={handleChange} />
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            {required && !file && (<Chip label="Requerido" color="warning" variant="outlined" size="small" />)}
            {file && (<Chip label={file.name} onDelete={() => onFile(null)} variant="outlined" sx={{ maxWidth: 260, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />)}
          </Stack>
        </Stack>
      </Box>
    );
  };

  const colsSinMov = useMemo(() => ([
    { field: "dep", headerName: "Dependencia", width: 260 },
    { field: "exp", headerName: "Exp.Nro.", width: 180 },
    { field: "nombre", headerName: "Apellido y Nombre", width: 260 },
    { field: "dni", headerName: "DNI", width: 140 },
    { field: "tipo", headerName: "Tipo", width: 160 },
  ]), []);

  const colsFalt = useMemo(() => ([
    { field: "dep", headerName: "Dependencia", width: 260 },
    { field: "exp", headerName: "Exp.Nro.", width: 180 },
    { field: "nombre", headerName: "Apellido y Nombre", width: 260 },
    { field: "dni", headerName: "DNI", width: 140 },
  ]), []);

  const colsCerr = useMemo(() => ([
    { field: "dep", headerName: "Dependencia", width: 260 },
    { field: "exp", headerName: "Exp.Nro.", width: 180 },
    { field: "nombre", headerName: "Apellido y Nombre", width: 260 },
    { field: "dni", headerName: "DNI", width: 140 },
  ]), []);

  const rowsSinMov = useMemo(() => (sinMovimiento || []).map((r, i) => ({ id: i + 1, ...r })), [sinMovimiento]);
  const rowsFalt = useMemo(() => (faltantes || []).map((r, i) => ({ id: i + 1, ...r })), [faltantes]);
  const rowsCerr = useMemo(() => (cerrados || []).map((r, i) => ({ id: i + 1, ...r })), [cerrados]);

  // Hoja: Expedientes cargados (13 columnas)
  const cargCols = useMemo(() => ([
    { field: 'tipo', headerName: 'Tipo', width: 140, editable: true, type: 'singleSelect', valueOptions: TIPO_OPTIONS },
    { field: 'expNro', headerName: 'Exp.Nro.', width: 160, editable: true },
    { field: 'estadoAgente', headerName: 'Estado Agente', width: 160, editable: true },
    { field: 'fechaInicio', headerName: 'Fecha de inicio', width: 160, editable: true },
    { field: 'iniciadoPor', headerName: 'Iniciado por', width: 180, editable: true },
    { field: 'tramite', headerName: 'Tramite', width: 160, editable: true },
    { field: 'dondeEsta', headerName: 'Dónde está', width: 200, editable: true },
    { field: 'agente', headerName: 'Agente', width: 220, editable: true },
    { field: 'dni', headerName: 'DNI', width: 140, editable: true },
    { field: 'inasist', headerName: 'Inasist.', width: 120, editable: true },
    { field: 'estadoExp', headerName: 'Estado del Exp.', width: 180, editable: true, type: 'singleSelect', valueOptions: ESTADO_EXP_OPTIONS },
    { field: 'resolucion', headerName: 'Resolución', width: 160, editable: true },
    { field: 'observaciones', headerName: 'Observaciones', width: 240, editable: true },
  ]), [TIPO_OPTIONS, ESTADO_EXP_OPTIONS]);
  const cargRows = useMemo(() => (expedientesCargados || []).map((r, i) => ({ id: i + 1, ...r })), [expedientesCargados]);

  const addCargado = (data) => {
    setExpedientesCargados((prev) => [...prev, data]);
  };
  const removeCargado = (id) => {
    setExpedientesCargados((prev) => prev.filter((_, idx) => idx + 1 !== id));
  };
  const updateCargadoRow = (newRow) => {
    setExpedientesCargados((prev) => {
      const next = [...prev];
      const idx = (newRow.id ?? 1) - 1;
      const rowCopy = { ...newRow };
      delete rowCopy.id;
      if (next[idx]) next[idx] = rowCopy;
      return next;
    });
  };
  const handleClearCargados = () => {
    const ok = window.confirm('¿Limpiar toda la hoja de "Expedientes cargados"? Esta acción no se puede deshacer.');
    if (!ok) return;
    setExpedientesCargados([]);
    setSnack({ open: true, message: 'Hoja limpiada', severity: 'success' });
  };

  // Formulario: Cargar expedientes
  const [form, setForm] = useState({
    tipo: '', expNro: '', estadoAgente: '', fechaInicio: '', iniciadoPor: '', tramite: '', dondeEsta: '', agente: '', dni: '', inasist: '', estadoExp: '', resolucion: '', observaciones: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const onSubmitForm = (e) => {
    e?.preventDefault?.();
    const errs = {
      tipo: !form.tipo,
      expNro: !form.expNro,
      estadoExp: !form.estadoExp,
    };
    setFormErrors(errs);
    const hasErr = Object.values(errs).some(Boolean);
    if (hasErr) { setSnack({ open: true, message: 'Completá los campos obligatorios: Tipo, Exp.Nro. y Estado del Exp.', severity: 'error' }); return; }
    const clean = {
      ...form,
      agente: titleCase(form.agente),
      iniciadoPor: titleCase(form.iniciadoPor),
      dondeEsta: titleCase(form.dondeEsta),
    };
    addCargado(clean);
    setForm({ tipo: '', expNro: '', estadoAgente: '', fechaInicio: '', iniciadoPor: '', tramite: '', dondeEsta: '', agente: '', dni: '', inasist: '', estadoExp: '', resolucion: '', observaciones: '' });
    setFormErrors({});
    setSnack({ open: true, message: 'Expediente agregado', severity: 'success' });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, color: 'white', background: isDarkMode ? 'linear-gradient(90deg, #3a2f4a 0%, #241c35 100%)' : 'linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Seguimiento de Expedientes</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Carga los archivos y procesa para ver expedientes sin movimiento, faltantes y cerrados.</Typography>
      </Box>
      {/* Módulo arriba: carga de archivos */}
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Carga de archivos</Typography>
        <Stack spacing={1.5}>
          <UploadField label="Base expediente.xlsx" file={fileBase} onFile={setFileBase} required />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<icons.refrescar />} onClick={handleProcesar} sx={{ background: "linear-gradient(90deg, #2b5876 0%, #4e4376 100%)", '&:hover': { background: "linear-gradient(90deg, #254d66 0%, #463d6a 100%)" } }}>Procesar</Button>
          <Button variant="outlined" startIcon={<icons.limpiar />} onClick={handleLimpiar}>Limpiar</Button>
        </Stack>
      </Card>

      {/* Módulo abajo: resultados con pestañas */}
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Chip icon={<icons.tiempo />} label={`Última revisión: ${control.ultimaRevision || '-'}`} size="small" variant="outlined" />
        </Box>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          textColor="inherit"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': { gap: 2 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 48,
              px: 2,
              borderRadius: 2,
              color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
              outline: 'none',
              boxShadow: 'none',
            },
            '& .MuiTab-root.Mui-selected': {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: isDarkMode ? '#fff' : '#000',
            },
            '& .MuiTab-root.Mui-focusVisible': { outline: 'none' },
            '& .MuiTab-root:focus': { outline: 'none' },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
              background: isDarkMode
                ? 'linear-gradient(90deg, #9b4d9b, #6a4c93)'
                : 'linear-gradient(90deg, #cc2b5e, #753a88)',
            },
          }}
        >
          <Tab disableRipple icon={<icons.advertencia fontSize="small" />} iconPosition="start" label="Expedientes sin movimiento" />
          <Tab disableRipple icon={<icons.error fontSize="small" />} iconPosition="start" label="Expedientes faltantes" />
          <Tab disableRipple icon={<icons.exito fontSize="small" />} iconPosition="start" label="Expedientes cerrados" />
          <Tab disableRipple icon={<icons.analitica fontSize="small" />} iconPosition="start" label="Control de expedientes" />
        </Tabs>
        <CardContent>
              {tab === 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsSinMov.length} onClick={() => exportGridToExcel(colsSinMov, rowsSinMov, 'Sin movimiento', 'sin-movimiento')}>Exportar Excel</Button>
                  </Box>
                  <DataGrid rows={rowsSinMov} columns={colsSinMov} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
                </>
              )}
              {tab === 1 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsFalt.length} onClick={() => exportGridToExcel(colsFalt, rowsFalt, 'Faltantes', 'faltantes')}>Exportar Excel</Button>
                  </Box>
                  <DataGrid rows={rowsFalt} columns={colsFalt} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
                </>
              )}
              {tab === 2 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsCerr.length} onClick={() => exportGridToExcel(colsCerr, rowsCerr, 'Cerrados', 'cerrados')}>Exportar Excel</Button>
                  </Box>
                  <DataGrid rows={rowsCerr} columns={colsCerr} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
                </>
              )}
              {tab === 3 && (
                <Grid container spacing={2}>
                  {[{
                    label: 'Total exp. encontrados', value: control.totalEncontrados || 0
                  },{
                    label: 'Total de exp. faltantes', value: control.totalFaltantes || 0
                  },{
                    label: 'Exp. iniciados', value: control.iniciados || 0
                  },{
                    label: 'Exp. cesantes', value: control.cesantia || 0
                  },{
                    label: 'Exp. sanciones', value: control.sancion || 0
                  },{
                    label: 'Otros exp.', value: control.otros || 0
                  },{
                    label: 'Exp. de auditoria', value: control.auditoria || 0
                  },{
                    label: 'Exp. finalizados', value: control.finalizados || 0
                  },{
                    label: 'Exp. en proceso', value: control.enProceso || 0
                  },{
                    label: 'Exp. faltantes en proceso', value: control.faltantesEnProceso || 0
                  },{
                    label: 'Exp. cerrados', value: control.cerrados || 0
                  },{
                    label: 'Última revisión', value: control.ultimaRevision || '-'
                  },{
                    label: 'Exp. sin cargar de la Dir. de Personal', value: control.sinCargarDGGA || 0
                  }].map((card, idx) => (
                    <Grid key={idx} item xs={12} sm={6} md={4}>
                      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
        </CardContent>
      </Card>

      {/* Formulario de carga manual */}
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Cargar expedientes</Typography>
        <Box component="form" onSubmit={onSubmitForm} sx={{ px: 0.5 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select label="Tipo" value={form.tipo} onChange={(e) => { setForm((p) => ({ ...p, tipo: e.target.value })); setFormErrors((er) => ({ ...er, tipo: false })); }} error={!!formErrors.tipo}>
                  {TIPO_OPTIONS.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Exp.Nro." value={form.expNro} onChange={(e) => { setForm((p) => ({ ...p, expNro: e.target.value })); setFormErrors((er) => ({ ...er, expNro: false })); }} error={!!formErrors.expNro} helperText={formErrors.expNro ? 'Campo obligatorio' : ''} />
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
                <Select label="Estado del Exp." value={form.estadoExp} onChange={(e) => { setForm((p) => ({ ...p, estadoExp: e.target.value })); setFormErrors((er) => ({ ...er, estadoExp: false })); }} error={!!formErrors.estadoExp}>
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
            <Button variant="contained" startIcon={<icons.agregar />} onClick={onSubmitForm}>Agregar</Button>
          </Stack>
        </Box>
      </Card>

      {/* Hoja: Expedientes cargados */}
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Expedientes cargados</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<icons.limpiar />} disabled={!cargRows.length} onClick={handleClearCargados}>Limpiar hoja</Button>
            <Button variant="outlined" startIcon={<icons.excel />} disabled={!cargRows.length} onClick={() => exportGridToExcel(cargCols, cargRows, 'Expedientes cargados', 'expedientes-cargados')}>Exportar Excel</Button>
          </Stack>
        </Stack>
        <DataGrid
          rows={cargRows}
          columns={[...cargCols, { field: 'acciones', headerName: 'Acciones', width: 120, renderCell: (params) => (
            <Button size="small" color="error" onClick={() => removeCargado(params.row.id)} startIcon={<icons.eliminar />}>Borrar</Button>
          )}]}
          autoHeight
          density="compact"
          pageSizeOptions={[10,25,50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          processRowUpdate={(newRow) => {
            // Validaciones mínimas en edición de grilla
            const tipoOk = !newRow.tipo || TIPO_OPTIONS.includes(newRow.tipo);
            const estadoOk = !newRow.estadoExp || ESTADO_EXP_OPTIONS.includes(newRow.estadoExp);
            const expOk = !!(newRow.expNro && String(newRow.expNro).trim());
            if (!tipoOk || !estadoOk || !expOk) {
              const msg = !expOk ? 'Exp.Nro. es obligatorio' : 'Valor inválido en Tipo o Estado del Exp.';
              throw new Error(msg);
            }
            updateCargadoRow(newRow);
            return newRow;
          }}
          onProcessRowUpdateError={(err) => setSnack({ open: true, message: err?.message || 'Error al actualizar fila', severity: 'error' })}
        />
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>

      {loading && (
        <Box sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
          <Typography variant="body2" sx={{ color: '#fff' }}>Procesando...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExpedientesTool;
