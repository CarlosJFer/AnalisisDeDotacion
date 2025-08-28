import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Card,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Reusable modal for creating/updating import templates with client-side validations
const DATA_TYPES = ['String', 'Number', 'Date', 'Time'];

function validate(form) {
  const errors = { mappings: [] };
  if (!form.name || !String(form.name).trim()) {
    errors.name = 'El nombre es obligatorio';
  }
  const row = Number(form.dataStartRow);
  if (!Number.isInteger(row) || row < 1) {
    errors.dataStartRow = 'Debe ser un entero ≥ 1';
  }
  if (!Array.isArray(form.mappings) || form.mappings.length === 0) {
    errors.mappingsGeneral = 'Agrega al menos un mapeo';
  } else {
    form.mappings.forEach((m, i) => {
      const me = {};
      if (!m.columnHeader || !String(m.columnHeader).trim()) me.columnHeader = 'Obligatorio';
      if (!m.variableName || !String(m.variableName).trim()) me.variableName = 'Obligatorio';
      if (!m.dataType || !DATA_TYPES.includes(m.dataType)) me.dataType = 'Tipo inválido';
      errors.mappings[i] = me;
    });
  }
  return errors;
}

const TemplateModal = ({ open, onClose, onSubmit, initialData, isDarkMode, saving = false }) => {
  const [form, setForm] = useState({ name: '', description: '', sheetName: '', dataStartRow: 2, mappings: [] });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        _id: initialData._id,
        name: initialData.name || '',
        description: initialData.description || '',
        sheetName: initialData.sheetName || '',
        dataStartRow: initialData.dataStartRow ?? 2,
        mappings: Array.isArray(initialData.mappings) ? initialData.mappings.map(m => ({
          columnHeader: m.columnHeader || '',
          variableName: m.variableName || '',
          dataType: m.dataType || 'String',
        })) : [],
      });
    } else {
      setForm({ name: '', description: '', sheetName: '', dataStartRow: 2, mappings: [] });
    }
    setTouched({});
  }, [initialData]);

  const errors = useMemo(() => validate(form), [form]);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const handleMappingChange = (idx, field, value) => {
    setForm(prev => {
      const next = [...prev.mappings];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, mappings: next };
    });
  };

  const addMapping = () => setForm(prev => ({
    ...prev,
    mappings: [...prev.mappings, { columnHeader: '', variableName: '', dataType: 'String' }]
  }));

  const removeMapping = (idx) => setForm(prev => ({
    ...prev,
    mappings: prev.mappings.filter((_, i) => i !== idx)
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ all: true });
    const hasFieldErrors = errors.name || errors.dataStartRow || errors.mappingsGeneral || (errors.mappings || []).some(m => Object.keys(m || {}).length);
    if (hasFieldErrors) return;
    onSubmit?.(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
        {form._id ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Nombre"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                fullWidth
                required
                error={Boolean(touched.all && errors.name)}
                helperText={touched.all && errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sheetName"
                label="Nombre de la hoja (opcional)"
                value={form.sheetName}
                onChange={(e) => setField('sheetName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descripción"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dataStartRow"
                label="Fila de inicio de datos"
                type="number"
                value={form.dataStartRow}
                onChange={(e) => setField('dataStartRow', e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                error={Boolean(touched.all && errors.dataStartRow)}
                helperText={touched.all && errors.dataStartRow}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Mapeo de columnas
              </Typography>
              {touched.all && errors.mappingsGeneral && (
                <Typography color="error" sx={{ mb: 1 }}>{errors.mappingsGeneral}</Typography>
              )}
              {form.mappings.map((mapping, idx) => {
                const me = errors.mappings[idx] || {};
                return (
                  <Card key={idx} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Columna Excel"
                          placeholder="ej: 'A' o 'Nombre'"
                          value={mapping.columnHeader}
                          onChange={(e) => handleMappingChange(idx, 'columnHeader', e.target.value)}
                          fullWidth
                          size="small"
                          error={Boolean(touched.all && me.columnHeader)}
                          helperText={touched.all && me.columnHeader}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Variable BD"
                          placeholder="ej: 'nombreCompleto'"
                          value={mapping.variableName}
                          onChange={(e) => handleMappingChange(idx, 'variableName', e.target.value)}
                          fullWidth
                          size="small"
                          error={Boolean(touched.all && me.variableName)}
                          helperText={touched.all && me.variableName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small" error={Boolean(touched.all && me.dataType)}>
                          <InputLabel>Tipo de dato</InputLabel>
                          <Select
                            value={mapping.dataType}
                            onChange={(e) => handleMappingChange(idx, 'dataType', e.target.value)}
                            label="Tipo de dato"
                          >
                            {DATA_TYPES.map(dt => (
                              <MenuItem key={dt} value={dt}>{dt}</MenuItem>
                            ))}
                          </Select>
                          {touched.all && me.dataType && <FormHelperText>{me.dataType}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <IconButton onClick={() => removeMapping(idx)} color="error" sx={{
                          background: 'rgba(244, 67, 54, 0.1)', '&:hover': { background: 'rgba(244, 67, 54, 0.2)' }
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
              <Button onClick={addMapping} startIcon={<AddIcon />} variant="outlined" sx={{ mt: 2 }}>
                Añadir mapeo
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={saving ? <CircularProgress size={18} /> : null}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TemplateModal;

