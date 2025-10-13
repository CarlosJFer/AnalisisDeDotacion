import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Stack, Button, Chip, Tabs, Tab } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { useTheme } from "../../../context/ThemeContext.jsx";
import icons from "../../../ui/icons.js";
import ExpedientesQuickNav from "./ExpedientesQuickNav.jsx";

const titleCase = (s) => { try { return String(s||"").toLowerCase().replace(/\b([a-záéíóúñü])([a-záéíóúñü]*)/g, (_,f,r)=>f.toUpperCase()+r); } catch{ return String(s||""); } };
const normalizeExpNumber = (val) => { const s = String(val||"").trim(); if (!s) return ""; const right = s.length>2 ? s.slice(2) : s; return right.replace(/-0+(\d+)/, "-$1"); };
const readWorkbook = async (file) => { const data = await file.arrayBuffer(); return XLSX.read(data); };

const ExpedientesProcesoPage = () => {
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState(0);
  const [fileBase, setFileBase] = useState(null);
  const [sinMovimiento, setSinMovimiento] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [cerrados, setCerrados] = useState([]);
  const [control, setControl] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => { try { const lr = localStorage.getItem("expedientes_ultima_revision"); if (lr) setControl((c)=>({ ...c, ultimaRevision: lr })); } catch(_){} }, []);

  const exportGridToExcel = useCallback((columns, rows, sheetName = "Datos", fileLabel = "export") => {
    try { const headers = columns.map((c)=>c.headerName||c.field||""); const data = rows.map((r)=>columns.map((c)=>r?.[c.field] ?? "")); const ws=XLSX.utils.aoa_to_sheet([headers,...data]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, String(sheetName).slice(0,31)); const dt=new Date(); const name=`seguimiento-expedientes-${(fileLabel||sheetName).toString().toLowerCase().replace(/[^a-z0-9]+/gi,'-')}-${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}_${String(dt.getHours()).padStart(2,'0')}${String(dt.getMinutes()).padStart(2,'0')}.xlsx`; XLSX.writeFile(wb,name);} catch(e){ console.error(e);} }, []);

  const handleProcesar = async () => {
    if (!fileBase) return;
    setLoading(true);
    try {
      const wbBase = await readWorkbook(fileBase);
      const wsBase = wbBase.Sheets[wbBase.SheetNames[0]];
      const matBase = XLSX.utils.sheet_to_json(wsBase, { header: 1, defval: "" });
      // Base: usar M (12) y N (13) por defecto
      const expedientesBase = new Map();
      for (let i=1;i<matBase.length;i++){ const row=matBase[i]||[]; const exp=normalizeExpNumber(row[12]); const dep=row[13]; if(exp&&dep) expedientesBase.set(String(exp).trim(), String(dep).trim()); }
      // Cargados: localStorage
      let listCarg=[]; try { const saved = localStorage.getItem("expedientes_cargados"); if (saved) { const arr=JSON.parse(saved)||[]; listCarg = arr.map((r)=>({ tipo:String(r.tipo||"").trim(), exp:String(normalizeExpNumber(r.expNro||r.exp||"")).trim(), estado:String(r.estadoExp||r.estado||"").trim(), donde:String(r.dondeEsta||r.donde||"").trim(), nombre:titleCase(r.agente||r.nombre||""), dni:String(r.dni||"").trim() })); } } catch(_){}
      const outSinMov=[], outFalt=[], outCerr=[]; let enProceso=0, finalizados=0, iniciados=0, cesantia=0, sancion=0, otro=0, auditoria=0;
      for(const rec of listCarg){ if(rec.estado.toLowerCase().includes("final")) finalizados++; if(rec.estado.toLowerCase().includes("proceso")) enProceso++; if(rec.estado.toLowerCase().includes("inici")) iniciados++; const t=rec.tipo.toLowerCase(); if(t.includes("cesant")) cesantia++; else if(t.includes("sanci")) sancion++; else if(t.includes("auditor")) auditoria++; else if(t) otro++;
        if(rec.estado.toLowerCase().includes("proceso") && rec.exp){ if(expedientesBase.has(rec.exp)){ const nuevaDep=expedientesBase.get(rec.exp); const baseDep=String(nuevaDep||"").trim().toLowerCase(); const cargDep=String(rec.donde||"").trim().toLowerCase(); if(baseDep === "div. de archivos e impresiones".toLowerCase()) outCerr.push({ dep:titleCase(nuevaDep), exp:rec.exp, nombre:rec.nombre, dni:rec.dni }); else if(baseDep === cargDep) outSinMov.push({ dep:titleCase(rec.donde), exp:rec.exp, nombre:rec.nombre, dni:rec.dni, tipo:rec.tipo }); } else { outFalt.push({ dep:titleCase(rec.donde), exp:rec.exp, nombre:rec.nombre, dni:rec.dni }); } }
      }
      setSinMovimiento(outSinMov); setFaltantes(outFalt); setCerrados(outCerr);
      // DGGA faltantes
      const dggam = "Direccion General De Gestion Del Agente Municipal".toLowerCase(); const setC=new Set(listCarg.map(r=>r.exp).filter(Boolean)); let sinCargarDGGA=0; for(let i=1;i<matBase.length;i++){ const row=matBase[i]||[]; const exp=normalizeExpNumber(row[12]); const depO=String(row[13]||"").toLowerCase(); if(depO===dggam && exp && !setC.has(exp)) sinCargarDGGA++; }
      const lr=new Date().toLocaleString(); try{ localStorage.setItem("expedientes_ultima_revision", lr);}catch(_){ }
      setControl({ totalEncontrados:listCarg.length, totalFaltantes:outFalt.length, iniciados, cesantia, sancion, otros:otro, auditoria, finalizados, enProceso, faltantesEnProceso:outFalt.length, cerrados:outCerr.length, ultimaRevision:lr, sinCargarDGGA });
    } catch(e){ console.error(e);} finally{ setLoading(false);} };

  const colsSinMov = useMemo(()=>[
    { field:'dep', headerName:'Dependencia', width:260 },
    { field:'exp', headerName:'Exp.Nro.', width:180 },
    { field:'nombre', headerName:'Apellido y Nombre', width:260 },
    { field:'dni', headerName:'DNI', width:140 },
    { field:'tipo', headerName:'Tipo', width:160 },
  ],[]);
  const colsFalt = useMemo(()=>[
    { field:'dep', headerName:'Dependencia', width:260 },
    { field:'exp', headerName:'Exp.Nro.', width:180 },
    { field:'nombre', headerName:'Apellido y Nombre', width:260 },
    { field:'dni', headerName:'DNI', width:140 },
  ],[]);
  const colsCerr = useMemo(()=>[
    { field:'dep', headerName:'Dependencia', width:260 },
    { field:'exp', headerName:'Exp.Nro.', width:180 },
    { field:'nombre', headerName:'Apellido y Nombre', width:260 },
    { field:'dni', headerName:'DNI', width:140 },
  ],[]);
  const rowsSinMov = useMemo(()=>sinMovimiento.map((r,i)=>({ id:i+1, ...r })),[sinMovimiento]);
  const rowsFalt = useMemo(()=>faltantes.map((r,i)=>({ id:i+1, ...r })),[faltantes]);
  const rowsCerr = useMemo(()=>cerrados.map((r,i)=>({ id:i+1, ...r })),[cerrados]);

  return (
    <Box sx={{ p:4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, color: 'white', background: isDarkMode ? 'linear-gradient(90deg, #3a2f4a 0%, #241c35 100%)' : 'linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Procesamiento de expedientes</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Carga Base expediente y obtén sin movimiento, faltantes y cerrados.</Typography>
      </Box>
      <ExpedientesQuickNav current="proceso" />

      <Card sx={{ p:2, border:'1px solid', borderColor:'divider', borderRadius:2, mb:2 }}>
        <Typography variant="subtitle1" sx={{ mb:1, fontWeight:600 }}>Carga de archivos</Typography>
        <Stack spacing={1.5}>
          <Button component="label" variant="outlined" startIcon={<icons.excel />} sx={{ minWidth: 260 }}>
            {fileBase ? fileBase.name : 'Base expediente.xlsx'}
            <input hidden type="file" accept=".xls,.xlsx" onChange={(e)=> setFileBase(e.target.files?.[0]||null)} />
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt:2 }}>
          <Button variant="contained" startIcon={<icons.refrescar />} onClick={handleProcesar}>Procesar</Button>
          <Button variant="outlined" startIcon={<icons.limpiar />} onClick={()=>{ setSinMovimiento([]); setFaltantes([]); setCerrados([]); setControl((c)=>({ ...c, ultimaRevision: undefined })); }}>Limpiar</Button>
        </Stack>
      </Card>

      <Card sx={{ p:2, border:'1px solid', borderColor:'divider', borderRadius:2 }}>
        <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
          <Chip icon={<icons.tiempo />} label={`Última revisión: ${control.ultimaRevision || '-'}`} size="small" variant="outlined" />
        </Box>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile textColor="inherit" sx={{ borderBottom:'1px solid', borderColor:'divider', '& .MuiTabs-flexContainer': { gap: 2 }, '& .MuiTab-root': { textTransform:'none', fontWeight:600, minHeight:48, px:2, borderRadius:2, color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }, '& .MuiTab-root.Mui-selected': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDarkMode ? '#fff':'#000' }, '& .MuiTabs-indicator': { height:3, borderRadius:2, background: isDarkMode ? 'linear-gradient(90deg, #9b4d9b, #6a4c93)' : 'linear-gradient(90deg, #cc2b5e, #753a88)' } }}>
          <Tab disableRipple icon={<icons.advertencia fontSize="small" />} iconPosition="start" label="Expedientes sin movimiento" />
          <Tab disableRipple icon={<icons.error fontSize="small" />} iconPosition="start" label="Expedientes faltantes" />
          <Tab disableRipple icon={<icons.exito fontSize="small" />} iconPosition="start" label="Expedientes cerrados" />
          <Tab disableRipple icon={<icons.analitica fontSize="small" />} iconPosition="start" label="Control de expedientes" />
        </Tabs>
        <CardContent>
          {tab===0 && (<>
            <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
              <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsSinMov.length} onClick={()=>exportGridToExcel(colsSinMov, rowsSinMov, 'Sin movimiento', 'sin-movimiento')}>Exportar Excel</Button>
            </Box>
            <DataGrid rows={rowsSinMov} columns={colsSinMov} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}} sx={{ backgroundColor:'transparent', border:0 }} />
          </>)}
          {tab===1 && (<>
            <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
              <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsFalt.length} onClick={()=>exportGridToExcel(colsFalt, rowsFalt, 'Faltantes', 'faltantes')}>Exportar Excel</Button>
            </Box>
            <DataGrid rows={rowsFalt} columns={colsFalt} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}} sx={{ backgroundColor:'transparent', border:0 }} />
          </>)}
          {tab===2 && (<>
            <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
              <Button variant="outlined" startIcon={<icons.excel />} disabled={!rowsCerr.length} onClick={()=>exportGridToExcel(colsCerr, rowsCerr, 'Cerrados', 'cerrados')}>Exportar Excel</Button>
            </Box>
            <DataGrid rows={rowsCerr} columns={colsCerr} autoHeight density="compact" pageSizeOptions={[10,25,50]} initialState={{ pagination:{ paginationModel:{ pageSize:10 }}}} sx={{ backgroundColor:'transparent', border:0 }} />
          </>)}
          {tab===3 && (
            <Box sx={{ p:1 }}>
              <GridLike cards={[
                { label:'Total exp. encontrados', value: control.totalEncontrados || 0 },
                { label:'Total de exp. faltantes', value: control.totalFaltantes || 0 },
                { label:'Exp. iniciados', value: control.iniciados || 0 },
                { label:'Exp. cesantes', value: control.cesantia || 0 },
                { label:'Exp. sanciones', value: control.sancion || 0 },
                { label:'Otros exp.', value: control.otros || 0 },
                { label:'Exp. de auditoria', value: control.auditoria || 0 },
                { label:'Exp. finalizados', value: control.finalizados || 0 },
                { label:'Exp. en proceso', value: control.enProceso || 0 },
                { label:'Exp. faltantes en proceso', value: control.faltantesEnProceso || 0 },
                { label:'Exp. cerrados', value: control.cerrados || 0 },
                { label:'Última revisión', value: control.ultimaRevision || '-' },
                { label:'Exp. sin cargar de la Dir. de Personal', value: control.sinCargarDGGA || 0 },
              ]} />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const GridLike = ({ cards }) => (
  <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr', md:'1fr 1fr 1fr' }, gap:1.5 }}>
    {cards.map((c,idx)=> (
      <Card key={idx} sx={{ p:2, border:'1px solid', borderColor:'divider', borderRadius:2 }}>
        <Typography variant="body2" color="text.secondary">{c.label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{c.value}</Typography>
      </Card>
    ))}
  </Box>
);

export default ExpedientesProcesoPage;
