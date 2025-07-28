import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '../services/api';
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Box, Snackbar, Tooltip, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Avatar, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useTheme } from '../context/ThemeContext.jsx';
import { optimizedStyles, getGradient } from '../utils/performance.js';
import { useOptimizedDataTable } from '../hooks/useOptimizedSearch.js';
import OptimizedTable from '../components/OptimizedTable.jsx';
import OptimizedLoading from '../components/OptimizedLoading.jsx';

const SecretariaAdminPageOptimized = () => {
  const { isDarkMode } = useTheme();
  
  // Estados principales
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados del formulario
  const [newSec, setNewSec] = useState({ 
    nombre: '', 
    descripcion: '', 
    idPadre: '', 
    orden: '', 
    activo: true, 
    funcion: '' 
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Estados de edición
  const [editingSec, setEditingSec] = useState(null);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Estado para dependencias padre
  const [allDeps, setAllDeps] = useState([]);

  // Configuración de la tabla optimizada
  const tableConfig = useMemo(() => ({
    searchFields: ['nombre', 'codigo', 'funcion'],
    searchOptions: {
      debounceDelay: 300,
      minSearchLength: 2,
    },
  }), []);

  // Hook de tabla optimizada
  const {
    data: filteredSecretarias,
    searchTerm,
    handleSearchChange,
    clearSearch,
    filteredCount,
    totalCount,
  } = useOptimizedDataTable(secretarias, tableConfig);

  // Callbacks optimizados
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Fetch optimizado con manejo de errores
  const fetchSecretarias = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/dependencies');
      setSecretarias(data);
    } catch (err) {
      setError('Error al cargar secretarías');
      showSnackbar('Error al cargar secretarías', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchAllDeps = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/dependencies');
      setAllDeps(data);
    } catch (err) {
      console.error('Error al cargar dependencias:', err);
    }
  }, []);

  useEffect(() => {
    fetchSecretarias();
    fetchAllDeps();
  }, [fetchSecretarias, fetchAllDeps]);

  // Función para calcular nivel
  const getNivel = useCallback((idPadre) => {
    if (!idPadre) return 1;
    const padre = allDeps.find(d => d._id === idPadre);
    return padre ? (padre.nivel || 1) + 1 : 1;
  }, [allDeps]);

  // Handlers optimizados
  const handleCreateSec = useCallback(async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    
    try {
      const payload = {
        ...newSec,
        idPadre: newSec.idPadre === '' ? null : newSec.idPadre,
        nivel: getNivel(newSec.idPadre),
        orden: newSec.orden !== '' ? Number(newSec.orden) : 999,
        activo: newSec.activo !== false,
      };
      
      await apiClient.post('/dependencies', payload);
      
      setNewSec({ 
        nombre: '', 
        descripcion: '', 
        idPadre: '', 
        orden: '', 
        activo: true, 
        funcion: '' 
      });
      
      await Promise.all([fetchSecretarias(), fetchAllDeps()]);
      showSnackbar('Dependencia creada correctamente', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear dependencia';
      setCreateError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setCreating(false);
    }
  }, [newSec, getNivel, fetchSecretarias, fetchAllDeps, showSnackbar]);

  const handleDeleteSec = useCallback(async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta secretaría?')) return;
    
    try {
      await apiClient.delete(`/dependencies/${id}`);
      await Promise.all([fetchSecretarias(), fetchAllDeps()]);
      showSnackbar('Secretaría eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar secretaría', 'error');
    }
  }, [fetchSecretarias, fetchAllDeps, showSnackbar]);

  const handleEditSec = useCallback(async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError('');
    
    try {
      const payload = {
        ...editingSec,
        idPadre: editingSec.idPadre === '' ? null : editingSec.idPadre,
        nivel: getNivel(editingSec.idPadre),
        orden: editingSec.orden !== '' ? Number(editingSec.orden) : 999,
        activo: editingSec.activo !== false,
      };
      
      await apiClient.put(`/dependencies/${editingSec._id}`, payload);
      setEditingSec(null);
      await Promise.all([fetchSecretarias(), fetchAllDeps()]);
      showSnackbar('Dependencia editada correctamente', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al editar dependencia';
      setEditError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSavingEdit(false);
    }
  }, [editingSec, getNivel, fetchSecretarias, fetchAllDeps, showSnackbar]);

  // Función para obtener nombre del padre (memoizada)
  const getNombrePadre = useCallback((idPadre) => {
    if (!idPadre) return 'Raíz';
    const padre = allDeps.find(dep => dep._id === idPadre);
    return padre ? padre.nombre : 'No encontrado';
  }, [allDeps]);

  // Configuración de columnas para la tabla optimizada
  const tableColumns = useMemo(() => [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            width: 24, 
            height: 24, 
            background: getGradient('primary'),
          }}>
            <BusinessIcon sx={{ fontSize: 12 }} />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {item.nombre}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (item) => (
        <Typography variant="body2">{item.codigo}</Typography>
      ),
    },
    {
      key: 'idPadre',
      label: 'Pertenece a',
      render: (item) => (
        <Typography variant="body2">{getNombrePadre(item.idPadre)}</Typography>
      ),
    },
    {
      key: 'orden',
      label: 'Posición',
      render: (item) => (
        <Typography variant="body2">{item.orden !== undefined ? item.orden : '-'}</Typography>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (item) => (
        <Chip 
          label={item.activo !== false ? 'Activo' : 'Desactivado'}
          size="small"
          sx={{
            background: item.activo !== false 
              ? getGradient('primary')
              : getGradient('error'),
            color: 'white',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => setEditingSec(item)}
              sx={{
                minWidth: 'auto',
                p: 1,
                ...optimizedStyles.modernButton(isDarkMode),
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => handleDeleteSec(item._id)}
              sx={{
                minWidth: 'auto',
                p: 1,
                color: '#f44336',
                borderColor: 'rgba(244, 67, 54, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.15)',
                  borderColor: 'rgba(244, 67, 54, 0.8)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ], [isDarkMode, getNombrePadre, handleDeleteSec]);

  if (loading) {
    return <OptimizedLoading variant="table" rows={10} columns={6} />;
  }

  return (
    <Box sx={optimizedStyles.glassmorphism(isDarkMode, 'high')}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ 
          width: 48, 
          height: 48, 
          background: getGradient('primary'),
        }}>
          <AccountTreeIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 700,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          Gestión de Secretarías
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Formulario de creación */}
      {!editingSec && (
        <Card sx={{ ...optimizedStyles.glassmorphism(isDarkMode, 'normal'), mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                background: getGradient('primary'),
              }}>
                <AddIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Agregar nueva dependencia
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleCreateSec} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
              <TextField 
                required 
                label="Nombre" 
                value={newSec.nombre} 
                onChange={e => setNewSec({ ...newSec, nombre: e.target.value })} 
                size="small" 
                sx={{ minWidth: 250 }}
              />
              <TextField
                label="¿Qué función cumple?"
                value={newSec.funcion}
                onChange={e => setNewSec({ ...newSec, funcion: e.target.value })}
                size="small"
                multiline
                maxRows={2}
                sx={{ minWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Pertenece a:</InputLabel>
                <Select
                  value={newSec.idPadre || ''}
                  label="Pertenece a:"
                  onChange={e => setNewSec({ ...newSec, idPadre: e.target.value })}
                >
                  <MenuItem value="">(Raíz / Secretaría principal)</MenuItem>
                  {allDeps.map(dep => (
                    <MenuItem key={dep._id} value={dep._id}>{dep.nombre} ({dep.codigo})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Posición"
                type="number"
                value={newSec.orden || ''}
                onChange={e => setNewSec({ ...newSec, orden: e.target.value })}
                size="small"
                sx={{ minWidth: 120 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={creating} 
                startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                sx={{
                  background: getGradient('primary'),
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 120,
                  ...optimizedStyles.modernButton(isDarkMode),
                }}
              >
                {creating ? 'Agregando...' : 'Agregar'}
              </Button>
            </Box>
            {createError && <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert>}
          </CardContent>
        </Card>
      )}

      {/* Formulario de edición */}
      {editingSec && (
        <Card sx={{ 
          ...optimizedStyles.glassmorphism(isDarkMode, 'normal'), 
          mb: 4,
          border: '1px solid rgba(255, 152, 0, 0.3)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                background: getGradient('warning'),
              }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Editar dependencia: {editingSec.nombre}
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleEditSec} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
              {/* Campos del formulario de edición */}
              <TextField 
                required 
                label="Nombre" 
                value={editingSec.nombre} 
                onChange={e => setEditingSec({ ...editingSec, nombre: e.target.value })} 
                size="small" 
                sx={{ minWidth: 200 }}
              />
              <TextField 
                required 
                label="ID" 
                value={editingSec.codigo} 
                onChange={e => setEditingSec({ ...editingSec, codigo: e.target.value })} 
                size="small" 
                sx={{ minWidth: 200 }}
              />
              {/* Resto de campos... */}
              <Button 
                type="submit" 
                variant="contained" 
                disabled={savingEdit}
                startIcon={savingEdit ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
                sx={{
                  background: getGradient('warning'),
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 120,
                  mr: 1,
                  ...optimizedStyles.modernButton(isDarkMode),
                }}
              >
                {savingEdit ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button 
                type="button" 
                variant="outlined" 
                onClick={() => setEditingSec(null)}
                sx={optimizedStyles.modernButton(isDarkMode)}
              >
                Cancelar
              </Button>
            </Box>
            {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
          </CardContent>
        </Card>
      )}

      {/* Tabla optimizada */}
      <OptimizedTable
        data={filteredSecretarias}
        columns={tableColumns}
        searchable={true}
        searchPlaceholder="Buscar secretarías..."
        enableVirtualization={secretarias.length > 100}
        pageSize={50}
        maxHeight={600}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SecretariaAdminPageOptimized;