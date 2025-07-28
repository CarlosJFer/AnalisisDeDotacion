import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../services/api';
import { 
  Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, Snackbar, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, useTheme, Chip, Checkbox, ListItemText, Tooltip, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const unidadesComunes = [
  'personas', '%', 'm²', 'kg', 'años', 'meses', 'días', 'horas', 'unidades', 'litros', 'toneladas', 'USD', 'ARS', 'otros...'
];

const campos = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'unidad_medida', label: 'Unidad de medida', required: true },
  { key: 'valor_minimo', label: 'Valor mínimo', required: true, type: 'number' },
  { key: 'valor_maximo', label: 'Valor máximo', required: true, type: 'number' },
  { key: 'umbral_critico', label: 'Umbral crítico', required: true, type: 'number' },
  { key: 'umbral_preventivo', label: 'Umbral preventivo', required: true, type: 'number' },
];

const GestionVariablesPage = () => {
  const theme = useTheme();
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newVar, setNewVar] = useState({ nombre: '', unidad_medida: '', valor_minimo: '', valor_maximo: '', umbral_preventivo: '', umbral_critico: '', activo: true });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingVar, setEditingVar] = useState(null);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [tab, setTab] = useState(0);
  // Para gestión de variables específicas
  const [variablesEspecificas, setVariablesEspecificas] = useState([]);
  const [secretariasModelo, setSecretariasModelo] = useState([]);
  const [loadingEspecificas, setLoadingEspecificas] = useState(false);
  const [errorEspecificas, setErrorEspecificas] = useState('');
  const [newVarEspecifica, setNewVarEspecifica] = useState({ 
    nombre: '', 
    unidad_medida: '', 
    valor_minimo: '',
    valor_maximo: '', 
    umbral_preventivo: '', 
    umbral_critico: '', 
    secretaria: '', // Cambio a selección única
    activo: true 
  });
  const [creatingEspecifica, setCreatingEspecifica] = useState(false);
  const [createErrorEspecifica, setCreateErrorEspecifica] = useState('');
  const [editingVarEspecifica, setEditingVarEspecifica] = useState(null);
  const [editErrorEspecifica, setEditErrorEspecifica] = useState('');
  const [savingEditEspecifica, setSavingEditEspecifica] = useState(false);


  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const fetchVariables = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/variables');
      setVariables(data);
    } catch (err) {
      setError('Error al cargar variables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  // Cargar variables específicas y secretarías modelo
  useEffect(() => {
    if (tab === 1) {
      fetchVariablesEspecificas();
      fetchSecretariasModelo();
    }
  }, [tab]);

  // Fetch variables específicas
  const fetchVariablesEspecificas = async () => {
    setLoadingEspecificas(true);
    setErrorEspecificas('');
    try {
      const res = await apiClient.get('/variables-especificas');
      setVariablesEspecificas(res.data);
    } catch (error) {
      setErrorEspecificas('Error al cargar variables específicas');
    } finally {
      setLoadingEspecificas(false);
    }
  };

  // Fetch secretarías modelo
  const fetchSecretariasModelo = async () => {
    try {
      const res = await apiClient.get('/variables-especificas/secretarias');
      setSecretariasModelo(res.data);
    } catch (error) {
      console.error('Error al cargar secretarías modelo:', error);
    }
  };

  // Crear variable específica
  const handleCreateVarEspecifica = async (e) => {
    e.preventDefault();
    setCreatingEspecifica(true);
    setCreateErrorEspecifica('');
    try {
      const payload = { ...newVarEspecifica };
      payload.valor_maximo = Number(payload.valor_maximo);
      payload.umbral_preventivo = Number(payload.umbral_preventivo);
      payload.umbral_critico = Number(payload.umbral_critico);
      await apiClient.post('/variables-especificas', payload);
      setNewVarEspecifica({ 
        nombre: '', 
        unidad_medida: '', 
        valor_minimo: '',
        valor_maximo: '', 
        umbral_preventivo: '', 
        umbral_critico: '', 
        secretaria: '',
        activo: true 
      });
      fetchVariablesEspecificas();
      showSnackbar('Variable específica creada correctamente', 'success');
    } catch (err) {
      setCreateErrorEspecifica(err.response?.data?.error || 'Error al crear variable específica');
      showSnackbar(err.response?.data?.error || 'Error al crear variable específica', 'error');
    } finally {
      setCreatingEspecifica(false);
    }
  };

  // Eliminar variable específica
  const handleDeleteVarEspecifica = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta variable específica?')) return;
    try {
      await apiClient.delete(`/variables-especificas/${id}`);
      fetchVariablesEspecificas();
      showSnackbar('Variable específica eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar variable específica', 'error');
    }
  };

  // Editar variable específica
  const handleEditVarEspecifica = async (e) => {
    e.preventDefault();
    setSavingEditEspecifica(true);
    setEditErrorEspecifica('');
    try {
      const payload = { ...editingVarEspecifica };
      payload.valor_maximo = Number(payload.valor_maximo);
      payload.umbral_preventivo = Number(payload.umbral_preventivo);
      payload.umbral_critico = Number(payload.umbral_critico);
      await apiClient.put(`/variables-especificas/${editingVarEspecifica._id}`, payload);
      setEditingVarEspecifica(null);
      fetchVariablesEspecificas();
      showSnackbar('Variable específica editada correctamente', 'success');
    } catch (err) {
      setEditErrorEspecifica(err.response?.data?.error || 'Error al editar variable específica');
      showSnackbar(err.response?.data?.error || 'Error al editar variable específica', 'error');
    } finally {
      setSavingEditEspecifica(false);
    }
  };

  // Validación visual de umbrales para variables globales
  const umbralesValidos = () => {
    const { valor_minimo, valor_maximo, umbral_preventivo, umbral_critico } = newVar;
    return (
      Number(valor_minimo) < Number(umbral_critico) &&
      Number(umbral_critico) < Number(umbral_preventivo) &&
      Number(umbral_preventivo) < Number(valor_maximo)
    );
  };

  // Validación visual de umbrales para edición de variables globales
  const umbralesEditValidos = (v) => {
    return (
      Number(v.valor_minimo) < Number(v.umbral_critico) &&
      Number(v.umbral_critico) < Number(v.umbral_preventivo) &&
      Number(v.umbral_preventivo) < Number(v.valor_maximo)
    );
  };

  // Validación visual de umbrales para variables específicas
  const umbralesEspecificaValidos = () => {
    const { valor_minimo, valor_maximo, umbral_preventivo, umbral_critico } = newVarEspecifica;
    return (
      Number(valor_minimo) < Number(umbral_critico) &&
      Number(umbral_critico) < Number(umbral_preventivo) &&
      Number(umbral_preventivo) < Number(valor_maximo)
    );
  };

  // Validación visual de umbrales para edición de variables específicas
  const umbralesEditEspecificaValidos = (v) => {
    return (
      Number(v.valor_minimo) < Number(v.umbral_critico) &&
      Number(v.umbral_critico) < Number(v.umbral_preventivo) &&
      Number(v.umbral_preventivo) < Number(v.valor_maximo)
    );
  };

  const handleCreateVar = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const payload = { ...newVar };
      payload.valor_maximo = Number(payload.valor_maximo);
      payload.umbral_preventivo = Number(payload.umbral_preventivo);
      payload.umbral_critico = Number(payload.umbral_critico);
      await apiClient.post('/variables', payload);
      setNewVar({ nombre: '', unidad_medida: '', valor_minimo: '', valor_maximo: '', umbral_preventivo: '', umbral_critico: '', activo: true });
      fetchVariables();
      showSnackbar('Variable creada correctamente', 'success');
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Error al crear variable');
      showSnackbar(err.response?.data?.error || 'Error al crear variable', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta variable?')) return;
    try {
      await apiClient.delete(`/variables/${id}`);
      fetchVariables();
      showSnackbar('Variable eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar variable', 'error');
    }
  };

  const handleEditVar = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError('');
    setEditSuccess(false);
    try {
      const payload = { ...editingVar };
      payload.valor_maximo = Number(payload.valor_maximo);
      payload.umbral_preventivo = Number(payload.umbral_preventivo);
      payload.umbral_critico = Number(payload.umbral_critico);
      await apiClient.put(`/variables/${editingVar._id}`, payload);
      setEditingVar(null);
      fetchVariables();
      setEditSuccess(true);
      showSnackbar('Variable editada correctamente', 'success');
    } catch (err) {
      setEditError(err.response?.data?.error || 'Error al editar variable');
      showSnackbar(err.response?.data?.error || 'Error al editar variable', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const variablesMemo = useMemo(() => variables, [variables]);

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Gestión de Variables</Typography>
      <Tabs 
        value={tab} 
        onChange={(_, v) => setTab(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-root': {
            minHeight: 'auto'
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: 3,
            borderRadius: '3px 3px 0 0'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            minHeight: 48,
            padding: '12px 24px',
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 600
            },
            '&:hover': {
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(144, 202, 249, 0.08)' 
                : 'rgba(25, 118, 210, 0.04)'
            }
          },
          '& .MuiTabs-flexContainer': {
            borderBottom: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Tab label="Variables Globales" />
        <Tab label="Variables Específicas" />
      </Tabs>
      {tab === 0 && (
        <>
          {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Formulario para crear variable */}
          <Card className="mb-6 mt-4">
            <CardContent>
              <Typography variant="h6" gutterBottom>Agregar variable</Typography>
              <Box component="form" onSubmit={handleCreateVar} display="flex" flexWrap="wrap" gap={2} alignItems="center">
                {campos.map(campo => (
                  campo.key === 'unidad_medida' ? (
                    <Box key={campo.key} display="flex" alignItems="center" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>{campo.label}</InputLabel>
                        <Select
                          value={newVar.unidad_medida}
                          label={campo.label}
                          onChange={e => setNewVar({ ...newVar, unidad_medida: e.target.value })}
                        >
                          {unidadesComunes.map(op => (
                            <MenuItem key={op} value={op}>{op}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Tooltip title="Ejemplo: personas, %, m², kg, años, etc. Elija una opción o escriba una propia.">
                        <InfoOutlinedIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                  ) : (
                    <TextField
                      key={campo.key}
                      required={campo.required}
                      label={campo.label}
                      type={campo.type || 'text'}
                      value={newVar[campo.key]}
                      onChange={e => setNewVar({ ...newVar, [campo.key]: e.target.value })}
                      size="small"
                    />
                  )
                ))}
                <FormControlLabel
                  control={<Checkbox checked={newVar.activo} onChange={e => setNewVar({ ...newVar, activo: e.target.checked })} />}
                  label="Activo (se usa para alertas en organigrama)"
                />
                <Button type="submit" variant="contained" color="primary" disabled={creating || !umbralesValidos()} sx={{ minWidth: 120 }}>
                  {creating ? <CircularProgress size={20} color="inherit" /> : 'Agregar'}
                </Button>
                {newVar.valor_minimo && newVar.valor_maximo && newVar.umbral_preventivo && newVar.umbral_critico && !umbralesValidos() && (
                  <Alert severity="warning">Los umbrales deben cumplir: Mínimo &lt; Crítico &lt; Preventivo &lt; Máximo</Alert>
                )}
                {createError && <Alert severity="error">{createError}</Alert>}
              </Box>
            </CardContent>
          </Card>

          {/* Formulario de edición de variable */}
          {editingVar && (
            <Card className="mb-6 mt-4 bg-gray-50">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Editar variable</Typography>
                <Box component="form" onSubmit={handleEditVar} display="flex" flexWrap="wrap" gap={2} alignItems="center">
                  <TextField
                    required
                    label="Nombre"
                    value={editingVar.nombre}
                    onChange={e => setEditingVar({ ...editingVar, nombre: e.target.value })}
                    size="small"
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Unidad de medida</InputLabel>
                      <Select
                        value={editingVar.unidad_medida}
                        label="Unidad de medida"
                        onChange={e => setEditingVar({ ...editingVar, unidad_medida: e.target.value })}
                      >
                        {unidadesComunes.map(op => (
                          <MenuItem key={op} value={op}>{op}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Ejemplo: personas, %, m², kg, años, etc. Elija una opción o escriba una propia.">
                      <InfoOutlinedIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    required
                    label="Valor mínimo"
                    type="number"
                    value={editingVar.valor_minimo || ''}
                    onChange={e => setEditingVar({ ...editingVar, valor_minimo: e.target.value })}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    required
                    label="Valor máximo"
                    type="number"
                    value={editingVar.valor_maximo}
                    onChange={e => setEditingVar({ ...editingVar, valor_maximo: e.target.value })}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    required
                    label="Umbral preventivo"
                    type="number"
                    value={editingVar.umbral_preventivo}
                    onChange={e => setEditingVar({ ...editingVar, umbral_preventivo: e.target.value })}
                    size="small"
                  />
                  <TextField
                    required
                    label="Umbral crítico"
                    type="number"
                    value={editingVar.umbral_critico}
                    onChange={e => setEditingVar({ ...editingVar, umbral_critico: e.target.value })}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={editingVar.activo !== false} onChange={e => setEditingVar({ ...editingVar, activo: e.target.checked })} />}
                    label="Activo (se usa para alertas en organigrama)"
                  />
                  <Button type="submit" variant="contained" color="primary" disabled={savingEdit || !umbralesEditValidos(editingVar)} sx={{ minWidth: 120 }}>
                    {savingEdit ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
                  </Button>
                  <Button type="button" variant="outlined" color="secondary" onClick={() => setEditingVar(null)}>Cancelar</Button>
                  {!umbralesEditValidos(editingVar) && (
                    <Alert severity="warning">Los umbrales deben cumplir: umbral crítico &lt; umbral preventivo &lt; valor máximo</Alert>
                  )}
                  {editError && <Alert severity="error">{editError}</Alert>}
                </Box>
              </CardContent>
            </Card>
          )}
          {editSuccess && (
            <Alert severity="success" sx={{ my: 2 }}>¡Edición guardada correctamente!</Alert>
          )}

          {/* Tabla de variables */}
          {!loading && !error && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Unidad</TableCell>
                    <TableCell>Valor mínimo</TableCell>
                    <TableCell>Valor máximo</TableCell>
                    <TableCell>Umbral crítico</TableCell>
                    <TableCell>Umbral preventivo</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variablesMemo.map(variable => (
                    <TableRow key={variable._id}>
                      <TableCell>{variable.nombre}</TableCell>
                      <TableCell>{variable.unidad_medida}</TableCell>
                      <TableCell>{variable.valor_minimo}</TableCell>
                      <TableCell>{variable.valor_maximo}</TableCell>
                      <TableCell>{variable.umbral_critico}</TableCell>
                      <TableCell>{variable.umbral_preventivo}</TableCell>
                      <TableCell>
                        <Tooltip title="Editar"><span><Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => setEditingVar(variable)}>Editar</Button></span></Tooltip>
                        <Tooltip title="Eliminar"><span><Button size="small" variant="outlined" color="error" onClick={() => handleDeleteVar(variable._id)}>Eliminar</Button></span></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      {tab === 1 && (
        <>
          {loadingEspecificas && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
          {errorEspecificas && <Alert severity="error">{errorEspecificas}</Alert>}

          {/* Formulario para crear variable específica */}
          <Card className="mb-6 mt-4">
            <CardContent>
              <Typography variant="h6" gutterBottom>Agregar Variable Específica</Typography>
              <Box component="form" onSubmit={handleCreateVarEspecifica} display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <TextField
                  label="Nombre"
                  size="small"
                  value={newVarEspecifica.nombre}
                  onChange={e => setNewVarEspecifica(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Unidad de medida</InputLabel>
                  <Select
                    value={newVarEspecifica.unidad_medida}
                    onChange={e => setNewVarEspecifica(prev => ({ ...prev, unidad_medida: e.target.value }))}
                    label="Unidad de medida"
                    required
                  >
                    <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                    <MenuItem value="cantidad">Cantidad</MenuItem>
                    <MenuItem value="dias">Días</MenuItem>
                    <MenuItem value="horas">Horas</MenuItem>
                    <MenuItem value="pesos">Pesos ($)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Valor mínimo"
                  type="number"
                  size="small"
                  value={newVarEspecifica.valor_minimo}
                  onChange={e => setNewVarEspecifica(prev => ({ ...prev, valor_minimo: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  label="Valor máximo"
                  type="number"
                  size="small"
                  value={newVarEspecifica.valor_maximo}
                  onChange={e => setNewVarEspecifica(prev => ({ ...prev, valor_maximo: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  label="Umbral preventivo"
                  type="number"
                  size="small"
                  value={newVarEspecifica.umbral_preventivo}
                  onChange={e => setNewVarEspecifica(prev => ({ ...prev, umbral_preventivo: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label="Umbral crítico"
                  type="number"
                  size="small"
                  value={newVarEspecifica.umbral_critico}
                  onChange={e => setNewVarEspecifica(prev => ({ ...prev, umbral_critico: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ minWidth: 120 }}
                />
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>Secretaría</InputLabel>
                  <Select
                    value={newVarEspecifica.secretaria}
                    onChange={e => setNewVarEspecifica(prev => ({ ...prev, secretaria: e.target.value }))}
                    label="Secretaría"
                    required
                  >
                    {secretariasModelo.map((secretaria) => (
                      <MenuItem key={secretaria} value={secretaria}>
                        {secretaria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={creatingEspecifica || !umbralesEspecificaValidos() || !newVarEspecifica.secretaria || !newVarEspecifica.nombre.trim()}
                  startIcon={<AddIcon />}
                >
                  {creatingEspecifica ? 'Creando...' : 'Crear'}
                </Button>
              </Box>
              {createErrorEspecifica && <Alert severity="error" sx={{ mt: 2 }}>{createErrorEspecifica}</Alert>}
              {newVarEspecifica.valor_minimo && newVarEspecifica.valor_maximo && newVarEspecifica.umbral_preventivo && newVarEspecifica.umbral_critico && !umbralesEspecificaValidos() && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Los umbrales deben cumplir: Mínimo &lt; Crítico &lt; Preventivo &lt; Máximo
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Tabla de variables específicas */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Valor mínimo</TableCell>
                  <TableCell>Valor máximo</TableCell>
                  <TableCell>Umbral crítico</TableCell>
                  <TableCell>Umbral preventivo</TableCell>
                  <TableCell>Secretaría</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variablesEspecificas.map(variable => (
                  <TableRow key={variable._id}>
                    <TableCell>{variable.nombre}</TableCell>
                    <TableCell>{variable.unidad_medida}</TableCell>
                    <TableCell>{variable.valor_minimo}</TableCell>
                    <TableCell>{variable.valor_maximo}</TableCell>
                    <TableCell>{variable.umbral_critico}</TableCell>
                    <TableCell>{variable.umbral_preventivo}</TableCell>
                    <TableCell>
                      <Chip label={variable.secretaria} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={variable.activo ? 'Activo' : 'Inactivo'} 
                        color={variable.activo ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingVarEspecifica({ ...variable })}
                          startIcon={<EditIcon />}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteVarEspecifica(variable._id)}
                          startIcon={<DeleteIcon />}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Modal de edición para Variables Específicas */}
      <Dialog open={!!editingVarEspecifica} onClose={() => setEditingVarEspecifica(null)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Variable Específica</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditVarEspecifica} display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={editingVarEspecifica?.nombre || ''}
              onChange={e => setEditingVarEspecifica(prev => ({ ...prev, nombre: e.target.value }))}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Unidad de medida</InputLabel>
              <Select
                value={editingVarEspecifica?.unidad_medida || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, unidad_medida: e.target.value }))}
                label="Unidad de medida"
                required
              >
                <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                <MenuItem value="cantidad">Cantidad</MenuItem>
                <MenuItem value="dias">Días</MenuItem>
                <MenuItem value="horas">Horas</MenuItem>
                <MenuItem value="pesos">Pesos ($)</MenuItem>
              </Select>
            </FormControl>
            <Box display="flex" gap={2}>
              <TextField
                label="Valor mínimo"
                type="number"
                value={editingVarEspecifica?.valor_minimo || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, valor_minimo: e.target.value }))}
                required
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
              />
              <TextField
                label="Valor máximo"
                type="number"
                value={editingVarEspecifica?.valor_maximo || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, valor_maximo: e.target.value }))}
                required
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
              />
              <TextField
                label="Umbral preventivo"
                type="number"
                value={editingVarEspecifica?.umbral_preventivo || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, umbral_preventivo: e.target.value }))}
                required
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
              />
              <TextField
                label="Umbral crítico"
                type="number"
                value={editingVarEspecifica?.umbral_critico || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, umbral_critico: e.target.value }))}
                required
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Secretaría</InputLabel>
              <Select
                value={editingVarEspecifica?.secretaria || ''}
                onChange={e => setEditingVarEspecifica(prev => ({ ...prev, secretaria: e.target.value }))}
                label="Secretaría"
                required
              >
                {secretariasModelo.map((secretaria) => (
                  <MenuItem key={secretaria} value={secretaria}>
                    {secretaria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editErrorEspecifica && <Alert severity="error">{editErrorEspecifica}</Alert>}
            {editingVarEspecifica && !umbralesEditEspecificaValidos(editingVarEspecifica) && editingVarEspecifica.valor_minimo && editingVarEspecifica.valor_maximo && editingVarEspecifica.umbral_preventivo && editingVarEspecifica.umbral_critico && (
              <Alert severity="warning">
                Los umbrales deben cumplir: Mínimo &lt; Crítico &lt; Preventivo &lt; Máximo
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingVarEspecifica(null)}>Cancelar</Button>
          <Button 
            onClick={handleEditVarEspecifica} 
            variant="contained" 
            disabled={savingEditEspecifica || !editingVarEspecifica || !umbralesEditEspecificaValidos(editingVarEspecifica) || !editingVarEspecifica?.secretaria}
          >
            {savingEditEspecifica ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default GestionVariablesPage; 