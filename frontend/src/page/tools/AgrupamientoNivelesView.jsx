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
  Avatar,
  Stack,
  Chip,
  Tooltip,
  Collapse,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ANFilterDialog from "../../components/ANFilterDialog.jsx";
import anService from "../../services/anService.js";
import icons from "../../ui/icons.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  readWorkbook,
  sheetToMatrix,
  detectCompareSheetMetadata,
  buildOriginalMap,
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
  const { isDarkMode } = useTheme();
  const workerRef = useRef(null);
  const [tab, setTab] = useState(0);

  // Archivos
  const [fileOriginal, setFileOriginal] = useState(null);
  const [fileComparar, setFileComparar] = useState(null);
  const [fileEliminados, setFileEliminados] = useState(null);
  const [fileProyectos, setFileProyectos] = useState(null);

  // Estados de datos
  const [agentesConId, setAgentesConId] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [discrepancias, setDiscrepancias] = useState([]);
  const [control, setControl] = useState([]);
  const [funcionesRows, setFuncionesRows] = useState([]); // {id, funcion, agrupamiento}
  const [eliminadosRows, setEliminadosRows] = useState([]);
  const [proyectosRows, setProyectosRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({ situaciones: [], secretarias: [] });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Cargar filtros guardados como default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('an_filters');
      if (saved) {
        const f = JSON.parse(saved);
        if (f && typeof f === 'object') {
          setFiltros({ situaciones: f.situaciones || [], secretarias: f.secretarias || [] });
        }
      }
    } catch (_) {}
  }, []);

  // Auto-procesar cuando ambos archivos requeridos están cargados
  useEffect(() => {
    if (fileOriginal && fileComparar) {
      handleProcess(filtros);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileOriginal, fileComparar]);

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

  // Parsear Eliminados / Proyectos para mostrar en pestañas
  useEffect(() => {
    if (!fileEliminados) {
      setEliminadosRows([]);
      return;
    }
    (async () => {
      try {
        const wb = await readWorkbook(fileEliminados);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const dataRows = (matrix || []).slice(1).filter((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim() !== ""));
        setEliminadosRows(dataRows);
      } catch (e) {
        console.warn("No se pudo procesar Eliminados:", e?.message);
        setEliminadosRows([]);
      }
    })();
  }, [fileEliminados]);

  useEffect(() => {
    if (!fileProyectos) {
      setProyectosRows([]);
      return;
    }
    (async () => {
      try {
        const wb = await readWorkbook(fileProyectos);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const dataRows = (matrix || []).slice(1).filter((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim() !== ""));
        setProyectosRows(dataRows);
      } catch (e) {
        console.warn("No se pudo procesar Proyectos:", e?.message);
        setProyectosRows([]);
      }
    })();
  }, [fileProyectos]);

  const showError = (message) => setSnack({ open: true, message, severity: "error" });
  const showSuccess = (message) => setSnack({ open: true, message, severity: "success" });

  // Evita warning de aria-hidden manteniendo foco en la UI visible
  useEffect(() => {
    if (snack.open) {
      setTimeout(() => {
        try { (document.activeElement)?.blur?.(); } catch (_) {}
      }, 0);
    }
  }, [snack.open]);

  const onOpenFilters = () => {
    try {
      (document.activeElement)?.blur?.();
    } catch (_) {}
    setFilterOpen(true);
  };

  // UI helper para cargas de archivo
  const UploadField = ({ label, file, onFile, required = false }) => {
    const [dragOver, setDragOver] = useState(false);
    const handleDragOver = (e) => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      setDragOver(false);
    };
    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer?.files?.[0] || null;
      if (f) onFile(f);
    };
    const handleChange = (e) => onFile(e.target.files?.[0] || null);

    return (
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 1.2,
          borderRadius: 2,
          border: '2px dashed',
          borderColor: dragOver ? (isDarkMode ? '#9b4d9b' : '#cc2b5e') : (required && !file ? (isDarkMode ? 'rgba(255,0,0,0.4)' : 'rgba(255,0,0,0.3)') : 'divider'),
          background: dragOver
            ? (isDarkMode ? 'rgba(155,77,155,0.1)' : 'rgba(204,43,94,0.05)')
            : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
          transition: 'all .15s ease',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Button component="label" variant="outlined" startIcon={<icons.excel />} sx={{ minWidth: 280 }}>
            {label}
            <input hidden type="file" accept=".xls,.xlsx" onChange={handleChange} />
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            {required && !file && (
              <Chip label="Requerido" color="warning" variant="outlined" size="small" />
            )}
            {file && (
              <Chip
                label={file.name}
                onDelete={() => onFile(null)}
                variant="outlined"
                sx={{ maxWidth: 240, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    );
  };
  const onConfirmFilters = (f) => {
    setFilterOpen(false);
    setFiltros(f);
    try {
      localStorage.setItem('an_filters', JSON.stringify(f));
    } catch (_) {}
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

      // Preparar funciones: tabla editada o funciones guardadas
      let funcionesParaUsar = funcionesRows;

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
      // Recalcular CONTROL en base a las discrepancias depuradas
      const conteo = new Map();
      for (const d of result) {
        const fn = d?.[5] || "Vacío";
        conteo.set(fn, (conteo.get(fn) || 0) + 1);
      }
      const nuevoControl = Array.from(conteo.entries()).map(([funcion, cantidad]) => ({ funcion, cantidad }));
      setControl(nuevoControl);
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

  // Asegurar valueGetter seguros en DataGrid
  const safeVG = (getter) => (params) => {
    try {
      const v = getter?.(params);
      return v ?? "";
    } catch {
      return "";
    }
  };
  const mapSafeVG = (cols) => cols.map((c) =>
    c && typeof c.valueGetter === "function" ? { ...c, valueGetter: safeVG(c.valueGetter) } : c,
  );

  // Columnas para DataGrid
  const colsAgentes = useMemo(
    () => mapSafeVG([
      { field: "idAsignado", headerName: "ID", width: 90, valueGetter: (p) => p?.row?.values?.[0] ?? "" },
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p?.row?.values?.[1] ?? "" },
      { field: "apellido", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p?.row?.values?.[2] ?? "" },
      { field: "sitRev", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[3] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p?.row?.values?.[4] ?? "" },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p?.row?.values?.[5] ?? "" },
      { field: "funcion", headerName: "Función", width: 200, valueGetter: (p) => p?.row?.values?.[6] ?? "" },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p?.row?.values?.[7] ?? "" },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "subsec", headerName: "Subsecretaría", width: 220, valueGetter: (p) => p.row.values[9] },
      { field: "dirGral", headerName: "Dirección General", width: 220, valueGetter: (p) => p.row.values[10] },
    ]),
    [],
  );

  const colsFaltantes = useMemo(
    () => mapSafeVG([
      { field: "id", headerName: "ID", width: 90, valueGetter: (p) => p?.row?.values?.[0] ?? "" },
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p?.row?.values?.[1] ?? "" },
      { field: "ape", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p?.row?.values?.[2] ?? "" },
      { field: "sit", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[3] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p.row.values[4] },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p.row.values[5] },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[6] },
      { field: "func", headerName: "Función", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p.row.values[8] },
    ]),
    [],
  );

  const colsDiscrep = useMemo(
    () => mapSafeVG([
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p?.row?.values?.[0] ?? "" },
      { field: "ape", headerName: "Apellido y Nombre", width: 220, valueGetter: (p) => p?.row?.values?.[1] ?? "" },
      { field: "sit", headerName: "Situación", width: 180, valueGetter: (p) => p.row.values[2] },
      { field: "agrup", headerName: "Agrupamiento", width: 130, valueGetter: (p) => p.row.values[3] },
      { field: "nivel", headerName: "Nivel", width: 90, valueGetter: (p) => p?.row?.values?.[4] ?? "" },
      { field: "func", headerName: "Función", width: 200, valueGetter: (p) => p.row.values[5] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p?.row?.values?.[6] ?? "" },
      { field: "sec", headerName: "Secretaría", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "sub", headerName: "Subsecretaría", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "dir", headerName: "Dirección General", width: 220, valueGetter: (p) => p.row.values[9] },
      { field: "obs", headerName: "Observación", width: 380, valueGetter: (p) => p.row.values[10] },
    ]),
    [],
  );

  const colsControl = useMemo(
    () => [
      { field: "funcion", headerName: "Funciones", width: 300 },
      { field: "cantidad", headerName: "Cantidad", width: 120 },
    ],
    [],
  );

  // Columnas Eliminados / Proyectos
  const colsEliminados = useMemo(
    () => mapSafeVG([
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p?.row?.values?.[0] ?? "" },
      { field: "ape", headerName: "Apellido y nombre", width: 220, valueGetter: (p) => p?.row?.values?.[1] ?? "" },
      { field: "sit", headerName: "Situacion de revista", width: 200, valueGetter: (p) => p.row.values[2] },
      { field: "agrup", headerName: "Agrup", width: 120, valueGetter: (p) => p?.row?.values?.[3] ?? "" },
      { field: "nivel", headerName: "Nivel", width: 100, valueGetter: (p) => p?.row?.values?.[4] ?? "" },
      { field: "func", headerName: "Funciones", width: 200, valueGetter: (p) => p?.row?.values?.[5] ?? "" },
      { field: "dep", headerName: "Dependencias", width: 220, valueGetter: (p) => p.row.values[6] },
      { field: "sec", headerName: "Secretarias", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "sub", headerName: "SubSecretarias", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "dir", headerName: "DireccionesGenerales", width: 240, valueGetter: (p) => p.row.values[9] },
      { field: "obs", headerName: "Observación", width: 240, valueGetter: (p) => p.row.values[10] },
    ]),
    [],
  );
  const colsProyectos = useMemo(
    () => mapSafeVG([
      { field: "dni", headerName: "DNI", width: 140, valueGetter: (p) => p?.row?.values?.[0] ?? "" },
      { field: "ape", headerName: "Apellido y nombre", width: 220, valueGetter: (p) => p?.row?.values?.[1] ?? "" },
      { field: "sit", headerName: "Situacion de revista", width: 200, valueGetter: (p) => p.row.values[2] },
      { field: "agrup", headerName: "Agrup", width: 120, valueGetter: (p) => p?.row?.values?.[3] ?? "" },
      { field: "nivel", headerName: "Nivel", width: 100, valueGetter: (p) => p?.row?.values?.[4] ?? "" },
      { field: "func", headerName: "Funciones", width: 200, valueGetter: (p) => p?.row?.values?.[5] ?? "" },
      { field: "sec", headerName: "Secretaria", width: 220, valueGetter: (p) => p.row.values[6] },
      { field: "dep", headerName: "Dependencia", width: 220, valueGetter: (p) => p.row.values[7] },
      { field: "obs", headerName: "Observacion", width: 220, valueGetter: (p) => p.row.values[8] },
      { field: "agrupC", headerName: "Agrup correcto", width: 180, valueGetter: (p) => p.row.values[9] },
      { field: "env", headerName: "Enviado al grupo", width: 180, valueGetter: (p) => p.row.values[10] },
    ]),
    [],
  );

  // Columnas y filas sin valueGetter (evita params inconsistentes)
  const colsAgentes2 = useMemo(
    () => [
      { field: "idAsignado", headerName: "ID", width: 90 },
      { field: "dni", headerName: "DNI", width: 140 },
      { field: "apellido", headerName: "Apellido y Nombre", width: 220 },
      { field: "sitRev", headerName: "Situación", width: 180 },
      { field: "agrup", headerName: "Agrupamiento", width: 130 },
      { field: "nivel", headerName: "Nivel", width: 90 },
      { field: "funcion", headerName: "Función", width: 200 },
      { field: "dep", headerName: "Dependencia", width: 220 },
      { field: "sec", headerName: "Secretaría", width: 220 },
      { field: "subsec", headerName: "Subsecretaría", width: 220 },
      { field: "dirGral", headerName: "Dirección General", width: 220 },
    ],
    [],
  );
  const rowsAgentes = useMemo(
    () => (agentesConId || []).map((v, i) => ({
      id: i + 1,
      idAsignado: v?.[0] ?? "",
      dni: v?.[1] ?? "",
      apellido: v?.[2] ?? "",
      sitRev: v?.[3] ?? "",
      agrup: v?.[4] ?? "",
      nivel: v?.[5] ?? "",
      funcion: v?.[6] ?? "",
      dep: v?.[7] ?? "",
      sec: v?.[8] ?? "",
      subsec: v?.[9] ?? "",
      dirGral: v?.[10] ?? "",
    })),
    [agentesConId],
  );

  const colsFaltantes2 = useMemo(
    () => [
      { field: "idOriginal", headerName: "ID", width: 90 },
      { field: "dni", headerName: "DNI", width: 140 },
      { field: "ape", headerName: "Apellido y Nombre", width: 220 },
      { field: "sit", headerName: "Situación", width: 180 },
      { field: "agrup", headerName: "Agrupamiento", width: 130 },
      { field: "nivel", headerName: "Nivel", width: 90 },
      { field: "sec", headerName: "Secretaría", width: 220 },
      { field: "func", headerName: "Función", width: 220 },
      { field: "dep", headerName: "Dependencia", width: 220 },
    ],
    [],
  );
  const rowsFaltantes = useMemo(
    () => (faltantes || []).map((v, i) => ({
      id: i + 1,
      idOriginal: v?.[0] ?? "",
      dni: v?.[1] ?? "",
      ape: v?.[2] ?? "",
      sit: v?.[3] ?? "",
      agrup: v?.[4] ?? "",
      nivel: v?.[5] ?? "",
      sec: v?.[6] ?? "",
      func: v?.[7] ?? "",
      dep: v?.[8] ?? "",
    })),
    [faltantes],
  );

  const colsDiscrep2 = useMemo(
    () => [
      { field: "dni", headerName: "DNI", width: 140 },
      { field: "ape", headerName: "Apellido y Nombre", width: 220 },
      { field: "sit", headerName: "Situación", width: 180 },
      { field: "agrup", headerName: "Agrupamiento", width: 130 },
      { field: "nivel", headerName: "Nivel", width: 90 },
      { field: "func", headerName: "Función", width: 200 },
      { field: "dep", headerName: "Dependencia", width: 220 },
      { field: "sec", headerName: "Secretaría", width: 220 },
      { field: "sub", headerName: "Subsecretaría", width: 220 },
      { field: "dir", headerName: "Dirección General", width: 220 },
      { field: "obs", headerName: "Observación", width: 380 },
    ],
    [],
  );
  const rowsDiscrep = useMemo(
    () => (discrepancias || []).map((v, i) => ({
      id: i + 1,
      dni: v?.[0] ?? "",
      ape: v?.[1] ?? "",
      sit: v?.[2] ?? "",
      agrup: v?.[3] ?? "",
      nivel: v?.[4] ?? "",
      func: v?.[5] ?? "",
      dep: v?.[6] ?? "",
      sec: v?.[7] ?? "",
      sub: v?.[8] ?? "",
      dir: v?.[9] ?? "",
      obs: v?.[10] ?? "",
    })),
    [discrepancias],
  );

  const colsEliminados2 = useMemo(
    () => [
      { field: "dni", headerName: "DNI", width: 140 },
      { field: "ape", headerName: "Apellido y nombre", width: 220 },
      { field: "sit", headerName: "Situación de revista", width: 200 },
      { field: "agrup", headerName: "Agrup", width: 120 },
      { field: "nivel", headerName: "Nivel", width: 100 },
      { field: "func", headerName: "Funciones", width: 200 },
      { field: "dep", headerName: "Dependencias", width: 220 },
      { field: "sec", headerName: "Secretarias", width: 220 },
      { field: "sub", headerName: "SubSecretarias", width: 220 },
      { field: "dir", headerName: "DireccionesGenerales", width: 240 },
      { field: "obs", headerName: "Observación", width: 240 },
    ],
    [],
  );
  const rowsEliminados = useMemo(
    () => (eliminadosRows || []).map((v, i) => ({
      id: i + 1,
      dni: v?.[0] ?? "",
      ape: v?.[1] ?? "",
      sit: v?.[2] ?? "",
      agrup: v?.[3] ?? "",
      nivel: v?.[4] ?? "",
      func: v?.[5] ?? "",
      dep: v?.[6] ?? "",
      sec: v?.[7] ?? "",
      sub: v?.[8] ?? "",
      dir: v?.[9] ?? "",
      obs: v?.[10] ?? "",
    })),
    [eliminadosRows],
  );

  const colsProyectos2 = useMemo(
    () => [
      { field: "dni", headerName: "DNI", width: 140 },
      { field: "ape", headerName: "Apellido y nombre", width: 220 },
      { field: "sit", headerName: "Situación de revista", width: 200 },
      { field: "agrup", headerName: "Agrup", width: 120 },
      { field: "nivel", headerName: "Nivel", width: 100 },
      { field: "func", headerName: "Funciones", width: 200 },
      { field: "sec", headerName: "Secretaria", width: 220 },
      { field: "dep", headerName: "Dependencia", width: 220 },
      { field: "obs", headerName: "Observación", width: 220 },
      { field: "agrupC", headerName: "Agrup correcto", width: 180 },
      { field: "env", headerName: "Enviado al grupo", width: 180 },
    ],
    [],
  );
  const rowsProyectos = useMemo(
    () => (proyectosRows || []).map((v, i) => ({
      id: i + 1,
      dni: v?.[0] ?? "",
      ape: v?.[1] ?? "",
      sit: v?.[2] ?? "",
      agrup: v?.[3] ?? "",
      nivel: v?.[4] ?? "",
      func: v?.[5] ?? "",
      sec: v?.[6] ?? "",
      dep: v?.[7] ?? "",
      obs: v?.[8] ?? "",
      agrupC: v?.[9] ?? "",
      env: v?.[10] ?? "",
    })),
    [proyectosRows],
  );

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
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          color: "white",
          background: isDarkMode
            ? "linear-gradient(90deg, #3a2f4a 0%, #241c35 100%)"
            : "linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)",
          boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
            <icons.capas />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
              Agrupamientos y Niveles
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{
            ...commonCardStyle,
            background: isDarkMode
              ? "linear-gradient(180deg, rgba(32,33,46,0.9) 0%, rgba(26,27,38,0.92) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.9) 100%)",
            boxShadow: isDarkMode ? "0 6px 20px rgba(0,0,0,0.35)" : "0 6px 20px rgba(0,0,0,0.08)"
          }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <UploadField
                    label="Cargar Excel Rama Completa"
                    file={fileOriginal}
                    onFile={(f) => setFileOriginal(f)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <UploadField
                    label="Cargar Excel Datos Concursos"
                    file={fileComparar}
                    onFile={(f) => setFileComparar(f)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="text"
                    startIcon={<icons.expandir sx={{ transform: advancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />}
                    onClick={() => setAdvancedOpen((v) => !v)}
                    sx={{ fontWeight: 600 }}
                  >
                    Opciones avanzadas
                  </Button>
                  <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} md={6}>
                        <UploadField
                          label="Agentes para eliminar (opcional)"
                          file={fileEliminados}
                          onFile={(f) => setFileEliminados(f)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <UploadField
                          label="Agentes para proyectos (opcional)"
                          file={fileProyectos}
                          onFile={(f) => setFileProyectos(f)}
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Tooltip title={!fileOriginal || !fileComparar ? 'Primero cargá Rama Completa y Datos Concursos' : ''} disableHoverListener={!!(fileOriginal && fileComparar)}>
                      <span>
                        <Button
                          variant="outlined"
                          onClick={onOpenFilters}
                          disabled={!fileOriginal || !fileComparar}
                          startIcon={<icons.filtro />}
                        >
                          Configurar filtros
                        </Button>
                      </span>
                    </Tooltip>
                    <Button variant="contained" onClick={() => handleProcess()} disabled={!fileOriginal || !fileComparar} startIcon={<icons.analitica />} sx={{
                      background: "linear-gradient(90deg, #ff9800 0%, #f57c00 100%)",
                      color: "white",
                      '&:hover': { background: "linear-gradient(90deg, #f57c00 0%, #ef6c00 100%)" }
                    }}>
                      Procesar
                    </Button>
                    <Button variant="outlined" onClick={handleLimpiar} color="inherit" startIcon={<icons.limpiar />}>
                      Limpiar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ ...commonCardStyle, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="inherit"
              sx={{
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
              <Tab disableRipple icon={<icons.personas fontSize="small" />} iconPosition="start" label="Agentes con ID" />
              <Tab disableRipple icon={<icons.advertencia fontSize="small" />} iconPosition="start" label="Faltantes" />
              <Tab disableRipple icon={<icons.error fontSize="small" />} iconPosition="start" label="Discrepancias" />
              <Tab disableRipple icon={<icons.analitica fontSize="small" />} iconPosition="start" label="Control" />
              <Tab disableRipple icon={<icons.eliminar fontSize="small" />} iconPosition="start" label="Eliminados" />
              <Tab disableRipple icon={<icons.carpeta fontSize="small" />} iconPosition="start" label="Proyectos" />
              <Tab disableRipple icon={<icons.funciones fontSize="small" />} iconPosition="start" label="Funciones" />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <DataGrid rows={rowsAgentes} columns={colsAgentes2} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
              )}
              {tab === 1 && (
                <DataGrid rows={rowsFaltantes} columns={colsFaltantes2} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
              )}
              {tab === 2 && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <Button variant="contained" onClick={handleDepurar} disabled={!discrepancias.length} startIcon={<icons.limpiar />} sx={{
                      background: "linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)",
                      '&:hover': { background: "linear-gradient(90deg, #b02852 0%, #6a337c 100%)" }
                    }}>
                      Depurar
                    </Button>
                  </Box>
                  <DataGrid rows={rowsDiscrep} columns={colsDiscrep2} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
                </>
              )}
              {tab === 3 && (
                <DataGrid rows={control.map((r, i) => ({ id: i + 1, ...r }))} columns={colsControl} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
              )}
              {tab === 4 && (
                <DataGrid rows={rowsEliminados} columns={colsEliminados2} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
              )}
              {tab === 5 && (
                <DataGrid rows={rowsProyectos} columns={colsProyectos2} autoHeight density="compact" pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ backgroundColor: 'transparent', border: 0, '& .MuiDataGrid-withBorderColor': { borderColor: 'transparent' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent' }, '& .MuiDataGrid-cell': { color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)' }, '& .MuiDataGrid-row:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } }} />
              )}
              {tab === 6 && (
                <>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Button variant="outlined" onClick={addFuncionRow} startIcon={<icons.agregar />}>Agregar fila</Button>
                    <Button variant="contained" onClick={saveFunciones} startIcon={<icons.exito />} sx={{
                      background: "linear-gradient(90deg, #2b5876 0%, #4e4376 100%)",
                      '&:hover': { background: "linear-gradient(90deg, #254d66 0%, #463d6a 100%)" }
                    }}>Guardar</Button>
                    <Button variant="outlined" onClick={recalcAsignacion} disabled={!agentesConId.length} startIcon={<icons.refrescar />}>Recalcular asignación</Button>
                  </Box>
                  <DataGrid
                    rows={funcionesRowsGrid}
                    columns={funcionesCols}
                    autoHeight
                    density="compact"
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
