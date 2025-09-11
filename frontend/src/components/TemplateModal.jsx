import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  useTransition,
} from "react";
import { FixedSizeList as List } from "react-window";
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
  Box,
} from "@mui/material";
import icons from "../ui/icons.js";

// Reusable modal for creating/updating import templates with client-side validations
const DATA_TYPES = ["String", "Number", "Date", "Time"];

function validate(form) {
  const errors = { mappings: [] };
  if (!form.name || !String(form.name).trim()) {
    errors.name = "El nombre es obligatorio";
  }
  const row = Number(form.dataStartRow);
  if (!Number.isInteger(row) || row < 1) {
    errors.dataStartRow = "Debe ser un entero ≥ 1";
  }
  if (form.dataEndRow !== undefined && form.dataEndRow !== "") {
    const end = Number(form.dataEndRow);
    if (!Number.isInteger(end) || end < row) {
      errors.dataEndRow = "Debe ser un entero ≥ fila inicio";
    }
  }
  if (!Array.isArray(form.mappings) || form.mappings.length === 0) {
    errors.mappingsGeneral = "Agrega al menos un mapeo";
  } else {
    form.mappings.forEach((m, i) => {
      const me = {};
      if (!m.columnHeader || !String(m.columnHeader).trim())
        me.columnHeader = "Obligatorio";
      if (!m.variableName || !String(m.variableName).trim())
        me.variableName = "Obligatorio";
      if (!m.dataType || !DATA_TYPES.includes(m.dataType))
        me.dataType = "Tipo inválido";
      errors.mappings[i] = me;
    });
  }
  return errors;
}

