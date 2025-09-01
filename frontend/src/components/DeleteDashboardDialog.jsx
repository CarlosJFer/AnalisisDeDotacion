import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../services/api';

const DeleteDashboardDialog = ({ isOpen, onClose, onDelete }) => {
  const modules = useMemo(
    () => ['Planta y Contratos', 'Neikes y Becas', 'Expedientes', 'SAC'],
    []
  );
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setSelected([]);
  }, [isOpen]);

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
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await apiClient.delete('/admin/dashboard', { data: { modules: selected } });
      onDelete && onDelete('Módulos eliminados correctamente');
    } catch {
      onDelete && onDelete('Error al eliminar datos');
    } finally {
      setLoading(false);
      onClose();
    }
  }, [selected, onClose, onDelete]);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>Selecciona los módulos a borrar</DialogTitle>
      <Divider />
      <DialogContent>
        <List sx={{ bgcolor: 'background.default' }}>
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
          startIcon={
            loading ? <CircularProgress size={16} /> : <DeleteIcon />
          }
        >
          {loading ? 'Borrando...' : 'Borrar datos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDashboardDialog;

