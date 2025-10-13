import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../../context/ThemeContext.jsx";
import icons from "../../../ui/icons.js";
import ExpedientesQuickNav from "./ExpedientesQuickNav.jsx";

const ExpedientesCargadosPage = () => {
  const { isDarkMode } = useTheme();
  const TIPO_OPTIONS = useMemo(() => ["Sanción", "Cesantía", "Auditoría", "Otro"], []);
  const ESTADO_EXP_OPTIONS = useMemo(() => ["En proceso", "Finalizado", "Iniciado", "No iniciado"], []);

  const [rows, setRows] = useState([]);
  useEffect(() => { try { const saved = localStorage.getItem("expedientes_cargados"); if (saved) setRows(JSON.parse(saved).map((r, i) => ({ id: i + 1, ...r }))); } catch(_){} }, []);
  useEffect(() => { try { const data = rows.map(({ id, ...r }) => r); localStorage.setItem("expedientes_cargados", JSON.stringify(data)); } catch(_){} }, [rows]);

  const cols = useMemo(() => ([
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
    { field: 'acciones', headerName: 'Acciones', width: 120, renderCell: (params) => (
      <icons.eliminar onClick={() => setRows((prev) => prev.filter((r) => r.id !== params.row.id))} sx={{ cursor: 'pointer' }} />
    )},
  ]), [TIPO_OPTIONS, ESTADO_EXP_OPTIONS]);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, color: 'white', background: isDarkMode ? 'linear-gradient(90deg, #3a2f4a 0%, #241c35 100%)' : 'linear-gradient(90deg, #cc2b5e 0%, #753a88 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Expedientes cargados</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Edite los registros en la tabla. Los cambios se guardan automáticamente.</Typography>
      </Box>
      <ExpedientesQuickNav current="cargados" />
      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={cols}
          autoHeight
          density="compact"
          pageSizeOptions={[10,25,50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          processRowUpdate={(newRow, oldRow) => {
            const tipoOk = !newRow.tipo || TIPO_OPTIONS.includes(newRow.tipo);
            const estadoOk = !newRow.estadoExp || ESTADO_EXP_OPTIONS.includes(newRow.estadoExp);
            const expOk = !!(newRow.expNro && String(newRow.expNro).trim());
            if (!tipoOk || !estadoOk || !expOk) throw new Error(!expOk ? 'Exp.Nro. es obligatorio' : 'Valor inválido');
            setRows((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
            return newRow;
          }}
          onProcessRowUpdateError={(err) => console.error(err)}
        />
      </Card>
    </Box>
  );
};

export default ExpedientesCargadosPage;
