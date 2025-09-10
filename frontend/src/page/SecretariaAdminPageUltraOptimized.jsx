import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import apiClient from "../services/api";
import {
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Snackbar,
  Tooltip,
  Pagination,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FixedSizeList as List } from "react-window";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  OptimizedTextField,
  OptimizedCheckbox,
  useOptimizedForm,
} from "../components/OptimizedFormField.jsx";

const ROW_HEIGHT = 56;

// Componente de fila memoizado para evitar re-renders
const SecretariaRow = memo(
  ({ secretaria, onEdit, onDelete, getNombrePadre, isDarkMode, style }) => {
    const handleEdit = useCallback(
      () => onEdit(secretaria),
      [onEdit, secretaria],
    );
    const handleDelete = useCallback(
      () => onDelete(secretaria._id),
      [onDelete, secretaria._id],
    );

    return (
      <TableRow
        style={style}
        sx={{
          "&:hover": {
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(76, 175, 80, 0.05)",
          },
          transition: "background-color 0.15s ease",
        }}
      >
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                background: "linear-gradient(135deg, #4caf50, #388e3c)",
              }}
            >
              <BusinessIcon sx={{ fontSize: 12 }} />
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {secretaria.nombre}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{secretaria.codigo}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {getNombrePadre(secretaria.idPadre)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {secretaria.orden !== undefined ? secretaria.orden : "-"}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={secretaria.activo !== false ? "Activo" : "Desactivado"}
            size="small"
            sx={{
              background:
                secretaria.activo !== false
                  ? "linear-gradient(135deg, #4caf50, #388e3c)"
                  : "linear-gradient(135deg, #f44336, #d32f2f)",
              color: "white",
              fontWeight: 500,
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Editar">
              <Button
                size="small"
                variant="outlined"
                onClick={handleEdit}
                sx={{
                  minWidth: "auto",
                  p: 1,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(76, 175, 80, 0.5)",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(76, 175, 80, 0.15)",
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(76, 175, 80, 0.8)",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
            <Tooltip title="Eliminar">
              <Button
                size="small"
                variant="outlined"
                onClick={handleDelete}
                sx={{
                  minWidth: "auto",
                  p: 1,
                  color: "#f44336",
                  borderColor: "rgba(244, 67, 54, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.15)",
                    borderColor: "rgba(244, 67, 54, 0.8)",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    );
  },
);

const SecretariaAdminPageUltraOptimized = () => {
  const { isDarkMode } = useTheme();

  // Estados principales
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados de edición
  const [editingSec, setEditingSec] = useState(null);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Estado para dependencias padre
  const [allDeps, setAllDeps] = useState([]);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Formulario optimizado para nueva secretaría
  const {
    values: newSec,
    updateValue: updateNewSec,
    reset: resetNewSec,
    validate: validateNewSec,
  } = useOptimizedForm({
    nombre: "",
    descripcion: "",
    idPadre: "",
    orden: "",
    activo: true,
    funcion: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Callbacks optimizados
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch optimizado con AbortController
  const fetchSecretarias = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    try {
      const { data } = await apiClient.get("/dependencies", {
        signal: controller.signal,
      });
      setSecretarias(data);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError("Error al cargar secretarías");
        showSnackbar("Error al cargar secretarías", "error");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [showSnackbar]);

  const fetchAllDeps = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/dependencies");
      setAllDeps(data);
    } catch (err) {
      console.error("Error al cargar dependencias:", err);
    }
  }, []);

  useEffect(() => {
    const cleanup = fetchSecretarias();
    fetchAllDeps();
    return cleanup;
  }, [fetchSecretarias, fetchAllDeps]);

  // Función para calcular nivel (memoizada)
  const getNivel = useCallback(
    (idPadre) => {
      if (!idPadre) return 1;
      const padre = allDeps.find((d) => d._id === idPadre);
      return padre ? (padre.nivel || 1) + 1 : 1;
    },
    [allDeps],
  );

  // Función para obtener nombre del padre (memoizada)
  const getNombrePadre = useCallback(
    (idPadre) => {
      if (!idPadre) return "Raíz";
      const padre = allDeps.find((dep) => dep._id === idPadre);
      return padre ? padre.nombre : "No encontrado";
    },
    [allDeps],
  );

  // Handler optimizado para crear secretaría
  const handleCreateSec = useCallback(
    async (e) => {
      e.preventDefault();

      // Validación
      const isValid = validateNewSec({
        nombre: { required: true, minLength: 2 },
        funcion: { maxLength: 500 },
      });

      if (!isValid) return;

      setCreating(true);
      setCreateError("");

      try {
        const payload = {
          ...newSec,
          idPadre: newSec.idPadre === "" ? null : newSec.idPadre,
          nivel: getNivel(newSec.idPadre),
          orden: newSec.orden !== "" ? Number(newSec.orden) : 999,
          activo: newSec.activo !== false,
        };

        await apiClient.post("/dependencies", payload);

        resetNewSec();
        await Promise.all([fetchSecretarias(), fetchAllDeps()]);
        showSnackbar("Dependencia creada correctamente", "success");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al crear dependencia";
        setCreateError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setCreating(false);
      }
    },
    [
      newSec,
      getNivel,
      validateNewSec,
      resetNewSec,
      fetchSecretarias,
      fetchAllDeps,
      showSnackbar,
    ],
  );

  // Handler optimizado para eliminar
  const handleDeleteSec = useCallback(
    async (id) => {
      if (!window.confirm("¿Seguro que deseas eliminar esta secretaría?"))
        return;

      try {
        await apiClient.delete(`/dependencies/${id}`);
        await Promise.all([fetchSecretarias(), fetchAllDeps()]);
        showSnackbar("Secretaría eliminada", "success");
      } catch (err) {
        showSnackbar("Error al eliminar secretaría", "error");
      }
    },
    [fetchSecretarias, fetchAllDeps, showSnackbar],
  );

  // Handler optimizado para editar
  const handleEditSec = useCallback(
    async (e) => {
      e.preventDefault();
      setSavingEdit(true);
      setEditError("");

      try {
        const payload = {
          ...editingSec,
          idPadre: editingSec.idPadre === "" ? null : editingSec.idPadre,
          nivel: getNivel(editingSec.idPadre),
          orden: editingSec.orden !== "" ? Number(editingSec.orden) : 999,
          activo: editingSec.activo !== false,
        };

        await apiClient.put(`/dependencies/${editingSec._id}`, payload);
        setEditingSec(null);
        await Promise.all([fetchSecretarias(), fetchAllDeps()]);
        showSnackbar("Dependencia editada correctamente", "success");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al editar dependencia";
        setEditError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setSavingEdit(false);
      }
    },
    [editingSec, getNivel, fetchSecretarias, fetchAllDeps, showSnackbar],
  );

  // Datos paginados (memoizados)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return secretarias.slice(startIndex, endIndex);
  }, [secretarias, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(secretarias.length / itemsPerPage);

  // Opciones para select de dependencias padre (memoizadas)
  const parentOptions = useMemo(
    () => [
      { value: "", label: "(Raíz / Secretaría principal)" },
      ...allDeps.map((dep) => ({
        value: dep._id,
        label: `${dep.nombre} (${dep.codigo})`,
      })),
    ],
    [allDeps],
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        p: 4,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)",
        borderRadius: 3,
        minHeight: "80vh",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, #4caf50, #388e3c)",
          }}
        >
          <AccountTreeIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
          }}
        >
          Gestión de Secretarías
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulario de creación optimizado */}
      {!editingSec && (
        <Card
          sx={{
            mb: 4,
            background: isDarkMode
              ? "rgba(45, 55, 72, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #4caf50, #388e3c)",
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Agregar nueva dependencia
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleCreateSec}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "flex-end",
              }}
            >
              <OptimizedTextField
                name="nombre"
                label="Nombre"
                value={newSec.nombre}
                onChange={updateNewSec}
                required
                sx={{ minWidth: 250 }}
              />

              <OptimizedTextField
                name="funcion"
                label="¿Qué función cumple?"
                value={newSec.funcion}
                onChange={updateNewSec}
                multiline
                maxRows={2}
                sx={{ minWidth: 300 }}
              />

              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Pertenece a:</InputLabel>
                <Select
                  value={newSec.idPadre || ""}
                  label="Pertenece a:"
                  onChange={(e) => updateNewSec("idPadre", e.target.value)}
                >
                  {parentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <OptimizedTextField
                name="orden"
                label="Posición"
                type="number"
                value={newSec.orden}
                onChange={updateNewSec}
                sx={{ minWidth: 120 }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={creating}
                startIcon={
                  creating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  background: "linear-gradient(45deg, #4caf50, #388e3c)",
                  color: "white",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 120,
                  "&:hover": {
                    background: "linear-gradient(45deg, #388e3c, #2e7d32)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                {creating ? "Agregando..." : "Agregar"}
              </Button>
            </Box>
            {createError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createError}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabla optimizada */}
      <Card
        sx={{
          background: isDarkMode
            ? "rgba(45, 55, 72, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: 3,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(76, 175, 80, 0.05)",
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Código
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Pertenece a
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Posición
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <List
              height={Math.min(400, paginatedData.length * ROW_HEIGHT)}
              itemCount={paginatedData.length}
              itemSize={ROW_HEIGHT}
              width="100%"
              outerElementType={React.forwardRef((props, ref) => (
                <TableBody {...props} ref={ref} />
              ))}
            >
              {({ index, style }) => (
                <SecretariaRow
                  key={paginatedData[index]._id}
                  secretaria={paginatedData[index]}
                  onEdit={setEditingSec}
                  onDelete={handleDeleteSec}
                  getNombrePadre={getNombrePadre}
                  isDarkMode={isDarkMode}
                  style={style}
                />
              )}
            </List>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Información de registros */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Mostrando {paginatedData.length} de {secretarias.length} registros
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(SecretariaAdminPageUltraOptimized);
