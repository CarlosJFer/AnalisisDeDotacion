import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
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
  Grid, 
  IconButton, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext.jsx';
import templateService from '../services/templateService';

// --- Componente de Modal --- //
const TemplateModal = ({ isOpen, onClose, onSave, template, isDarkMode }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({ name: '', description: '', dataStartRow: 2, mappings: [] });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMappingChange = (index, field, value) => {
    const newMappings = [...formData.mappings];
    newMappings[index][field] = value;
    setFormData(prev => ({ ...prev, mappings: newMappings }));
  };

  const addMapping = () => {
    setFormData(prev => ({ 
      ...prev, 
      mappings: [...prev.mappings, { columnHeader: '', variableName: '', dataType: 'String' }] 
    }));
  };

  const removeMapping = (index) => {
    const newMappings = formData.mappings.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, mappings: newMappings }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: isDarkMode
            ? 'rgba(45, 55, 72, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700,
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
      }}>
        {template ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nombre"
                value={formData.name || ''}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descripción"
                value={formData.description || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="dataStartRow"
                label="Fila de Inicio de Datos"
                type="number"
                value={formData.dataStartRow || 2}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Mapeo de Columnas
              </Typography>
              
              {formData.mappings && formData.mappings.map((mapping, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Columna Excel"
                        placeholder="ej: 'A' o 'Nombre'"
                        value={mapping.columnHeader}
                        onChange={(e) => handleMappingChange(index, 'columnHeader', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Variable BD"
                        placeholder="ej: 'nombreCompleto'"
                        value={mapping.variableName}
                        onChange={(e) => handleMappingChange(index, 'variableName', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo de Dato</InputLabel>
                        <Select
                          value={mapping.dataType}
                          onChange={(e) => handleMappingChange(index, 'dataType', e.target.value)}
                          label="Tipo de Dato"
                        >
                          <MenuItem value="String">Texto</MenuItem>
                          <MenuItem value="Number">Número</MenuItem>
                          <MenuItem value="Date">Fecha</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <IconButton 
                        onClick={() => removeMapping(index)} 
                        color="error"
                        sx={{ 
                          background: 'rgba(244, 67, 54, 0.1)',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.2)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              
              <Button 
                onClick={addMapping} 
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Añadir Mapeo
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// --- Componente Principal de la Página --- //
const GestionPlantillasPage = () => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await templateService.getAllTemplates();
      setTemplates(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las plantillas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenModal = (template = null) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(false);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (templateData._id) {
        await templateService.updateTemplate(templateData._id, templateData);
      } else {
        await templateService.createTemplate(templateData);
      }
      fetchTemplates();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar la plantilla.');
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      try {
        await templateService.deleteTemplate(id);
        fetchTemplates();
      } catch (err) {
        setError('Error al eliminar la plantilla.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        p: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{
              fontWeight: 700,
              mb: 1,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            }}
          >
            Gestión de Plantillas
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
            }}
          >
            Administra las plantillas de importación de Excel
          </Typography>
        </Box>
        <Button 
          onClick={() => handleOpenModal()}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(45deg, #2196f3, #1976d2)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Crear Nueva Plantilla
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Templates Table */}
      <Card sx={{ 
        background: isDarkMode
          ? 'rgba(45, 55, 72, 0.8)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                  Descripción
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                  Fila de Inicio
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow 
                  key={template._id}
                  sx={{
                    '&:hover': {
                      background: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    fontWeight: 600,
                  }}>
                    {template.name}
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  }}>
                    {template.description}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={template.dataStartRow}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleOpenModal(template)}
                        size="small"
                        sx={{
                          color: '#2196f3',
                          '&:hover': {
                            background: 'rgba(33, 150, 243, 0.1)',
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteTemplate(template._id)}
                        size="small"
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal */}
      <TemplateModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTemplate} 
        template={selectedTemplate}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
};

export default GestionPlantillasPage;