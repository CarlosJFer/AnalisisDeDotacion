import React, { useMemo } from 'react';
import { Card, Box, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Table for listing import templates with sorting, filtering and actions
const TemplatesTable = ({ templates = [], loading = false, onEdit, onDelete, isDarkMode }) => {
  const rows = useMemo(() => (templates || []).map(t => ({
    id: t._id,
    _id: t._id,
    name: t.name,
    description: t.description || '',
    dataStartRow: t.dataStartRow,
    mappingsCount: Array.isArray(t.mappings) ? t.mappings.length : 0,
    createdAt: t.createdAt,
    raw: t,
  })), [templates]);

  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 180 },
    { field: 'description', headerName: 'Descripción', flex: 1.5, minWidth: 220 },
    { field: 'dataStartRow', headerName: 'Fila inicio', width: 120, type: 'number' },
    { field: 'mappingsCount', headerName: '# Mapeos', width: 120, type: 'number' },
    {
      field: 'createdAt', headerName: 'Creación', width: 160, valueGetter: (params) => {
        const v = params.value; if (!v) return '';
        const d = new Date(v);
        return isNaN(d.getTime()) ? '' : d.toLocaleString();
      }
    },
    {
      field: 'actions', headerName: 'Acciones', sortable: false, filterable: false, width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => onEdit?.(params.row.raw)} sx={{ color: '#2196f3', '&:hover': { background: 'rgba(33,150,243,0.1)' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete?.(params.row.raw)} sx={{ color: '#f44336', '&:hover': { background: 'rgba(244,67,54,0.1)' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Card sx={{
      background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      height: 520
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
          filter: { filterModel: { items: [] } }
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
      />
    </Card>
  );
};

export default TemplatesTable;

