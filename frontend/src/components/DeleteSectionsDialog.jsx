import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useTheme } from "../context/ThemeContext.jsx";
import icons from "../ui/icons.js";
import apiClient from "../services/api";

// Generic dialog to delete selected dashboard sections (by plantilla names)
const DeleteSectionsDialog = ({
  isOpen,
  onClose,
  sections = [], // [{ id, label, plantillas: [] }]
  title = "Borrar datos del dashboard",
  description = "Selecciona las secciones cuyos datos deseas eliminar.",
  onDeleted,
}) => {
  const { isDarkMode } = useTheme();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setSelected([]);
  }, [isOpen]);

  const byId = useMemo(() => {
    const map = new Map();
    for (const s of sections) map.set(s.id, s);
    return map;
  }, [sections]);

  const handleToggle = useCallback(
    (id) => () => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!selected.length) return;
    const plantillas = selected.flatMap((id) => byId.get(id)?.plantillas || []);
    if (!plantillas.length) return;
    setLoading(true);
    try {
      await apiClient.delete("/admin/dashboard/sections", {
        data: { plantillas },
      });
      onDeleted && onDeleted("Secciones eliminadas correctamente");
    } catch (err) {
      onDeleted && onDeleted("Error al eliminar datos");
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  }, [selected, byId, onClose, onDeleted]);

  return (
    <Dialog
      open={!!isOpen}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: isDarkMode ? "#1e293b" : "#f8fafc" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ bgcolor: "transparent" }}>
          {sections.map((s) => (
            <ListItem key={s.id} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onChange={handleToggle(s.id)}
                    disabled={loading}
                  />
                }
                label={<Typography>{s.label}</Typography>}
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

export default DeleteSectionsDialog;

