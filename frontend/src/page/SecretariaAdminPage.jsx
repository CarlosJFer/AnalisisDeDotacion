import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../services/api';
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Snackbar, Tooltip, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Pagination } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VirtualizedTable from '../components/VirtualizedTable';


const SecretariaAdminPage = () => {
  // Snackbars
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Formulario de nueva secretaría/dependencia
  const [newSec, setNewSec] = useState({ nombre: '', descripcion: '', idPadre: '', orden: '', activo: true, funcion: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  // Estado y lógica para edición
  const [editingSec, setEditingSec] = useState(null);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Estado para dependencias existentes (para el select de padre)
  const [allDeps, setAllDeps] = useState([]);
  
  // Estados para paginación (fallback si virtualización no está disponible)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [useVirtualization, setUseVirtualization] = useState(true);

  const fetchSecretarias = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/dependencies');
      setSecretarias(data); // Mostrar todas las dependencias
    } catch (err) {
      setError('Error al cargar secretarías');
    } finally {
      setLoading(false);
    }
  };

  // Cargar todas las dependencias para el select de padre
  const fetchAllDeps = async () => {
    try {
      const { data } = await apiClient.get('/dependencies');
      setAllDeps(data);
    } catch (err) {
      // No hacer nada especial
    }
  };

  useEffect(() => {
    fetchSecretarias();
    fetchAllDeps();
  }, []);

  // Calcular nivel automáticamente
  const getNivel = (idPadre) => {
    if (!idPadre) return 1;
    const padre = allDeps.find(d => d._id === idPadre);
    return padre ? (padre.nivel || 1) + 1 : 1;
  };

  const handleCreateSec = async (e) => {
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
      setNewSec({ nombre: '', descripcion: '', idPadre: '', orden: '', activo: true, funcion: '' });
      fetchSecretarias();
      fetchAllDeps();
      showSnackbar('Dependencia creada correctamente', 'success');
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error al crear dependencia');
      showSnackbar(err.response?.data?.message || 'Error al crear dependencia', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSec = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta secretaría?')) return;
    try {
      await apiClient.delete(`/dependencies/${id}`);
      fetchSecretarias();
      fetchAllDeps(); // Actualizar la lista de dependencias para el select de Padre
      showSnackbar('Secretaría eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar secretaría', 'error');
    }
  };

  const handleEditSec = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError('');
    setEditSuccess(false);
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
      fetchSecretarias();
      fetchAllDeps();
      setEditSuccess(true);
      showSnackbar('Dependencia editada correctamente', 'success');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error al editar dependencia');
      showSnackbar(err.response?.data?.message || 'Error al editar dependencia', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const SecretariaRow = React.memo(({ sec, onEdit, onDelete }) => (
    <TableRow key={sec._id}>
      <TableCell>{sec.nombre}</TableCell>
      <TableCell>{sec.codigo}</TableCell>
      <TableCell>{sec.orden !== undefined ? sec.orden : '-'}</TableCell>
      <TableCell>{sec.activo !== false ? 'Activo' : 'Desactivado'}</TableCell>
      <TableCell>
        <Tooltip title="Editar"><span><Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => onEdit(sec)}>Editar</Button></span></Tooltip>
        <Tooltip title="Eliminar"><span><Button size="small" variant="outlined" color="error" onClick={() => onDelete(sec._id)}>Eliminar</Button></span></Tooltip>
      </TableCell>
    </TableRow>
  ));

  // Optimización: crear mapa de dependencias para búsquedas rápidas
  const dependenciasMap = useMemo(() => {
    const map = new Map();
    allDeps.forEach(dep => {
      map.set(dep._id, dep);
    });
    return map;
  }, [allDeps]);

  // Función para obtener el nombre de la dependencia padre
  const getNombrePadre = (idPadre) => {
    if (!idPadre) return 'Raíz';
    const padre = dependenciasMap.get(idPadre);
    return padre ? padre.nombre : 'No encontrado';
  };

  // Datos paginados para fallback
  const paginatedData = useMemo(() => {
    if (useVirtualization) return secretarias;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return secretarias.slice(startIndex, endIndex);
  }, [secretarias, currentPage, itemsPerPage, useVirtualization]);

  const totalPages = Math.ceil(secretarias.length / itemsPerPage);
  const secretariasMemo = useMemo(() => paginatedData, [paginatedData]);

  return (
    <Box maxWidth={1400} mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Gestión de Secretarías</Typography>
      {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Formulario para crear secretaría - Solo se muestra si no estamos editando */}
      {!editingSec && (
        <Card className="mb-6 mt-4">
          <CardContent>
            <Typography variant="h6" gutterBottom>Agregar dependencias</Typography>
            <Box component="form" onSubmit={handleCreateSec} display="flex" flexWrap="wrap" gap={2} alignItems="center">
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
              <Button type="submit" variant="contained" color="primary" disabled={creating} sx={{ minWidth: 120 }}>
                {creating ? <CircularProgress size={20} color="inherit" /> : 'Agregar'}
              </Button>
              {createError && <Alert severity="error">{createError}</Alert>}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Formulario de edición de secretaría */}
      {editingSec && (
        <Card className="mb-6 mt-4 bg-gray-50">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Editar dependencias</Typography>
            <Box component="form" onSubmit={handleEditSec} display="flex" flexWrap="wrap" gap={2} alignItems="center">
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
              <TextField
                label="¿Qué función cumple?"
                value={editingSec.funcion || ''}
                onChange={e => setEditingSec({ ...editingSec, funcion: e.target.value })}
                size="small"
                multiline
                maxRows={2}
                sx={{ minWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Pertenece a:</InputLabel>
                <Select
                  value={editingSec.idPadre || ''}
                  label="Pertenece a:"
                  onChange={e => setEditingSec({ ...editingSec, idPadre: e.target.value })}
                >
                  <MenuItem value="">(Raíz / Secretaría principal)</MenuItem>
                  {allDeps.filter(dep => dep._id !== editingSec._id).map(dep => (
                    <MenuItem key={dep._id} value={dep._id}>{dep.nombre} ({dep.codigo})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Posición"
                type="number"
                value={editingSec.orden || ''}
                onChange={e => setEditingSec({ ...editingSec, orden: e.target.value })}
                size="small"
                sx={{ minWidth: 120 }}
              />
              <FormControlLabel
                control={<Checkbox checked={editingSec.activo !== false} onChange={e => setEditingSec({ ...editingSec, activo: e.target.checked })} />}
                label="Activo"
              />
              <Button type="submit" variant="contained" color="primary" disabled={savingEdit} sx={{ minWidth: 120 }}>
                {savingEdit ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
              </Button>
              <Button type="button" variant="outlined" color="secondary" onClick={() => setEditingSec(null)}>Cancelar</Button>
              {editError && <Alert severity="error">{editError}</Alert>}
            </Box>
          </CardContent>
        </Card>
      )}
      {editSuccess && (
        <Alert severity="success" sx={{ my: 2 }}>¡Edición guardada correctamente!</Alert>
      )}

      {!loading && !error && (
        <>
          {/* Tabla virtualizada para mejor rendimiento */}
          {useVirtualization ? (
            <VirtualizedTable
              data={secretariasMemo}
              onEdit={setEditingSec}
              onDelete={handleDeleteSec}
              getNombrePadre={getNombrePadre}
              height={Math.min(600, Math.max(300, secretariasMemo.length * 60 + 100))}
            />
          ) : (
            /* Tabla tradicional con paginación como fallback */
            <>
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Pertenece a:</TableCell>
                      <TableCell>Posición</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {secretariasMemo.map(sec => (
                      <TableRow key={sec._id}>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sec.nivel > 1 && <ChevronRightIcon fontSize="small" sx={{ verticalAlign: 'middle', color: 'gray.500', mr: 0.5 }} />}
                          <span title={sec.nombre}>{sec.nombre}</span>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span title={sec.codigo}>{sec.codigo}</span>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getNombrePadre(sec.idPadre)}
                        </TableCell>
                        <TableCell>{sec.orden !== undefined ? sec.orden : '-'}</TableCell>
                        <TableCell>{sec.activo !== false ? 'Activo' : 'Desactivado'}</TableCell>
                        <TableCell>
                          <Tooltip title="Editar"><span><Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => setEditingSec(sec)}>Editar</Button></span></Tooltip>
                          <Tooltip title="Eliminar"><span><Button size="small" variant="outlined" color="error" onClick={() => handleDeleteSec(sec._id)}>Eliminar</Button></span></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
          
          {/* Toggle para cambiar entre virtualización y paginación */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="text"
              size="small"
              onClick={() => setUseVirtualization(!useVirtualization)}
              sx={{ color: 'text.secondary' }}
            >
              {useVirtualization ? 'Usar paginación' : 'Usar virtualización'} 
              ({secretarias.length} registros)
            </Button>
          </Box>
        </>
      )}
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

export default SecretariaAdminPage;
