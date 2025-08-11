import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';

const FunctionCenterPage = () => {
  const { isDarkMode } = useTheme();
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadFunctions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/functions');
      setFunctions(res.data);
    } catch (err) {
      setError('Error al cargar funciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunctions();
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setCurrent(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (current && current._id) {
        await apiClient.put(`/functions/${current._id}`, current);
      } else {
        await apiClient.post('/functions', current);
      }
      handleClose();
      loadFunctions();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar función?')) return;
    try {
      await apiClient.delete(`/functions/${id}`);
      loadFunctions();
    } catch (err) {
      console.error(err);
    }
  };

  const renderDialog = () => (
    <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{current && current._id ? 'Editar Función' : 'Nueva Función'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Nombre"
          fullWidth
          value={current?.name || ''}
          onChange={(e) => setCurrent({ ...current, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Endpoint"
          fullWidth
          value={current?.endpoint || ''}
          onChange={(e) => setCurrent({ ...current, endpoint: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Descripción"
          fullWidth
          multiline
          minRows={3}
          value={current?.description || ''}
          onChange={(e) => setCurrent({ ...current, description: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  return (
    <AdminSectionLayout title="Centro de Funciones">
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCurrent({}); setDialogOpen(true); }}>
          Nueva Función
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: isDarkMode ? '#424242' : '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {functions.map((f) => (
              <TableRow key={f._id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.endpoint}</TableCell>
                <TableCell>{f.description}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => { setCurrent(f); setDialogOpen(true); }}><EditIcon fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(f._id)}><DeleteIcon fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderDialog()}
    </AdminSectionLayout>
  );
};

export default FunctionCenterPage;
