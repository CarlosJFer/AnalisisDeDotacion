import React, { useState, useCallback, memo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import icons from "../ui/icons.js";
import { modeVars } from "../ui";
import { useTheme } from "../context/ThemeContext.jsx";
import apiClient from "../services/api";
import templateService from "../services/templateService";

const FileItem = memo(
  ({
    file,
    index,
    onRemove,
    uploading,
    uploadProgress,
    isDarkMode,
    templates,
    onTemplateChange,
    selectedTemplate,
  }) => {
    const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);

    const formatFileSize = useCallback((bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }, []);

    return (
      <ListItem
        sx={{
          background: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.7)",
          borderRadius: 1,
          mb: 1,
          border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
          transition: "background-color 0.15s ease",
        }}
        secondaryAction={
          !uploading && (
            <IconButton
              edge="end"
              aria-label="eliminar archivo"
              onClick={handleRemove}
              sx={{
                color: "#f44336",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                },
                transition: "all 0.15s ease",
              }}
            >
              <icons.eliminar aria-hidden="true" />
            </IconButton>
          )
        }
      >
        <Avatar
          sx={{
            mr: 2,
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #4caf50, #388e3c)",
          }}
        >
          <icons.archivo sx={{ fontSize: 16 }} aria-hidden="true" />
        </Avatar>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight={500}>
              {file.name}
            </Typography>
          }
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, ml: 1 }}>
          <Chip
            label={formatFileSize(file.size)}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              background: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
            }}
          />
          {uploading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
              <LinearProgress variant="determinate" value={uploadProgress || 0} sx={{ width: 80, height: 4 }} />
              <Typography variant="caption">{uploadProgress || 0}%</Typography>
            </Box>
          )}
        </Box>
        {!uploading && templates.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel id={`template-select-label-${index}`}>Plantilla</InputLabel>
            <Select
              labelId={`template-select-label-${index}`}
              id={`template-select-${index}`}
              value={selectedTemplate || ""}
              label="Plantilla"
              onChange={(e) => onTemplateChange(index, e.target.value)}
            >
              {templates.map((tpl) => (
                <MenuItem key={tpl._id} value={tpl._id}>
                  {tpl.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </ListItem>
    );
  },
);

const ANUploadSection = () => {
  const { isDarkMode } = useTheme();
  const vars = modeVars(isDarkMode);

  const [files, setFiles] = useState([]);
  const [fileTemplates, setFileTemplates] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [templates, setTemplates] = useState([]);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileTemplates((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  }, []);

  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  }, []);

  const handleOpenConfirm = useCallback(() => {
    if (files.length === 0) {
      setSnackbar({ open: true, message: "Debes seleccionar al menos un archivo.", severity: "error" });
      return;
    }
    setConfirmOpen(true);
  }, [files]);

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateService.getAllTemplates();
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setSnackbar({ open: true, message: "Error al cargar las plantillas.", severity: "error" });
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = useCallback((fileIndex, templateId) => {
    setFileTemplates((prev) => ({ ...prev, [fileIndex]: templateId }));
  }, []);

  const handleUpload = useCallback(async () => {
    setConfirmOpen(false);

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("archivos", file);
      if (fileTemplates[index]) {
        formData.append(`template_${index}`, fileTemplates[index]);
      }
    });

    try {
      const response = await apiClient.post(
        "/tools/agrupamiento-niveles/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        },
      );

      const resultados = response.data.resultados || [];
      const msg = resultados
        .map((r) => {
          if (r.error) {
            let detalle = r.detalle ? `\nDetalle: ${r.detalle}` : "";
            return `Error ${r.archivo}: ${r.error}${detalle}`;
          }
          return `OK ${r.archivo}: ${r.totalRegistros} registros procesados.`;
        })
        .join("\n");

      setSuccess(msg);
      setSnackbar({ open: true, message: "Archivos procesados exitosamente!", severity: "success" });
      setFiles([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al subir los archivos.";
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [files, fileTemplates]);

  return (
    <Card
      sx={{
        background: isDarkMode ? "rgba(45, 55, 72, 0.8)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 32, height: 32, background: "linear-gradient(135deg, #ff9800, #f57c00)" }}>
            <icons.subir sx={{ fontSize: 18 }} aria-hidden="true" />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Carga de Archivos Excel (Agrupamiento y Niveles)
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
          Sube uno o varios archivos .xls o .xlsx para actualizar exclusivamente los datos de “Agrupamiento y Niveles”.
          Esta carga no afectará los dashboard generales.
        </Typography>

        <Box
          sx={{
            border: `2px dashed ${isDarkMode ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 152, 0, 0.4)"}`,
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            mb: 3,
            background: isDarkMode ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 152, 0, 0.05)",
          }}
        >
          <icons.subir
            sx={{
              fontSize: 48,
              color: isDarkMode ? "rgba(255, 152, 0, 0.7)" : "rgba(255, 152, 0, 0.8)",
              mb: 2,
            }}
            aria-hidden="true"
          />
          <Typography variant="h6" sx={{ mb: 1, color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
            Arrastra archivos aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Formatos soportados: .xls, .xlsx
          </Typography>
          <label htmlFor="an-file-upload-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<icons.subir aria-hidden="true" />}
              sx={{
                background: "linear-gradient(45deg, #ff9800, #f57c00)",
                color: vars["--text-color"],
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                "&:hover": { background: "linear-gradient(45deg, #f57c00, #ef6c00)", transform: "translateY(-1px)" },
                transition: "all 0.15s ease",
              }}
            >
              Seleccionar Archivos
            </Button>
            <input
              id="an-file-upload-input"
              name="an-file-upload-input"
              type="file"
              hidden
              accept=".xls,.xlsx"
              multiple
              onChange={handleFileChange}
            />
          </label>
        </Box>

        {files.length > 0 && (
          <Card sx={{ mb: 3, background: isDarkMode ? "rgba(255,152,0,0.1)" : "rgba(255,152,0,0.05)", border: `1px solid ${isDarkMode ? "rgba(255,152,0,0.2)" : "rgba(255,152,0,0.3)"}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: isDarkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)" }}>
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
                    templates={templates}
                    selectedTemplate={fileTemplates[idx]}
                    onTemplateChange={handleTemplateChange}
                  />
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleOpenConfirm}
            disabled={files.length === 0 || uploading}
            sx={{
              background: "linear-gradient(45deg, #ff9800, #f57c00)",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              "&:hover": { background: "linear-gradient(45deg, #f57c00, #ef6c00)" },
              boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
            }}
          >
            {uploading ? `Procesando... ${uploadProgress}%` : "Procesar archivos"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            disabled={files.length === 0 || uploading}
            onClick={() => {
              setFiles([]);
              setFileTemplates({});
              setUploadProgress(0);
            }}
          >
            Limpiar
          </Button>
        </Box>

        <Dialog open={confirmOpen} onClose={handleCloseConfirm} fullWidth maxWidth="xs">
          <DialogTitle>Confirmar carga</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              ¿Deseas procesar los archivos seleccionados para “Agrupamiento y Niveles”? Esta acción no modificará los
              dashboards generales.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="inherit">Cancelar</Button>
            <Button onClick={handleUpload} variant="contained" color="primary">Confirmar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {success}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(ANUploadSection);
