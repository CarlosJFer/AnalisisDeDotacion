import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  DialogContentText,
  Typography,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";
import apiClient from "../services/api";

const DeleteDashboardDialog = ({ isOpen, onClose, onDelete }) => {
  const { isDarkMode } = useTheme();
  const modules = useMemo(
    () => ["Planta y Contratos", "Neikes y Becas", "Expedientes", "SAC"],
    [],
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
          : [...prev, module],
      );
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await apiClient.delete("/admin/dashboard", {
        data: { modules: selected },
      });
      onDelete && onDelete("Módulos eliminados correctamente");
    } catch {
      onDelete && onDelete("Error al eliminar datos");
    } finally {
      setLoading(false);
      onClose();
    }
  }, [selected, onClose, onDelete]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: isDarkMode ? "#1e293b" : "#f8fafc" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Borrar datos del dashboard
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Selecciona los módulos cuyos datos deseas eliminar.
        </DialogContentText>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ bgcolor: "transparent" }}>
          {modules.map((module) => (
            <ListItem key={module} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(module)}
                    onChange={handleToggle(module)}
                  />
                }
                label={<Typography>{module}</Typography>}
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
        >
          {loading ? <CircularProgress size={24} /> : <icons.eliminar />}
          {loading ? " Borrando..." : " Borrar datos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDashboardDialog;
