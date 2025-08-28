import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Alert, CircularProgress, Snackbar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTheme } from '../context/ThemeContext.jsx';
import templateService from '../services/templateService';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';
import TemplateModal from '../components/TemplateModal.jsx';
import TemplatesTable from '../components/TemplatesTable.jsx';

// Página de gestión de plantillas: listar, crear, editar, eliminar
const GestionPlantillasPage = () => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await templateService.getAllTemplates();
      setTemplates(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (tpl) => { setEditing(tpl); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (form) => {
    try {
      setSaving(true);
      if (form._id) await templateService.updateTemplate(form._id, form);
      else await templateService.createTemplate(form);
      await fetchTemplates();
      setSnack({ open: true, message: 'Plantilla guardada', severity: 'success' });
      closeModal();
    } catch (err) {
      setError(err?.message || 'Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tpl) => {
    const confirm = window.confirm(`¿Estás seguro de eliminar la plantilla "${tpl.name}"?`);
    if (!confirm) return;
    try {
      await templateService.deleteTemplate(tpl._id);
      await fetchTemplates();
      setSnack({ open: true, message: 'Plantilla eliminada', severity: 'success' });
    } catch (err) {
      setError(err?.message || 'Error al eliminar la plantilla');
    }
  };

  if (loading && templates.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AdminSectionLayout
      title="Gestión de Plantillas"
      description="Administra las plantillas de importación de Excel"
      icon={DescriptionIcon}
      color="#00bcd4"
      maxWidth={1200}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          onClick={openCreate}
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
            '&:hover': { background: 'linear-gradient(45deg, #1976d2, #1565c0)', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)' },
            transition: 'all 0.3s ease',
          }}
        >
          Crear Nueva Plantilla
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TemplatesTable
        templates={templates}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        isDarkMode={isDarkMode}
      />

      <TemplateModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editing}
        isDarkMode={isDarkMode}
        saving={saving}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        message={snack.message}
      />
    </AdminSectionLayout>
  );
};

export default GestionPlantillasPage;

