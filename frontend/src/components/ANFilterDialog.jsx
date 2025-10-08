import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";

const Column = ({
  title,
  options,
  selectedSet,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <Button size="small" variant="outlined" onClick={onSelectAll}>
          Seleccionar todas
        </Button>
        <Button size="small" variant="outlined" onClick={onDeselectAll}>
          Deseleccionar todas
        </Button>
        <Typography variant="caption" sx={{ alignSelf: "center", ml: 1 }}>
          {selectedSet.size} seleccionadas
        </Typography>
      </Box>
      <Box sx={{ maxHeight: 260, overflowY: "auto" }}>
        {options.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                size="small"
                checked={selectedSet.has(opt)}
                onChange={() => onToggle(opt)}
              />
            }
            label={opt}
          />
        ))}
      </Box>
    </Box>
  );
};

const ANFilterDialog = ({
  open,
  onClose,
  onConfirm,
  situacionesOptions,
  secretariasOptions,
  initialSituaciones = [],
  initialSecretarias = [],
}) => {
  const [sitSet, setSitSet] = useState(new Set(initialSituaciones));
  const [secSet, setSecSet] = useState(new Set(initialSecretarias));

  useEffect(() => {
    if (open) {
      setSitSet(new Set(initialSituaciones));
      setSecSet(new Set(initialSecretarias));
    }
  }, [open, initialSituaciones, initialSecretarias]);

  const toggleSit = useCallback((v) => {
    setSitSet((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }, []);
  const toggleSec = useCallback((v) => {
    setSecSet((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }, []);

  const selectAllSit = () => setSitSet(new Set(situacionesOptions));
  const deselectAllSit = () => setSitSet(new Set());
  const selectAllSec = () => setSecSet(new Set(secretariasOptions));
  const deselectAllSec = () => setSecSet(new Set());

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.({ situaciones: Array.from(sitSet), secretarias: Array.from(secSet) });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configurar Filtros de Comparación</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selecciona las Situaciones de Revista y Secretarías a incluir. Si no seleccionas ninguna, se incluirán todas.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Column
              title="Situación de Revista"
              options={situacionesOptions}
              selectedSet={sitSet}
              onToggle={toggleSit}
              onSelectAll={selectAllSit}
              onDeselectAll={deselectAllSit}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Column
              title="Secretaría"
              options={secretariasOptions}
              selectedSet={secSet}
              onToggle={toggleSec}
              onSelectAll={selectAllSec}
              onDeselectAll={deselectAllSec}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Procesar (Ctrl+Enter)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ANFilterDialog;

