import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import apiClient from '../services/api';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Snackbar, Card, CardContent, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip, Avatar, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '../context/ThemeContext.jsx';
import { useOptimizedForm } from '../components/OptimizedFormField.jsx';
import VariableForm from '../components/VariableForm.jsx';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';

const unidadesComunes = [
  'personas', '%', 'm²', 'kg', 'años', 'meses', 'días', 'horas', 'unidades', 'litros', 'toneladas', 'USD', 'ARS', 'otros...'
];

// Componente de fila de variable memoizado
const VariableRow = memo(({ 
  variable, 
  onEdit, 
  onDelete, 
  isDarkMode,
  type = 'global'
}) => {
  const handleEdit = useCallback(() => onEdit(variable), [onEdit, variable]);
  const handleDelete = useCallback(() => onDelete(variable._id), [onDelete, variable._id]);

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(156, 39, 176, 0.05)',
        },
        transition: 'background-color 0.15s ease',
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{
            width: 24,
            height: 24,
            background: type === 'global'
              ? 'linear-gradient(135deg, #9c27b0, #7b1fa2)'
              : 'linear-gradient(135deg, #2196f3, #1976d2)',
          }}>
            {type === 'global' ? <TuneIcon sx={{ fontSize: 12 }} /> : <SettingsIcon sx={{ fontSize: 12 }} />}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {variable.nombre}
          </Typography>
          {variable.flexible && (
            <Chip label="Flexible" size="small" color="info" sx={{ ml: 1 }} />
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Chip 
          label={variable.unidad_medida}
          size="small"
          sx={{
            background: type === 'global' 
              ? 'linear-gradient(135deg, #9c27b0, #7b1fa2)'
              : 'linear-gradient(135deg, #2196f3, #1976d2)',
            color: 'white',
            fontWeight: 500,
          }}
        />
      </TableCell>
      <TableCell><Typography variant="body2">{variable.valor_minimo}</Typography></TableCell>
      <TableCell><Typography variant="body2">{variable.valor_maximo}</Typography></TableCell>
      <TableCell><Typography variant="body2">{variable.umbral_critico}</Typography></TableCell>
      <TableCell><Typography variant="body2">{variable.umbral_preventivo}</Typography></TableCell>
      {type === 'especifica' && (
        <>
          <TableCell>
            <Chip 
              label={variable.secretaria} 
              size="small" 
              sx={{
                background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          </TableCell>
          <TableCell>
            <Chip 
              label={variable.activo ? 'Activo' : 'Inactivo'} 
              size="small" 
              sx={{
                background: variable.activo 
                  ? 'linear-gradient(135deg, #4caf50, #388e3c)'
                  : 'linear-gradient(135deg, #f44336, #d32f2f)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          </TableCell>
        </>
      )}
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Editar">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleEdit}
              sx={{
                minWidth: 'auto',
                p: 1,
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(156, 39, 176, 0.5)',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(156, 39, 176, 0.15)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(156, 39, 176, 0.8)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleDelete}
              sx={{
                minWidth: 'auto',
                p: 1,
                color: '#f44336',
                borderColor: 'rgba(244, 67, 54, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.15)',
                  borderColor: 'rgba(244, 67, 54, 0.8)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
});

const GestionVariablesPage = () => {
  const { isDarkMode } = useTheme();
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [openCreateVar, setOpenCreateVar] = useState(false);
  const [editingVar, setEditingVar] = useState(null);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [tab, setTab] = useState(0);
  
  // Para gestión de variables específicas
  const [variablesEspecificas, setVariablesEspecificas] = useState([]);
  const [secretariasModelo, setSecretariasModelo] = useState([]);
  const [loadingEspecificas, setLoadingEspecificas] = useState(false);
  const [errorEspecificas, setErrorEspecificas] = useState('');
  const [creatingEspecifica, setCreatingEspecifica] = useState(false);
  const [createErrorEspecifica, setCreateErrorEspecifica] = useState('');
  const [openCreateVarEspecifica, setOpenCreateVarEspecifica] = useState(false);
  const [editingVarEspecifica, setEditingVarEspecifica] = useState(null);
  const [editErrorEspecifica, setEditErrorEspecifica] = useState('');
  const [savingEditEspecifica, setSavingEditEspecifica] = useState(false);

  // Formularios optimizados
  const {
    values: newVar,
    updateValue: updateNewVar,
    reset: resetNewVar,
    validate: validateNewVar
  } = useOptimizedForm({
    nombre: '',
    unidad_medida: '',
    valor_minimo: '',
    valor_maximo: '',
    umbral_preventivo: '',
    umbral_critico: '',
    flexible: false,
    umbral_preventivo_inferior: '',
    umbral_critico_inferior: '',
    umbral_preventivo_superior: '',
    umbral_critico_superior: '',
    activo: true
  });

  const {
    values: newVarEspecifica,
    updateValue: updateNewVarEspecifica,
    reset: resetNewVarEspecifica,
    validate: validateNewVarEspecifica
  } = useOptimizedForm({
    nombre: '',
    unidad_medida: '',
    valor_minimo: '',
    valor_maximo: '',
    umbral_preventivo: '',
    umbral_critico: '',
    umbral_critico_inferior: '',
    umbral_preventivo_inferior: '',
    umbral_preventivo_superior: '',
    umbral_critico_superior: '',
    flexible: false,
    secretaria: '',
    activo: true
  });

  // Callbacks optimizados
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleCloseCreateVar = useCallback(() => {
    setOpenCreateVar(false);
    resetNewVar();
    setCreateError('');
  }, [resetNewVar]);

  const handleCloseCreateVarEspecifica = useCallback(() => {
    setOpenCreateVarEspecifica(false);
    resetNewVarEspecifica();
    setCreateErrorEspecifica('');
  }, [resetNewVarEspecifica]);

  // Fetch optimizado con AbortController
  const fetchVariables = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await apiClient.get('/variables', {
        signal: controller.signal
      });
      setVariables(data);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError('Error al cargar variables');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, []);

  const fetchVariablesEspecificas = useCallback(async () => {
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
  }, []);

  const fetchSecretariasModelo = useCallback(async () => {
    try {
      const res = await apiClient.get('/variables-especificas/secretarias');
      setSecretariasModelo(res.data);
    } catch (error) {
      console.error('Error al cargar secretarías modelo:', error);
    }
  }, []);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  useEffect(() => {
    if (tab === 1) {
      // Usar requestAnimationFrame para evitar bloqueo del UI
      requestAnimationFrame(() => {
        fetchVariablesEspecificas();
        fetchSecretariasModelo();
      });
    }
  }, [tab, fetchVariablesEspecificas, fetchSecretariasModelo]);

  // Validación de umbrales optimizada
  const umbralesValidos = useCallback((valores) => {
    const {
      valor_minimo,
      valor_maximo,
      umbral_preventivo,
      umbral_critico,
      flexible,
      umbral_preventivo_inferior,
      umbral_critico_inferior,
      umbral_preventivo_superior,
      umbral_critico_superior
    } = valores;
    if (!flexible) {
      return (
        Number(valor_minimo) < Number(umbral_critico) &&
        Number(umbral_critico) < Number(umbral_preventivo) &&
        Number(umbral_preventivo) < Number(valor_maximo)
      );
    }
    return (
      Number(valor_minimo) <= Number(umbral_critico_inferior) &&
      Number(umbral_critico_inferior) < Number(umbral_preventivo_inferior) &&
      Number(umbral_preventivo_inferior) < Number(umbral_preventivo_superior) &&
      Number(umbral_preventivo_superior) < Number(umbral_critico_superior) &&
      Number(umbral_critico_superior) <= Number(valor_maximo)
    );
  }, []);

  // Handlers optimizados
  const handleCreateVar = useCallback(async (e) => {
    e.preventDefault();
    
    const isValid = validateNewVar({
      nombre: { required: true, minLength: 2 },
      unidad_medida: { required: true },
      valor_minimo: { required: true },
      valor_maximo: { required: true },
      umbral_preventivo: { required: true },
      umbral_critico: { required: true },
      ...(newVar.flexible ? {
        umbral_preventivo_inferior: { required: true },
        umbral_critico_inferior: { required: true },
        umbral_preventivo_superior: { required: true },
        umbral_critico_superior: { required: true }
      } : {})
    });

    if (!isValid || !umbralesValidos(newVar)) return;

    setCreating(true);
    setCreateError('');
    
    try {
      const payload = {
        ...newVar,
        valor_maximo: Number(newVar.valor_maximo),
        umbral_preventivo: Number(newVar.umbral_preventivo),
        umbral_critico: Number(newVar.umbral_critico),
        flexible: newVar.flexible
      };

      if (newVar.flexible) {
        payload.umbral_preventivo_inferior = Number(newVar.umbral_preventivo_inferior);
        payload.umbral_critico_inferior = Number(newVar.umbral_critico_inferior);
        payload.umbral_preventivo_superior = Number(newVar.umbral_preventivo_superior);
        payload.umbral_critico_superior = Number(newVar.umbral_critico_superior);
      }

      await apiClient.post('/variables', payload);
      resetNewVar();
      await fetchVariables();
      showSnackbar('Variable creada correctamente', 'success');
      setOpenCreateVar(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear variable';
      setCreateError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setCreating(false);
    }
  }, [newVar, validateNewVar, umbralesValidos, resetNewVar, fetchVariables, showSnackbar]);

  const handleDeleteVar = useCallback(async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta variable?')) return;
    
    try {
      await apiClient.delete(`/variables/${id}`);
      await fetchVariables();
      showSnackbar('Variable eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar variable', 'error');
    }
  }, [fetchVariables, showSnackbar]);

  const updateEditingVar = useCallback((name, value) => {
    setEditingVar(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEditVar = useCallback(async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError('');
    
    try {
      const payload = {
        ...editingVar,
        valor_maximo: Number(editingVar.valor_maximo),
        umbral_preventivo: Number(editingVar.umbral_preventivo),
        umbral_critico: Number(editingVar.umbral_critico),
        flexible: editingVar.flexible
      };

      if (editingVar.flexible) {
        payload.umbral_preventivo_inferior = Number(editingVar.umbral_preventivo_inferior);
        payload.umbral_critico_inferior = Number(editingVar.umbral_critico_inferior);
        payload.umbral_preventivo_superior = Number(editingVar.umbral_preventivo_superior);
        payload.umbral_critico_superior = Number(editingVar.umbral_critico_superior);
      }

      await apiClient.put(`/variables/${editingVar._id}`, payload);
      setEditingVar(null);
      await fetchVariables();
      showSnackbar('Variable editada correctamente', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al editar variable';
      setEditError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSavingEdit(false);
    }
  }, [editingVar, fetchVariables, showSnackbar]);

  // Handlers para variables específicas
  const handleCreateVarEspecifica = useCallback(async (e) => {
    e.preventDefault();
    
    const isValid = validateNewVarEspecifica({
      nombre: { required: true, minLength: 2 },
      unidad_medida: { required: true },
      valor_minimo: { required: true },
      valor_maximo: { required: true },
      umbral_preventivo: { required: true },
      umbral_critico: { required: true },
      secretaria: { required: true },
      ...(newVarEspecifica.flexible ? {
        umbral_critico_inferior: { required: true },
        umbral_preventivo_inferior: { required: true },
        umbral_preventivo_superior: { required: true },
        umbral_critico_superior: { required: true }
      } : {})
    });

    if (!isValid || !umbralesValidos(newVarEspecifica)) return;

    setCreatingEspecifica(true);
    setCreateErrorEspecifica('');
    
    try {
      const payload = {
        ...newVarEspecifica,
        valor_maximo: Number(newVarEspecifica.valor_maximo),
        umbral_preventivo: Number(newVarEspecifica.umbral_preventivo),
        umbral_critico: Number(newVarEspecifica.umbral_critico),
        flexible: newVarEspecifica.flexible
      };

      if (newVarEspecifica.flexible) {
        payload.umbral_critico_inferior = Number(newVarEspecifica.umbral_critico_inferior);
        payload.umbral_preventivo_inferior = Number(newVarEspecifica.umbral_preventivo_inferior);
        payload.umbral_preventivo_superior = Number(newVarEspecifica.umbral_preventivo_superior);
        payload.umbral_critico_superior = Number(newVarEspecifica.umbral_critico_superior);
      }

      await apiClient.post('/variables-especificas', payload);
      resetNewVarEspecifica();
      await fetchVariablesEspecificas();
      showSnackbar('Variable específica creada correctamente', 'success');
      setOpenCreateVarEspecifica(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear variable específica';
      setCreateErrorEspecifica(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setCreatingEspecifica(false);
    }
  }, [newVarEspecifica, validateNewVarEspecifica, umbralesValidos, resetNewVarEspecifica, fetchVariablesEspecificas, showSnackbar]);

  const handleDeleteVarEspecifica = useCallback(async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta variable específica?')) return;
    
    try {
      await apiClient.delete(`/variables-especificas/${id}`);
      await fetchVariablesEspecificas();
      showSnackbar('Variable específica eliminada', 'success');
    } catch (err) {
      showSnackbar('Error al eliminar variable específica', 'error');
    }
  }, [fetchVariablesEspecificas, showSnackbar]);

  const updateEditingVarEspecifica = useCallback((name, value) => {
    setEditingVarEspecifica(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEditVarEspecifica = useCallback(async (e) => {
    e.preventDefault();
    setSavingEditEspecifica(true);
    setEditErrorEspecifica('');
    
    try {
      const payload = {
        ...editingVarEspecifica,
        valor_maximo: Number(editingVarEspecifica.valor_maximo),
        umbral_preventivo: Number(editingVarEspecifica.umbral_preventivo),
        umbral_critico: Number(editingVarEspecifica.umbral_critico),
        flexible: editingVarEspecifica.flexible
      };

      if (editingVarEspecifica.flexible) {
        payload.umbral_critico_inferior = Number(editingVarEspecifica.umbral_critico_inferior);
        payload.umbral_preventivo_inferior = Number(editingVarEspecifica.umbral_preventivo_inferior);
        payload.umbral_preventivo_superior = Number(editingVarEspecifica.umbral_preventivo_superior);
        payload.umbral_critico_superior = Number(editingVarEspecifica.umbral_critico_superior);
      }

      await apiClient.put(`/variables-especificas/${editingVarEspecifica._id}`, payload);
      setEditingVarEspecifica(null);
      await fetchVariablesEspecificas();
      showSnackbar('Variable específica editada correctamente', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al editar variable específica';
      setEditErrorEspecifica(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSavingEditEspecifica(false);
    }
  }, [editingVarEspecifica, fetchVariablesEspecificas, showSnackbar]);

  // Opciones memoizadas
  const unidadOptions = useMemo(() => 
    unidadesComunes.map(unidad => ({ value: unidad, label: unidad })),
    []
  );

  const unidadEspecificaOptions = useMemo(() => [
    { value: 'porcentaje', label: 'Porcentaje (%)' },
    { value: 'cantidad', label: 'Cantidad' },
    { value: 'dias', label: 'Días' },
    { value: 'horas', label: 'Horas' },
    { value: 'pesos', label: 'Pesos ($)' }
  ], []);

  const secretariaOptions = useMemo(() => 
    secretariasModelo.map(secretaria => ({ value: secretaria, label: secretaria })),
    [secretariasModelo]
  );

  const variablesMemo = useMemo(() => variables, [variables]);
  const variablesEspecificasMemo = useMemo(() => variablesEspecificas, [variablesEspecificas]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <AdminSectionLayout
      title="Gestión de Variables"
      description="Define, edita y elimina variables de referencia y sus umbrales."
      icon={TuneIcon}
      color="#9c27b0"
      maxWidth={1400}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 4,
          '& .MuiTabs-indicator': {
            backgroundColor: '#9c27b0',
            height: 3,
            borderRadius: '3px 3px 0 0'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            minHeight: 48,
            padding: '12px 24px',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
            '&.Mui-selected': {
              color: '#9c27b0',
              fontWeight: 600
            },
            '&:hover': {
              color: '#9c27b0',
              backgroundColor: isDarkMode 
                ? 'rgba(156, 39, 176, 0.08)' 
                : 'rgba(156, 39, 176, 0.04)'
            }
          },
          '& .MuiTabs-flexContainer': {
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }
        }}
      >
        <Tab 
          label="Variables Globales" 
          icon={<SettingsIcon />}
          iconPosition="start"
        />
        <Tab 
          label="Variables Específicas" 
          icon={<TuneIcon />}
          iconPosition="start"
        />
      </Tabs>

      {tab === 0 && (
        <>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateVar(true)}>
              Agregar Variable
            </Button>
          </Box>

          {/* Tabla de variables globales */}
          <Card 
            sx={{ 
              background: isDarkMode
                ? 'rgba(45, 55, 72, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 3,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(156, 39, 176, 0.05)',
                  }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Unidad</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Valor mínimo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Valor máximo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Umbral crítico</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Umbral preventivo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variablesMemo.map(variable => (
                    <VariableRow
                      key={variable._id}
                      variable={variable}
                      onEdit={setEditingVar}
                      onDelete={handleDeleteVar}
                      isDarkMode={isDarkMode}
                      type="global"
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {tab === 1 && (
        <>
          {loadingEspecificas && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={60} />
            </Box>
          )}
          
          {errorEspecificas && <Alert severity="error" sx={{ mb: 3 }}>{errorEspecificas}</Alert>}

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateVarEspecifica(true)}>
              Agregar Variable Específica
            </Button>
          </Box>

          {/* Tabla de variables específicas */}
          <Card 
            sx={{ 
              background: isDarkMode
                ? 'rgba(45, 55, 72, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 3,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(33, 150, 243, 0.05)',
                  }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Unidad</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Valor mínimo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Valor máximo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Umbral crítico</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Umbral preventivo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Secretaría</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variablesEspecificasMemo.map(variable => (
                    <VariableRow
                      key={variable._id}
                      variable={variable}
                      onEdit={setEditingVarEspecifica}
                      onDelete={handleDeleteVarEspecifica}
                      isDarkMode={isDarkMode}
                      type="especifica"
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Dialog crear variable global */}
      <Dialog open={openCreateVar} onClose={handleCloseCreateVar} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreateVar}>
          <DialogTitle>Agregar Variable Global</DialogTitle>
          <DialogContent>
            <VariableForm values={newVar} onChange={updateNewVar} type="global" unidadOptions={unidadOptions} />
            {(
              newVar.flexible
                ? (newVar.valor_minimo && newVar.valor_maximo && newVar.umbral_critico_inferior && newVar.umbral_preventivo_inferior && newVar.umbral_preventivo_superior && newVar.umbral_critico_superior && !umbralesValidos(newVar))
                : (newVar.valor_minimo && newVar.valor_maximo && newVar.umbral_preventivo && newVar.umbral_critico && !umbralesValidos(newVar))
            ) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {newVar.flexible
                  ? 'Respetar: Min ≤ Crítico inf < Preventivo inf < Preventivo sup < Crítico sup ≤ Máx'
                  : 'Los umbrales deben cumplir: Mínimo < Crítico < Preventivo < Máximo'}
              </Alert>
            )}
            {createError && <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ width: '100%' }}>
              <Button onClick={handleCloseCreateVar}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={creating || !umbralesValidos(newVar)}>Guardar</Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog editar variable global */}
      <Dialog open={Boolean(editingVar)} onClose={() => setEditingVar(null)} fullWidth maxWidth="sm">
        {editingVar && (
          <Box component="form" onSubmit={handleEditVar}>
            <DialogTitle>Editar Variable Global</DialogTitle>
            <DialogContent>
              <VariableForm values={editingVar} onChange={updateEditingVar} type="global" unidadOptions={unidadOptions} />
              {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ width: '100%' }}>
                <Button onClick={() => setEditingVar(null)}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={savingEdit || !umbralesValidos(editingVar)}>Guardar</Button>
              </Stack>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* Dialog crear variable específica */}
      <Dialog open={openCreateVarEspecifica} onClose={handleCloseCreateVarEspecifica} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreateVarEspecifica}>
          <DialogTitle>Agregar Variable Específica</DialogTitle>
          <DialogContent>
            <VariableForm
              values={newVarEspecifica}
              onChange={updateNewVarEspecifica}
              type="especifica"
              unidadOptions={unidadEspecificaOptions}
              secretariaOptions={secretariaOptions}
            />
            {createErrorEspecifica && <Alert severity="error" sx={{ mt: 2 }}>{createErrorEspecifica}</Alert>}
            {(
              newVarEspecifica.flexible
                ? (newVarEspecifica.valor_minimo && newVarEspecifica.valor_maximo && newVarEspecifica.umbral_critico_inferior && newVarEspecifica.umbral_preventivo_inferior && newVarEspecifica.umbral_preventivo_superior && newVarEspecifica.umbral_critico_superior && !umbralesValidos(newVarEspecifica))
                : (newVarEspecifica.valor_minimo && newVarEspecifica.valor_maximo && newVarEspecifica.umbral_preventivo && newVarEspecifica.umbral_critico && !umbralesValidos(newVarEspecifica))
            ) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {newVarEspecifica.flexible
                  ? 'Respetar: Min ≤ Crítico inf < Preventivo inf < Preventivo sup < Crítico sup ≤ Máx'
                  : 'Los umbrales deben cumplir: Mínimo < Crítico < Preventivo < Máximo'}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ width: '100%' }}>
              <Button onClick={handleCloseCreateVarEspecifica}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={creatingEspecifica || !umbralesValidos(newVarEspecifica) || !newVarEspecifica.secretaria || !newVarEspecifica.nombre.trim()}>Guardar</Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>

  {/* Dialog editar variable específica */}
      <Dialog open={Boolean(editingVarEspecifica)} onClose={() => setEditingVarEspecifica(null)} fullWidth maxWidth="sm">
        {editingVarEspecifica && (
          <Box component="form" onSubmit={handleEditVarEspecifica}>
            <DialogTitle>Editar Variable Específica</DialogTitle>
            <DialogContent>
              <VariableForm
                values={editingVarEspecifica}
                onChange={updateEditingVarEspecifica}
                type="especifica"
                unidadOptions={unidadEspecificaOptions}
                secretariaOptions={secretariaOptions}
              />
              {editErrorEspecifica && <Alert severity="error" sx={{ mt: 2 }}>{editErrorEspecifica}</Alert>}
            </DialogContent>
            <DialogActions>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ width: '100%' }}>
                <Button onClick={() => setEditingVarEspecifica(null)}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={savingEditEspecifica || !umbralesValidos(editingVarEspecifica)}>Guardar</Button>
              </Stack>
            </DialogActions>
          </Box>
        )}
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
    </AdminSectionLayout>
  );
};

export default memo(GestionVariablesPage);