const TemplateModal = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isDarkMode,
  saving = false,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    dataStartRow: 2,
    dataEndRow: undefined,
    mappings: [],
  });
  const [touched, setTouched] = useState({});
  const [initializing, setInitializing] = useState(false);
  const [debouncedForm, setDebouncedForm] = useState(form);
  const [isPendingAdd, startTransitionAdd] = useTransition();

  useEffect(() => {
    // Re-initialize form every time the modal opens
    if (!open) return;
    setInitializing(true);
    if (initialData) {
      setForm({
        _id: initialData._id,
        name: initialData.name || "",
        description: initialData.description || "",
        dataStartRow: initialData.dataStartRow ?? 2,
        dataEndRow: initialData.dataEndRow,
        mappings: Array.isArray(initialData.mappings)
          ? initialData.mappings.map((m) => ({
              columnHeader: m.columnHeader || "",
              variableName: m.variableName || "",
              dataType: m.dataType || "String",
            }))
          : [],
      });
    } else {
      setForm({
        name: "",
        description: "",
        dataStartRow: 2,
        dataEndRow: undefined,
        mappings: [],
      });
    }
    setTouched({});
    const id = setTimeout(() => setInitializing(false), 0);
    return () => clearTimeout(id);
  }, [initialData, open]);

  // Debounce validation to avoid heavy sync work on each keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebouncedForm(form), 200);
    return () => clearTimeout(id);
  }, [form]);

  const errors = useMemo(() => validate(debouncedForm), [debouncedForm]);

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleMappingChange = useCallback((idx, field, value) => {
    setForm((prev) => {
      const next = [...prev.mappings];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, mappings: next };
    });
  }, []);

  const addMapping = () => {
    startTransitionAdd(() => {
      setForm((prev) => ({
        ...prev,
        mappings: [
          ...prev.mappings,
          { columnHeader: "", variableName: "", dataType: "String" },
        ],
      }));
    });
  };

  const removeMapping = useCallback(
    (idx) =>
      setForm((prev) => ({
        ...prev,
        mappings: prev.mappings.filter((_, i) => i !== idx),
      })),
    [],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ all: true });
    const nowErrors = validate(form);
    const hasFieldErrors =
      nowErrors.name ||
      nowErrors.dataStartRow ||
      nowErrors.dataEndRow ||
      nowErrors.mappingsGeneral ||
      (nowErrors.mappings || []).some((m) => Object.keys(m || {}).length);
    if (hasFieldErrors) return;
    onSubmit?.(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      keepMounted
      PaperProps={{
        sx: {
          background: isDarkMode
            ? "rgba(45, 55, 72, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
        }}
      >
        {form._id ? "Editar Plantilla" : "Crear Nueva Plantilla"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {initializing ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Cargando formulario…</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nombre de la plantilla"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  fullWidth
                  required
                  // single line, más ancho y menos alto
                  error={Boolean(touched.all && errors.name)}
                  helperText={touched.all && errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
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
                  onChange={(e) =>
                    setField(
                      "dataStartRow",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  error={Boolean(touched.all && errors.dataStartRow)}
                  helperText={touched.all && errors.dataStartRow}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="dataEndRow"
                  label="Fila de fin de datos"
                  type="number"
                  value={form.dataEndRow ?? ""}
                  onChange={(e) =>
                    setField(
                      "dataEndRow",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  fullWidth
                  inputProps={{ min: 1 }}
                  error={Boolean(touched.all && errors.dataEndRow)}
                  helperText={
                    touched.all && errors.dataEndRow
                      ? errors.dataEndRow
                      : "Opcional. Dejar en blanco para leer hasta el final"
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Mapeo de columnas
                </Typography>
                {touched.all && errors.mappingsGeneral && (
                  <Typography color="error" sx={{ mb: 1 }}>
                    {errors.mappingsGeneral}
                  </Typography>
                )}
                {form.mappings.length > 40 ? (
                  <Box
                    sx={{
                      height: Math.min(form.mappings.length, 6) * 120,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <List
                      height={Math.min(form.mappings.length, 6) * 120}
                      itemCount={form.mappings.length}
                      itemSize={120}
                      width="100%"
                    >
                      {({ index, style }) => (
                        <Box style={style}>
                          <MappingRow
                            key={index}
                            mapping={form.mappings[index]}
                            idx={index}
                            errorsRow={errors.mappings[index] || {}}
                            showErrors={Boolean(touched.all)}
                            onChange={handleMappingChange}
                            onRemove={removeMapping}
                          />
                        </Box>
                      )}
                    </List>
                  </Box>
                ) : (
                  form.mappings.map((mapping, idx) => (
                    <MappingRow
                      key={idx}
                      mapping={mapping}
                      idx={idx}
                      errorsRow={errors.mappings[idx] || {}}
                      showErrors={Boolean(touched.all)}
                      onChange={handleMappingChange}
                      onRemove={removeMapping}
                    />
                  ))
                )}
                <Button
                  onClick={addMapping}
                  startIcon={<icons.agregar />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  disabled={isPendingAdd}
                >
                  {isPendingAdd ? "Añadiendo…" : "Añadir mapeo"}
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : null}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const MappingRow = memo(function MappingRow({
  mapping,
  idx,
  errorsRow,
  onChange,
  onRemove,
  showErrors,
}) {
  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Columna Excel"
            placeholder="ej: 'A' o 'Nombre'"
            value={mapping.columnHeader}
            onChange={(e) => onChange(idx, "columnHeader", e.target.value)}
            fullWidth
            size="small"
            error={Boolean(showErrors && errorsRow?.columnHeader)}
            helperText={showErrors ? errorsRow?.columnHeader : ""}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Variable BD"
            placeholder="ej: 'nombreCompleto'"
            value={mapping.variableName}
            onChange={(e) => onChange(idx, "variableName", e.target.value)}
            fullWidth
            size="small"
            error={Boolean(showErrors && errorsRow?.variableName)}
            helperText={showErrors ? errorsRow?.variableName : ""}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl
            fullWidth
            size="small"
            error={Boolean(showErrors && errorsRow?.dataType)}
          >
            <InputLabel>Tipo de dato</InputLabel>
            <Select
              value={mapping.dataType}
              onChange={(e) => onChange(idx, "dataType", e.target.value)}
              label="Tipo de dato"
            >
              {DATA_TYPES.map((dt) => (
                <MenuItem key={dt} value={dt}>
                  {dt}
                </MenuItem>
              ))}
            </Select>
            {showErrors && errorsRow?.dataType && (
              <FormHelperText>{errorsRow.dataType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <IconButton
            onClick={() => onRemove(idx)}
            color="error"
            sx={{
              background: "rgba(244, 67, 54, 0.1)",
              "&:hover": { background: "rgba(244, 67, 54, 0.2)" },
            }}
          >
            <icons.eliminar />
          </IconButton>
        </Grid>
      </Grid>
    </Card>
  );
});

export default TemplateModal;
