import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import apiClient from '../services/api';

const DeleteDashboardDialog = ({ open, onClose, onDeleted }) => {
  const modules = useMemo(
    () => ['Planta y Contratos', 'Neikes y Becas', 'Expedientes', 'SAC'],
    []
  );
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(
    (module) => () => {
      setSelected((prev) =>
        prev.includes(module)
          ? prev.filter((m) => m !== module)
          : [...prev, module]
      );
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.post('/admin/limpiar-dashboard', { modules: selected });
      onDeleted && onDeleted('Se eliminaron los módulos seleccionados.');
    } catch {
      onDeleted && onDeleted('Error al limpiar el dashboard.');
    } finally {
      setLoading(false);
      onClose();
    }
  }, [selected, onClose, onDeleted]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecciona los módulos a borrar</DialogTitle>
      <DialogContent>
        <List>
          {modules.map((module) => (
            <ListItem key={module} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(module)}
                    onChange={handleToggle(module)}
                  />
                }
                label={module}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading || selected.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Eliminando...' : 'Confirmar eliminación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDashboardDialog;

