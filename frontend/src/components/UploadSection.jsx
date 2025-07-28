import React, { useState, useCallback, memo } from 'react';
import { Box, Typography, Card, CardContent, Button, LinearProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Avatar, Chip, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';

// Componente de archivo memoizado
const FileItem = memo(({ file, index, onRemove, uploading, uploadProgress, isDarkMode }) => {
  const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <ListItem 
      sx={{
        background: isDarkMode 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.7)',
        borderRadius: 1,
        mb: 1,
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        transition: 'background-color 0.15s ease',
      }}
      secondaryAction={
        !uploading && (
          <IconButton 
            edge="end" 
            onClick={handleRemove}
            sx={{
              color: '#f44336',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
              },
              transition: 'all 0.15s ease',
            }}
          >
            <DeleteIcon />
          </IconButton>
        )
      }
    >
      <Avatar sx={{ 
        mr: 2, 
        width: 32, 
        height: 32,
        background: 'linear-gradient(135deg, #4caf50, #388e3c)',
      }}>
        <InsertDriveFileIcon sx={{ fontSize: 16 }} />
      </Avatar>
      <ListItemText 
        primary={
          <Typography variant="body2" fontWeight={500}>
            {file.name}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip 
              label={formatFileSize(file.size)}
              size="small"
              sx={{ 
                height: 20, 
                fontSize: '0.7rem',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            />
            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress || 0} 
                  sx={{ width: 80, height: 4 }}
                />
                <Typography variant="caption">
                  {uploadProgress || 0}%
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  );
});

const UploadSection = () => {
  const { isDarkMode } = useTheme();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Callbacks optimizados
  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError('');
    setSuccess('');
  }, []);

  const removeFile = useCallback((indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleOpenConfirm = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleUpload = useCallback(async () => {
    setConfirmOpen(false);
    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('archivo', file);
    });

    try {
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const resultados = response.data.resultados || [];
      const msg = resultados.map(r => {
        if (r.error) return `❌ ${r.archivo}: ${r.error}`;
        return `✔️ ${r.archivo} (${r.secretaria || ''}): ${r.totalRegistros} registros procesados.`;
      }).join('\n');

      setSuccess(msg);
      setSnackbar({ open: true, message: '¡Archivos procesados exitosamente!', severity: 'success' });
      setFiles([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al subir los archivos.';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [files]);

  return (
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
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            background: 'linear-gradient(135deg, #ff9800, #f57c00)',
          }}>
            <CloudUploadIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 600,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            }}
          >
            Cargar y Procesar Archivos de Dotación
          </Typography>
        </Box>

        <Typography 
          variant="body2" 
          sx={{
            mb: 3,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
            lineHeight: 1.6,
          }}
        >
          Sube uno o varios archivos .xls o .xlsx para actualizar los datos de análisis de todas las secretarías.
        </Typography>

        {/* Área de selección de archivos optimizada */}
        <Box 
          sx={{
            border: `2px dashed ${isDarkMode ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.5)'}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 3,
            background: isDarkMode 
              ? 'rgba(255, 152, 0, 0.05)' 
              : 'rgba(255, 152, 0, 0.02)',
            transition: 'all 0.15s ease', // Transición más rápida
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.7)',
              background: isDarkMode 
                ? 'rgba(255, 152, 0, 0.1)' 
                : 'rgba(255, 152, 0, 0.05)',
            }
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: isDarkMode ? 'rgba(255, 152, 0, 0.7)' : 'rgba(255, 152, 0, 0.8)',
              mb: 2 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
            }}
          >
            Arrastra archivos aquí o haz clic para seleccionar
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            }}
          >
            Formatos soportados: .xls, .xlsx
          </Typography>
          <Button 
            variant="contained" 
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #f57c00, #ef6c00)',
                transform: 'translateY(-1px)', // Reducido movimiento
              },
              transition: 'all 0.15s ease', // Transición más rápida
            }}
          >
            Seleccionar Archivos
            <input 
              type="file" 
              hidden 
              accept=".xls,.xlsx" 
              multiple 
              onChange={handleFileChange} 
            />
          </Button>
        </Box>

        {/* Lista de archivos optimizada */}
        {files.length > 0 && (
          <Card 
            sx={{ 
              mb: 3,
              background: isDarkMode 
                ? 'rgba(255, 152, 0, 0.1)' 
                : 'rgba(255, 152, 0, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.3)'}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}
              >
                Archivos seleccionados ({files.length})
              </Typography>
              <List dense>
                {files.map((file, idx) => (
                  <FileItem
                    key={`${file.name}-${idx}`}
                    file={file}
                    index={idx}
                    onRemove={removeFile}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Botón de carga optimizado */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleOpenConfirm} 
            disabled={files.length === 0 || uploading}
            startIcon={<CloudUploadIcon />}
            sx={{
              background: files.length > 0 && !uploading
                ? 'linear-gradient(45deg, #4caf50, #388e3c)'
                : 'rgba(0, 0, 0, 0.12)',
              color: files.length > 0 && !uploading ? 'white' : 'rgba(0, 0, 0, 0.26)',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              minWidth: 200,
              '&:hover': files.length > 0 && !uploading ? {
                background: 'linear-gradient(45deg, #388e3c, #2e7d32)',
                transform: 'translateY(-1px)',
              } : {},
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
              transition: 'all 0.15s ease',
            }}
          >
            {uploading ? `Procesando... ${uploadProgress}%` : 'Subir y Procesar'}
          </Button>
        </Box>

        {/* Diálogo de confirmación optimizado */}
        <Dialog 
          open={confirmOpen} 
          onClose={handleCloseConfirm}
          PaperProps={{
            sx: {
              background: isDarkMode
                ? 'rgba(45, 55, 72, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              background: 'linear-gradient(135deg, #ff9800, #f57c00)',
            }}>
              <CloudUploadIcon sx={{ fontSize: 18 }} />
            </Avatar>
            ¿Confirmar carga?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              ¿Estás seguro que deseas cargar {files.length} archivo(s)?
            </Typography>
            <List dense>
              {files.slice(0, 5).map((file, idx) => ( // Limitamos a 5 para mejor rendimiento
                <ListItem key={`confirm-${file.name}-${idx}`}>
                  <Avatar sx={{ 
                    mr: 2, 
                    width: 24, 
                    height: 24,
                    background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                  }}>
                    <InsertDriveFileIcon sx={{ fontSize: 12 }} />
                  </Avatar>
                  <ListItemText 
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                </ListItem>
              ))}
              {files.length > 5 && (
                <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                  +{files.length - 5} archivos más...
                </Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCloseConfirm}
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #f57c00, #ef6c00)',
                },
              }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alertas de resultado optimizadas */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: 2,
              background: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)'}`,
            }}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mt: 3,
              borderRadius: 2,
              background: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`,
            }}
            icon={<CheckCircleIcon />}
          >
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-line' }}>
              {success}
            </Typography>
          </Alert>
        )}

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default memo(UploadSection);