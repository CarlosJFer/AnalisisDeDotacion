import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ANFilterDialog from "../../components/ANFilterDialog.jsx";
import anService from "../../services/anService.js";
import {
  readWorkbook,
  sheetToMatrix,
  detectCompareSheetMetadata,
  buildOriginalMap,
  parseFuncionesSheet,
} from "../../tools/an/utils";
import { SITUACIONES_REVISTA, SECRETARIAS } from "../../tools/an/constants";

const toArrayBuffer = (file) => file.arrayBuffer();

const buildSetFromSheet = (worksheet, dniColIndex = 0) => {
  const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  const set = new Set();
  for (let i = 1; i < matrix.length; i++) {
    const dni = String(matrix[i]?.[dniColIndex] ?? "").trim();
    if (dni) set.add(dni);
  }
  return set;
};

const AgrupamientoNivelesView = () => {
  const workerRef = useRef(null);
  const [tab, setTab] = useState(0);

  // Archivos
  const [fileOriginal, setFileOriginal] = useState(null);
  const [fileComparar, setFileComparar] = useState(null);
  const [fileFunciones, setFileFunciones] = useState(null);
  const [fileEliminados, setFileEliminados] = useState(null);
  const [fileProyectos, setFileProyectos] = useState(null);

  // Estados de datos
  const [agentesConId, setAgentesConId] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [discrepancias, setDiscrepancias] = useState([]);
  const [control, setControl] = useState([]);
  const [funcionesRows, setFuncionesRows] = useState([]); // {id, funcion, agrupamiento}

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({ situaciones: [], secretarias: [] });

  // Worker init
  useEffect(() => {
    const w = new Worker(new URL("../../tools/an/worker.js", import.meta.url), { type: "module" });
    workerRef.current = w;
    return () => w.terminate();
  }, []);

  // Cargar funciones guardadas
  useEffect(() => {
    (async () => {
      try {
        const list = await anService.getFunciones();
        if (Array.isArray(list) && list.length) setFuncionesRows(list);
      } catch (e) {
        console.warn("No se pudieron cargar funciones guardadas:", e?.message);
      }
    })();
  }, []);

  const showError = (message) => setSnack({ open: true, message, severity: "error" });
  const showSuccess = (message) => setSnack({ open: true, message, severity: "success" });

  const onOpenFilters = () => setFilterOpen(true);
  const onConfirmFilters = (f) => {
    setFilterOpen(false);
    setFiltros(f);
    handleProcess(f);
  };

  const handleProcess = async (filtersToUse = filtros) => {
    if (!fileOriginal || !fileComparar) {
      showError("Debes seleccionar los archivos Original.xlsx y Comparar.xlsx");
      return;
    }
    setLoading(true);
    try {
      const [wbOriginal, wbComparar] = await Promise.all([
        readWorkbook(fileOriginal),
        readWorkbook(fileComparar),
      ]);
      const wsOriginal = wbOriginal.Sheets[wbOriginal.SheetNames[0]];
      const wsComparar = wbComparar.Sheets[wbComparar.SheetNames[0]];

      const compararMatrix = sheetToMatrix(wsComparar);
      const metadata = detectCompareSheetMetadata(wsComparar);
      if (!metadata) {
        showError(
          "No se pudo detectar la fila de encabezados en Comparar. Verifica que existan encabezados como 'Apellido y Nom.', 'Agrup', 'Nivel', 'Situacion de Revista', 'Secretaria' en las primeras 15 filas.",
        );
        setLoading(false);
        return;
      }

      const originalMap = buildOriginalMap(wsOriginal);
      // Enviar a worker (Map no es clonable, convertir a array)
      const originalMapMatrix = Array.from(originalMap.entries());

      const resProcess = await new Promise((resolve, reject) => {
        const onMsg = (e) => {
          if (e.data?.type === "process") {
            workerRef.current.removeEventListener("message", onMsg);
            if (e.data.ok) resolve(e.data.result);
            else reject(new Error(e.data.error || "Error de procesamiento"));
          }
        };
        workerRef.current.addEventListener("message", onMsg);
        workerRef.current.postMessage({ type: "process", payload: { compararMatrix, metadata, originalMapMatrix, filtros: filtersToUse } });
      });

      setAgentesConId(resProcess.agentesConId);
      setFaltantes(resProcess.faltantes);
      showSuccess(
        `Procesado: Agentes con ID: ${resProcess.agentesConId.length}, Faltantes: ${resProcess.faltantes.length}`,
      );

      // Preparar funciones: archivo cargado o tabla editada o funciones guardadas
      let funcionesParaUsar = funcionesRows;
      if (fileFunciones) {
        const wbFunc = await readWorkbook(fileFunciones);
        const wsFunc = wbFunc.Sheets[wbFunc.SheetNames[0]];
        funcionesParaUsar = parseFuncionesSheet(wsFunc);
        setFuncionesRows(funcionesParaUsar);
      }

      if (Array.isArray(funcionesParaUsar) && funcionesParaUsar.length) {
        const resAssign = await new Promise((resolve, reject) => {
          const onMsg = (e) => {
            if (e.data?.type === "assign") {
              workerRef.current.removeEventListener("message", onMsg);
              if (e.data.ok) resolve(e.data.result);
              else reject(new Error(e.data.error || "Error de asignación"));
            }
          };
          workerRef.current.addEventListener("message", onMsg);
          workerRef.current.postMessage({ type: "assign", payload: { agentesConId: resProcess.agentesConId, funcionesRows: funcionesParaUsar } });
        });

        setAgentesConId(resAssign.agentesConId);
        setDiscrepancias(resAssign.discrepancias);
        setControl(resAssign.control);
      } else {
        setDiscrepancias([]);
        setControl([]);
      }
    } catch (err) {
      console.error(err);
      showError(err?.message || "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  const handleDepurar = async () => {
    if (!discrepancias.length) {
      showError("No hay discrepancias para depurar");
      return;
    }
    if (!fileEliminados && !fileProyectos) {
      showError("Carga 'Eliminados.xlsx' o 'Proyectos.xlsx' para depurar");
      return;
    }
    setLoading(true);
    try {
      const [wbE, wbP] = await Promise.all([
        fileEliminados ? readWorkbook(fileEliminados) : Promise.resolve(null),
        fileProyectos ? readWorkbook(fileProyectos) : Promise.resolve(null),
      ]);
      const setE = wbE ? buildSetFromSheet(wbE.Sheets[wbE.SheetNames[0]], 0) : new Set();
      const setP = wbP ? buildSetFromSheet(wbP.Sheets[wbP.SheetNames[0]], 0) : new Set();

      const result = await new Promise((resolve, reject) => {
        const onMsg = (e) => {
          if (e.data?.type === "depurar") {
            workerRef.current.removeEventListener("message", onMsg);
            if (e.data.ok) resolve(e.data.result);
            else reject(new Error(e.data.error || "Error de depuración"));
          }
        };
        workerRef.current.addEventListener("message", onMsg);
        workerRef.current.postMessage({
          type: "depurar",
          payload: { discrepancias, eliminados: Array.from(setE), proyectos: Array.from(setP) },
        });
      });

      setDiscrepancias(result);
      showSuccess(`Depuración aplicada. Discrepancias restantes: ${result.length}`);
    } catch (err) {
      console.error(err);
      showError(err?.message || "Error al depurar");
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setAgentesConId([]);
    setFaltantes([]);
    setDiscrepancias([]);
    setControl([]);
    setFiltros({ situaciones: [], secretarias: [] });
    showSuccess("Datos limpiados");
  };

  const commonCardStyle = {
    p: 2,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
  };

  // Columnas para DataGrid
  const colsAgentes = useMemo(
    () => [
      { field: "idAsignado", headerName: "ID", width: 90, valueGetter: (p) => p.row.values[0] },
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p.row.values[1] },
      { field: "apellido", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p.row.values[2] },
      { field: "sitRev", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[3] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p.row.values[4] },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p.row.values[5] },
      { field: "funcion", headerName: "Función", width: 200, valueGetter: (p) => p.row.values[6] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "subsec", headerName: "Subsecretaría", width: 220, valueGetter: (p) => p.row.values[9] },
      { field: "dirGral", headerName: "Dirección General", width: 220, valueGetter: (p) => p.row.values[10] },
    ],
    [],
  );

  const colsFaltantes = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 90, valueGetter: (p) => p.row.values[0] },
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p.row.values[1] },
      { field: "ape", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p.row.values[2] },
      { field: "sit", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[3] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p.row.values[4] },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p.row.values[5] },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[6] },
      { field: "func", headerName: "Función", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p.row.values[8] },
    ],
    [],
  );

  const colsDiscrep = useMemo(
    () => [
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p.row.values[0] },
      { field: "ape", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p.row.values[1] },
      { field: "sit", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[2] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p.row.values[3] },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p.row.values[4] },
      { field: "func", headerName: "Función", width: 200, valueGetter: (p) => p.row.values[5] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p.row.values[6] },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "sub", headerName: "Subsecretaría", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "dir", headerName: "Dirección General", width: 220, valueGetter: (p) => p.row.values[9] },
      { field: "obs", headerName: "Observación", width: 380, valueGetter: (p) => p.row.values[10] },
    ],
    [],
  );

  const colsControl = useMemo(
    () => [
      { field: "funcion", headerName: "Funciones", width: 300 },
      { field: "cantidad", headerName: "Cantidad", width: 120 },
    ],
    [],
  );

  const rowsFromArray = (arr) => arr.map((values, idx) => ({ id: idx + 1, values }));

  // Funciones editor helpers
  const funcionesCols = useMemo(
    () => [
      { field: "functionId", headerName: "Id.", width: 100, editable: true, type: "number" },
      { field: "funcion", headerName: "Función", width: 400, editable: true },
      { field: "agrupamiento", headerName: "Pertenece al agrupamiento", width: 240, editable: true },
    ],
    [],
  );

  const funcionesRowsGrid = useMemo(
    () => funcionesRows.map((r, i) => ({ id: i + 1, functionId: r.id, funcion: r.funcion, agrupamiento: r.agrupamiento })),
    [funcionesRows],
  );

  const onFuncionesRowUpdate = useCallback((params) => {
    const { id, field, value } = params;
    setFuncionesRows((prev) => {
      const next = [...prev];
      const idx = Number(id) - 1;
      if (next[idx]) next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addFuncionRow = () => setFuncionesRows((prev) => [...prev, { id: "", funcion: "", agrupamiento: "" }]);
  const saveFunciones = async () => {
    try {
      await anService.saveFunciones(funcionesRows);
      showSuccess("Funciones guardadas");
    } catch (e) {
      showError(e?.message || "Error al guardar funciones");
    }
  };
  const recalcAsignacion = async () => {
    if (!agentesConId.length) {
      showError("No hay datos en Agentes con ID para recalcular");
      return;
    }
    if (!funcionesRows.length) {
      showError("No hay funciones cargadas");
      return;
    }
    setLoading(true);
    try {
      const resAssign = await new Promise((resolve, reject) => {
        const onMsg = (e) => {
          if (e.data?.type === "assign") {
            workerRef.current.removeEventListener("message", onMsg);
            if (e.data.ok) resolve(e.data.result);
            else reject(new Error(e.data.error || "Error de asignación"));
          }
        };
        workerRef.current.addEventListener("message", onMsg);
        workerRef.current.postMessage({ type: "assign", payload: { agentesConId, funcionesRows } });
      });
      setAgentesConId(resAssign.agentesConId);
      setDiscrepancias(resAssign.discrepancias);
      setControl(resAssign.control);
      showSuccess("Asignación recalculada");
    } catch (e) {
      showError(e?.message || "Error al recalcular");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Ver Agrupamientos y Niveles
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={commonCardStyle}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6} lg={4}>
                  <Button component="label" variant="outlined" fullWidth>
                    Seleccionar Original.xlsx
                    <input
                      hidden
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFileOriginal(e.target.files?.[0] || null)}
                    />
                  </Button>
                  <Typography variant="caption">{fileOriginal?.name || ""}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <Button component="label" variant="outlined" fullWidth>
                    Seleccionar Comparar.xlsx
                    <input
                      hidden
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFileComparar(e.target.files?.[0] || null)}
                    />
                  </Button>
                  <Typography variant="caption">{fileComparar?.name || ""}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <Button component="label" variant="outlined" fullWidth>
                    Tabla de Funciones (opcional)
                    <input
                      hidden
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFileFunciones(e.target.files?.[0] || null)}
                    />
                  </Button>
                  <Typography variant="caption">{fileFunciones?.name || ""}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <Button component="label" variant="outlined" fullWidth>
                    Eliminados.xlsx (opcional)
                    <input
                      hidden
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFileEliminados(e.target.files?.[0] || null)}
                    />
                  </Button>
                  <Typography variant="caption">{fileEliminados?.name || ""}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <Button component="label" variant="outlined" fullWidth>
                    Proyectos.xlsx (opcional)
                    <input
                      hidden
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFileProyectos(e.target.files?.[0] || null)}
                    />
                  </Button>
                  <Typography variant="caption">{fileProyectos?.name || ""}</Typography>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "stretch", md: "flex-end" } }}>
                    <Button variant="outlined" onClick={onOpenFilters} disabled={!fileOriginal || !fileComparar}>
                      Configurar filtros
                    </Button>
                    <Button variant="contained" onClick={() => handleProcess()} disabled={!fileOriginal || !fileComparar}>
                      Procesar
                    </Button>
                    <Button variant="outlined" onClick={handleLimpiar} color="inherit">
                      Limpiar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={commonCardStyle}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label={`Agentes con ID (${agentesConId.length})`} />
              <Tab label={`Faltantes (${faltantes.length})`} />
              <Tab label={`Discrepancias (${discrepancias.length})`} />
              <Tab label={`Control (${control.length})`} />
              <Tab label={`Funciones (${funcionesRows.length})`} />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <DataGrid rows={rowsFromArray(agentesConId)} columns={colsAgentes} autoHeight pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
              )}
              {tab === 1 && (
                <DataGrid rows={rowsFromArray(faltantes)} columns={colsFaltantes} autoHeight pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
              )}
              {tab === 2 && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <Button variant="contained" onClick={handleDepurar} disabled={!discrepancias.length}>
                      Depurar
                    </Button>
                  </Box>
                  <DataGrid rows={rowsFromArray(discrepancias)} columns={colsDiscrep} autoHeight pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
                </>
              )}
              {tab === 3 && (
                <DataGrid rows={control.map((r, i) => ({ id: i + 1, ...r }))} columns={colsControl} autoHeight pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
              )}
              {tab === 4 && (
                <>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Button variant="outlined" onClick={addFuncionRow}>Agregar fila</Button>
                    <Button variant="contained" onClick={saveFunciones}>Guardar</Button>
                    <Button variant="outlined" onClick={recalcAsignacion} disabled={!agentesConId.length}>Recalcular asignación</Button>
                  </Box>
                  <DataGrid
                    rows={funcionesRowsGrid}
                    columns={funcionesCols}
                    autoHeight
                    editMode="cell"
                    onCellEditCommit={(params) => {
                      const { id, field, value } = params;
                      setFuncionesRows((prev) => {
                        const next = [...prev];
                        const idx = Number(id) - 1;
                        if (next[idx]) {
                          if (field === 'functionId') next[idx] = { ...next[idx], id: value };
                          else next[idx] = { ...next[idx], [field]: value };
                        }
                        return next;
                      });
                    }}
                    editable
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ANFilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onConfirm={onConfirmFilters}
        situacionesOptions={SITUACIONES_REVISTA}
        secretariasOptions={SECRETARIAS}
        initialSituaciones={filtros.situaciones}
        initialSecretarias={filtros.secretarias}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box sx={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.2)" }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AgrupamientoNivelesView;
