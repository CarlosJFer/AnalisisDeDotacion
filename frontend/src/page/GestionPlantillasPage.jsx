import React, { useState, useEffect, useCallback, lazy, Suspense, useTransition } from 'react';
import { Box, Button, Alert, CircularProgress, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTheme } from '../context/ThemeContext.jsx';
import templateService from '../services/templateService';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';
const TemplateModal = lazy(() => import('../components/TemplateModal.jsx'));
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
  const [confirm, setConfirm] = useState({ open: false, template: null });
  const [isPending, startTransition] = useTransition();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await templateService.getAllTemplates();
      startTransition(() => setTemplates(res.data || []));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Preload TemplateModal chunk when idle to improve first open latency
  useEffect(() => {
    const preload = () => import('../components/TemplateModal.jsx');
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 500);
    }
  }, []);

  const openCreate = useCallback(() => { setEditing(null); setModalOpen(true); }, []);
  const openEdit = useCallback((tpl) => { setEditing(tpl); setModalOpen(true); }, []);
  const closeModal = useCallback(() => {
    // Hacer el cierre no bloqueante para mejorar INP al cancelar
    startTransition(() => {
      setEditing(null);
      setModalOpen(false);
    });
  }, []);

  const handleSubmit = useCallback(async (form) => {
    try {
      setSaving(true);
      if (form._id) {
        const res = await templateService.updateTemplate(form._id, form);
        const updated = res?.data;
        startTransition(() => {
          setTemplates(prev => prev.map(t => (t._id === updated._id ? updated : t)));
        });
      } else {
        const res = await templateService.createTemplate(form);
        const created = res?.data;
        startTransition(() => {
          setTemplates(prev => [created, ...prev]);
        });
      }
      setSnack({ open: true, message: 'Plantilla guardada', severity: 'success' });
      closeModal();
    } catch (err) {
      setError(err?.message || 'Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  }, [closeModal]);

  const requestDelete = useCallback((tpl) => {
    setConfirm({ open: true, template: tpl, loading: false });
  }, []);

  const cancelDelete = useCallback(() => setConfirm({ open: false, template: null, loading: false }), []);

  const confirmDelete = useCallback(async () => {
    const tpl = confirm.template;
    if (!tpl) return cancelDelete();
    try {
      setConfirm(c => ({ ...c, loading: true }));
      await templateService.deleteTemplate(tpl._id);
      startTransition(() => {
        setTemplates(prev => prev.filter(t => t._id !== tpl._id));
      });
      setSnack({ open: true, message: 'Plantilla eliminada', severity: 'success' });
    } catch (err) {
      setError(err?.message || 'Error al eliminar la plantilla');
    } finally {
      cancelDelete();
    }
  }, [confirm, cancelDelete]);

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
        onDelete={requestDelete}
        isDarkMode={isDarkMode}
      />

      <Suspense fallback={<Box sx={{ display:'flex', justifyContent:'center', p:2 }}><CircularProgress size={20} /></Box>}>
        <TemplateModal
          key={editing ? editing._id : 'new'}
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialData={editing}
          isDarkMode={isDarkMode}
          saving={saving}
        />
      </Suspense>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        message={snack.message}
      />

      <Dialog open={confirm.open} onClose={confirm.loading ? undefined : cancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar plantilla</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar la plantilla "{confirm.template?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} variant="outlined" color="inherit" disabled={confirm.loading}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" disabled={confirm.loading}>
            {confirm.loading ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminSectionLayout>
  );
};

export default GestionPlantillasPage;
