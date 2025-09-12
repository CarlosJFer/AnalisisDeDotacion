import React, { useMemo, memo } from "react";
import { Card, Box, IconButton, Button } from "@mui/material";
import {
  DataGrid,
  GridToolbarQuickFilter,
  useGridApiContext,
} from "@mui/x-data-grid";
import icons from "../ui/icons.js";

// Custom Columns button that blurs itself before opening the panel to avoid aria-hidden focus warning
const ColumnsButton = memo(function ColumnsButton() {
  const apiRef = useGridApiContext();
  const handleClick = (e) => {
    // Quitar foco del botón antes de abrir el panel
    if (e?.currentTarget?.blur) e.currentTarget.blur();
    apiRef.current.showPreferences("columns");
  };
  return (
    <Button size="small" variant="outlined" onClick={handleClick}>
      Columnas
    </Button>
  );
});

// Custom toolbar: only Columnas + Buscar
const CustomToolbar = memo(function CustomToolbar() {
  return (
    <Box sx={{ p: 1, display: "flex", gap: 1, alignItems: "center" }}>
      <ColumnsButton />
      <Box sx={{ flex: 1 }} />
      <GridToolbarQuickFilter />
    </Box>
  );
});

// Table for listing import templates with sorting and actions
const TemplatesTable = ({
  templates = [],
  loading = false,
  onEdit,
  onDelete,
  isDarkMode,
}) => {
  const rows = useMemo(
    () =>
      (templates || []).map((t) => ({
        id: t._id,
        _id: t._id,
        name: t.name,
        description: t.description || "",
        dataStartRow: t.dataStartRow,
        mappingsCount: Array.isArray(t.mappings) ? t.mappings.length : 0,
        raw: t,
      })),
    [templates],
  );

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Nombre", flex: 1, minWidth: 180 },
      {
        field: "description",
        headerName: "Descripción",
        flex: 1.5,
        minWidth: 220,
      },
      {
        field: "dataStartRow",
        headerName: "Fila inicio",
        width: 120,
        type: "number",
      },
      {
        field: "mappingsCount",
        headerName: "Mapeos",
        width: 120,
        type: "number",
      },
      {
        field: "actions",
        headerName: "Acciones",
        sortable: false,
        filterable: false,
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              aria-label="editar plantilla"
              onClick={() => onEdit?.(params.row.raw)}
              sx={{
                color: "#2196f3",
                "&:hover": { background: "rgba(33,150,243,0.1)" },
              }}
            >
              <icons.editar fontSize="small" aria-hidden="true" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="eliminar plantilla"
              onClick={() => onDelete?.(params.row.raw)}
              sx={{
                color: "#f44336",
                "&:hover": { background: "rgba(244,67,54,0.1)" },
              }}
            >
              <icons.eliminar fontSize="small" aria-hidden="true" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <Card
      sx={{
        background: isDarkMode
          ? "rgba(45, 55, 72, 0.8)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
          sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          filter: { filterModel: { items: [] } },
        }}
        pageSizeOptions={[5]}
        slots={{ toolbar: CustomToolbar }}
        localeText={{
          toolbarColumns: "Columnas",
          toolbarQuickFilterPlaceholder: "Buscar",
        }}
        slotProps={{
          pagination: {
            labelRowsPerPage: "",
            labelDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} de ${count}`,
            rowsPerPageOptions: [5],
          },
        }}
        sx={{
          // Hide rows-per-page selector and label
          "& .MuiTablePagination-selectLabel": { display: "none" },
          "& .MuiTablePagination-input": { display: "none" },
          // Hide search inside the Columns panel
          "& .MuiDataGrid-panel .MuiDataGrid-columnsPanel .MuiFormControl-root":
            { display: "none" },
          // Hide Show/Hide All if present
          '& .MuiDataGrid-panel .MuiDataGrid-columnsPanel [data-testid="show-hide-all"]':
            { display: "none" },
        }}
      />
    </Card>
  );
};

export default memo(TemplatesTable);
