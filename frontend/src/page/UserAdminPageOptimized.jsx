import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { FixedSizeList as List } from "react-window";
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
  Avatar,
  Chip,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  OptimizedTextField,
  OptimizedSelect,
  useOptimizedForm,
} from "../components/OptimizedFormField.jsx";

const ROW_HEIGHT = 56;

// Componente de fila de usuario memoizado
const UserRow = memo(
  ({ user, onEdit, onDelete, onChangePassword, isDarkMode, style }) => {
    const handleEdit = useCallback(() => onEdit(user), [onEdit, user]);
    const handleDelete = useCallback(
      () => onDelete(user._id),
      [onDelete, user._id],
    );
    const handleChangePassword = useCallback(
      () => onChangePassword(user),
      [onChangePassword, user],
    );

    return (
      <TableRow
        style={style}
        sx={{
          "&:hover": {
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(33, 150, 243, 0.05)",
          },
          transition: "background-color 0.15s ease",
        }}
      >
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background:
                  user.role === "admin"
                    ? "linear-gradient(135deg, #ff9800, #f57c00)"
                    : "linear-gradient(135deg, #2196f3, #1976d2)",
              }}
            >
              {user.role === "admin" ? (
                <icons.admin sx={{ fontSize: 18 }} />
              ) : (
                <icons.persona sx={{ fontSize: 18 }} />
              )}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {user.username}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{user.email}</Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={user.role === "admin" ? "Administrador" : "Usuario"}
            size="small"
            sx={{
              background:
                user.role === "admin"
                  ? "linear-gradient(135deg, #ff9800, #f57c00)"
                  : "linear-gradient(135deg, #2196f3, #1976d2)",
              color: "white",
              fontWeight: 500,
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                    : "rgba(33, 150, 243, 0.5)",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(33, 150, 243, 0.15)",
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(33, 150, 243, 0.8)",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <icons.editar sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
            <Tooltip title="Cambiar contraseña">
              <Button
                size="small"
                variant="outlined"
                onClick={handleChangePassword}
                sx={{
                  minWidth: "auto",
                  p: 1,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(156, 39, 176, 0.5)",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(156, 39, 176, 0.15)",
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(156, 39, 176, 0.8)",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                🔑
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
                <icons.eliminar sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    );
  },
);

const UserAdminPageOptimized = () => {
  const { isDarkMode } = useTheme();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados de edición
  const [editingUser, setEditingUser] = useState(null);
  const [changingPassword, setChangingPassword] = useState(null);

  // Formulario optimizado para nuevo usuario
  const {
    values: newUser,
    updateValue: updateNewUser,
    reset: resetNewUser,
    validate: validateNewUser,
    errors: newUserErrors,
  } = useOptimizedForm({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  // Formulario optimizado para editar usuario
  const {
    values: editUser,
    updateValue: updateEditUser,
    reset: resetEditUser,
    validate: validateEditUser,
    errors: editUserErrors,
  } = useOptimizedForm({
    username: "",
    email: "",
    role: "user",
  });

  // Formulario optimizado para cambiar contraseña
  const {
    values: passwordForm,
    updateValue: updatePasswordForm,
    reset: resetPasswordForm,
    validate: validatePasswordForm,
    errors: passwordErrors,
  } = useOptimizedForm({
    newPassword: "",
    confirmPassword: "",
  });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Callbacks optimizados
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch optimizado
  const fetchUsers = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    try {
      const { data } = await apiClient.get("/users", {
        signal: controller.signal,
      });
      setUsers(data);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError("Error al cargar usuarios");
        showSnackbar("Error al cargar usuarios", "error");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [showSnackbar]);

  useEffect(() => {
    const cleanup = fetchUsers();
    return cleanup;
  }, [fetchUsers]);

  // Handler optimizado para crear usuario
  const handleCreateUser = useCallback(
    async (e) => {
      e.preventDefault();

      const isValid = validateNewUser({
        username: { required: true, minLength: 3 },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Email inválido",
        },
        password: { required: true, minLength: 6 },
        role: { required: true },
      });

      if (!isValid) return;

      setCreating(true);

      try {
        await apiClient.post("/users", newUser);
        resetNewUser();
        await fetchUsers();
        showSnackbar("Usuario creado correctamente", "success");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al crear usuario";
        showSnackbar(errorMessage, "error");
      } finally {
        setCreating(false);
      }
    },
    [newUser, validateNewUser, resetNewUser, fetchUsers, showSnackbar],
  );

  // Handler optimizado para editar usuario
  const handleEditUser = useCallback(
    async (e) => {
      e.preventDefault();

      const isValid = validateEditUser({
        username: { required: true, minLength: 3 },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Email inválido",
        },
        role: { required: true },
      });

      if (!isValid) return;

      setEditing(true);

      try {
        await apiClient.put(`/users/${editingUser._id}`, editUser);
        setEditingUser(null);
        resetEditUser();
        await fetchUsers();
        showSnackbar("Usuario editado correctamente", "success");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al editar usuario";
        showSnackbar(errorMessage, "error");
      } finally {
        setEditing(false);
      }
    },
    [
      editUser,
      editingUser,
      validateEditUser,
      resetEditUser,
      fetchUsers,
      showSnackbar,
    ],
  );

  // Handler optimizado para cambiar contraseña
  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault();

      const isValid = validatePasswordForm({
        newPassword: { required: true, minLength: 6 },
        confirmPassword: { required: true },
      });

      if (!isValid) return;

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showSnackbar("Las contraseñas no coinciden", "error");
        return;
      }

      setChangingPass(true);

      try {
        await apiClient.put(`/users/${changingPassword._id}/password`, {
          newPassword: passwordForm.newPassword,
        });
        setChangingPassword(null);
        resetPasswordForm();
        showSnackbar("Contraseña cambiada correctamente", "success");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al cambiar contraseña";
        showSnackbar(errorMessage, "error");
      } finally {
        setChangingPass(false);
      }
    },
    [
      passwordForm,
      changingPassword,
      validatePasswordForm,
      resetPasswordForm,
      showSnackbar,
    ],
  );

  // Handler optimizado para eliminar usuario
  const handleDeleteUser = useCallback(
    async (id) => {
      if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

      try {
        await apiClient.delete(`/users/${id}`);
        await fetchUsers();
        showSnackbar("Usuario eliminado", "success");
      } catch (err) {
        showSnackbar("Error al eliminar usuario", "error");
      }
    },
    [fetchUsers, showSnackbar],
  );

  // Handlers para abrir modales de edición
  const handleOpenEdit = useCallback(
    (user) => {
      setEditingUser(user);
      updateEditUser("username", user.username);
      updateEditUser("email", user.email);
      updateEditUser("role", user.role);
    },
    [updateEditUser],
  );

  const handleOpenChangePassword = useCallback(
    (user) => {
      setChangingPassword(user);
      resetPasswordForm();
    },
    [resetPasswordForm],
  );

  // Opciones para select de rol (memoizadas)
  const roleOptions = useMemo(
    () => [
      { value: "user", label: "Usuario" },
      { value: "admin", label: "Administrador" },
    ],
    [],
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
        maxWidth: 1200,
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
            background: "linear-gradient(135deg, #2196f3, #1976d2)",
          }}
        >
          <icons.personas sx={{ fontSize: 24 }} />
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
          Gestión de Usuarios
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulario de creación optimizado */}
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
                background: "linear-gradient(135deg, #2196f3, #1976d2)",
              }}
            >
              <icons.agregar sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Crear nuevo usuario
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleCreateUser}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "flex-end",
            }}
          >
            <OptimizedTextField
              name="username"
              label="Nombre de usuario"
              value={newUser.username}
              onChange={updateNewUser}
              required
              sx={{ minWidth: 200 }}
            />

            <OptimizedTextField
              name="email"
              label="Email"
              type="email"
              value={newUser.email}
              onChange={updateNewUser}
              required
              sx={{ minWidth: 250 }}
            />

            <OptimizedTextField
              name="password"
              label="Contraseña"
              type="password"
              value={newUser.password}
              onChange={updateNewUser}
              required
              sx={{ minWidth: 200 }}
            />

            <OptimizedSelect
              name="role"
              label="Rol"
              value={newUser.role}
              onChange={updateNewUser}
              options={roleOptions}
              required
              sx={{ minWidth: 150 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              startIcon={
                creating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <icons.agregar />
                )
              }
              sx={{
                background: "linear-gradient(45deg, #2196f3, #1976d2)",
                color: "white",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                minWidth: 120,
                "&:hover": {
                  background: "linear-gradient(45deg, #1976d2, #1565c0)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.15s ease",
              }}
            >
              {creating ? "Creando..." : "Crear"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
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
                    : "rgba(33, 150, 243, 0.05)",
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Rol
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <List
              height={Math.min(400, users.length * ROW_HEIGHT)}
              itemCount={users.length}
              itemSize={ROW_HEIGHT}
              width="100%"
              outerElementType={React.forwardRef((props, ref) => (
                <TableBody {...props} ref={ref} />
              ))}
            >
              {({ index, style }) => (
                <UserRow
                  key={users[index]._id}
                  user={users[index]}
                  style={style}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteUser}
                  onChangePassword={handleOpenChangePassword}
                  isDarkMode={isDarkMode}
                />
              )}
            </List>
          </Table>
        </TableContainer>
      </Card>

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

export default memo(UserAdminPageOptimized);
