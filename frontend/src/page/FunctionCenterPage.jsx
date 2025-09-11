import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";
import AdminSectionLayout from "../components/AdminSectionLayout.jsx";
import chartConfigService from "../services/chartConfigService.js";

const FunctionCenterPage = () => {
  const { isDarkMode } = useTheme();
  const [configs, setConfigs] = useState([]);
  const [options, setOptions] = useState({
    plantillas: [],
    groupFields: [],
    measures: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadConfigs = async () => {
    try {
      const res = await chartConfigService.getAllChartConfigs();
      setConfigs(res.data);
    } catch (err) {
      setError("Error al cargar configuraciones");
    }
  };

  const loadOptions = async () => {
    try {
      const res = await chartConfigService.getChartConfigOptions();
      setOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadConfigs(), loadOptions()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setCurrent(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (current && current._id) {
        await chartConfigService.updateChartConfig(current._id, current);
      } else {
        await chartConfigService.createChartConfig(current);
      }
      await loadConfigs();
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar configuración?")) return;
    try {
      await chartConfigService.deleteChartConfig(id);
      loadConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const renderDialog = () => (
    <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {current && current._id
          ? "Editar Configuración"
          : "Nueva Configuración"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          label="Nombre"
          fullWidth
          value={current?.nombre || ""}
          onChange={(e) => setCurrent({ ...current, nombre: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Título"
          fullWidth
          value={current?.titulo || ""}
          onChange={(e) => setCurrent({ ...current, titulo: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Tipo de gráfico"
          fullWidth
          value={current?.tipo || ""}
          onChange={(e) => setCurrent({ ...current, tipo: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="plantillas-label">Plantillas</InputLabel>
          <Select
            labelId="plantillas-label"
            multiple
            value={current?.plantillas || []}
            onChange={(e) =>
              setCurrent({ ...current, plantillas: e.target.value })
            }
            renderValue={(selected) => selected.join(", ")}
          >
            {options.plantillas.map((p) => (
              <MenuItem key={p} value={p}>
                <Checkbox checked={current?.plantillas?.indexOf(p) > -1} />
                <ListItemText primary={p} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Agrupar por"
          select
          fullWidth
          value={current?.groupBy || ""}
          onChange={(e) => setCurrent({ ...current, groupBy: e.target.value })}
        >
          {options.groupFields.map((g) => (
            <MenuItem key={g} value={g}>
              {g}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin="dense"
          label="Medida"
          select
          fullWidth
          value={current?.measure || ""}
          onChange={(e) => setCurrent({ ...current, measure: e.target.value })}
        >
          {options.measures.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin="dense"
          label="Sección"
          fullWidth
          value={current?.section || ""}
          onChange={(e) => setCurrent({ ...current, section: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );

  return (
    <AdminSectionLayout title="Centro de Funciones">
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<icons.agregar />}
          onClick={() => {
            setCurrent({ plantillas: [] });
            setDialogOpen(true);
          }}
        >
          Nueva Configuración
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: isDarkMode ? "#424242" : "#fff" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Agrupar por</TableCell>
              <TableCell>Medida</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.titulo}</TableCell>
                <TableCell>{c.tipo}</TableCell>
                <TableCell>{c.groupBy}</TableCell>
                <TableCell>{c.measure}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setCurrent(c);
                      setDialogOpen(true);
                    }}
                  >
                    <icons.editar fontSize="small" />
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(c._id)}
                  >
                    <icons.eliminar fontSize="small" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderDialog()}
    </AdminSectionLayout>
  );
};

export default FunctionCenterPage;
